package internal

import (
	"context"
	"errors"
	"fmt"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
)

type Dish struct {
	Id            *int                `json:"id"`
	Image         *string             `json:"imageUrl"`
	ThreeDObj     *string             `json:"link3d"`
	Price         *float64            `json:"price"`
	Available     *bool               `json:"available"`
	CreatedAt     *time.Time          `json:"createdAt"`
	UpdatedAt     *time.Time          `json:"updatedAt"`
	Localizations []*DishLocalization `json:"localizations,omitempty"`
}

type DishLocalization struct {
	Id          *int    `json:"id"`
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Lang        *string `json:"lang"`
	DishId      *int    `json:"dishId"`
}

type DishRepo struct {
	Pool *pgxpool.Pool
}

func (r *DishRepo) CreateDish(d *Dish, menus []*Menu, restaurant *Restaurant, localizations []*DishLocalization) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return err
	}

	query := "INSERT INTO dishes (image, three_d_obj, price, available, created_at, updated_at) VALUES ($1, $2, $3, $4, default, default) RETURNING id;"

	err = tx.QueryRow(ctx, query, d.Image, d.ThreeDObj, d.Price, d.Available).Scan(&d.Id)
	if err != nil {
		tx.Rollback(ctx)
		return err
	}

	if len(localizations) > 0 {
		rows := make([][]interface{}, len(localizations))
		for i, localization := range localizations {
			rows[i] = []interface{}{d.Id, localization.Title, localization.Description, localization.Lang}
		}
		copyCount, err := tx.CopyFrom(ctx, pgx.Identifier{"dishes_localizations"}, []string{"dish_id", "title", "description", "lang"}, pgx.CopyFromRows(rows))
		if err != nil {
			tx.Rollback(ctx)
			return err
		}
		if copyCount != int64(len(localizations)) {
			tx.Rollback(ctx)
			return errors.New("failed to copy all rows")
		}
	}

	if len(menus) > 0 {
		rows := make([][]interface{}, len(menus))
		for i, menu := range menus {
			rows[i] = []interface{}{d.Id, menu.Id}
		}
		copyCount, err := tx.CopyFrom(ctx, pgx.Identifier{"dish_menu"}, []string{"dish_id", "menu_id"}, pgx.CopyFromRows(rows))
		if err != nil {
			tx.Rollback(ctx)
			return err
		}
		if copyCount != int64(len(menus)) {
			tx.Rollback(ctx)
			return errors.New("failed to copy all rows")
		}
	}

	if restaurant != nil {
		query := "INSERT INTO restaurant_dishes (dish_id, restaurant_uuid) VALUES ($1, $2);"
		_, err = tx.Exec(ctx, query, d.Id, restaurant.UUID)
		if err != nil {
			fmt.Println(err)
			tx.Rollback(ctx)
			return err
		}
	}

	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return err
	}

	return nil
}

func (r *DishRepo) GetDishById(restaurantUUID *string, dishId *int) (*Dish, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	dish := &Dish{}

	query := "SELECT d.id AS dish_id, d.image, d.three_d_obj, d.price FROM dishes d JOIN dish_menu dm ON dm.dish_id = d.id JOIN restaurant_menu rm ON rm.id = dm.menu_id JOIN restaurants r ON r.uuid = rm.restaurant_uuid WHERE d.id = $1 AND r.uuid = $2;"

	err = tx.QueryRow(ctx, query, dishId, restaurantUUID).
		Scan(&dish.Id, &dish, &dish.Image, &dish.ThreeDObj, &dish.Price)

	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}

	query = "SELECT dl.id AS dish_localization_id, dl.title, dl.description, dl.lang FROM dishes_localizations dl WHERE dl.dish_id = $1;"
	var localizations []*DishLocalization
	rows, err := tx.Query(ctx, query, dishId)
	defer rows.Close()
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	var l DishLocalization
	_, err = pgx.ForEachRow(rows, []any{&l.Id, &l.Title, &l.Description, &l.Lang}, func() error {
		localizations = append(localizations, &DishLocalization{
			Id:          l.Id,
			Title:       l.Title,
			Description: l.Description,
			Lang:        l.Lang,
			DishId:      l.DishId,
		})
		return nil
	})

	err = tx.Commit(ctx)
	if err != nil {
		return nil, err
	}
	if dish.Price != nil {
		*dish.Price = *dish.Price / 100
	}

	dish.Localizations = localizations
	return dish, nil

}

func (r *DishRepo) GetDishesPagination(restaurantUUID *string, page *int, elements *int) ([]*Dish, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	query := "SELECT d.id AS dish_id, d.image, d.three_d_obj, d.price, d.available, d.created_at, d.updated_at FROM dishes d JOIN dish_menu dm ON dm.dish_id = d.id JOIN restaurant_menu rm ON rm.id = dm.menu_id JOIN restaurants r ON r.uuid = rm.restaurant_uuid WHERE r.uuid = $1 ORDER BY d.id LIMIT $2 OFFSET $3;"

	rows, err := tx.Query(ctx, query, restaurantUUID, *elements, (*page-1)**elements)
	defer rows.Close()
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}

	var d Dish
	var dishes []*Dish
	_, err = pgx.ForEachRow(rows, []any{&d.Id, &d.Image, &d.ThreeDObj, &d.Price, &d.Available, &d.CreatedAt, &d.UpdatedAt}, func() error {
		if d.Price != nil {
			*d.Price = *d.Price / 100
		}
		temp := &Dish{
			Id:        d.Id,
			Image:     d.Image,
			ThreeDObj: d.ThreeDObj,
			Price:     d.Price,
			Available: d.Available,
			CreatedAt: d.CreatedAt,
			UpdatedAt: d.UpdatedAt,
		}
		localizations, err := r.GetDishLocalizations(d.Id)
		if err != nil {
			return err
		}
		temp.Localizations = localizations
		dishes = append(dishes, temp)
		return nil
	})

	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		return nil, err
	}
	return dishes, nil
}

func (r *DishRepo) GetDishesByMenuNameAndRestaurantUUID(menuName *string, restaurantUUID *string) ([]*Dish, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	query := "SELECT d.id AS dish_id, d.image, d.three_d_obj, d.price, d.available, d.created_at, d.updated_at FROM dishes d JOIN dish_menu dm ON dm.dish_id = d.id JOIN restaurant_menu rm ON rm.id = dm.menu_id WHERE (rm.nameru = $1 OR rm.nameen = $1 OR rm.namekz = $1) AND rm.restaurant_uuid = $2;"

	rows, err := tx.Query(ctx, query, menuName, restaurantUUID)
	defer rows.Close()
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}

	var d Dish
	var dishes []*Dish
	_, err = pgx.ForEachRow(rows, []any{&d.Id, &d.Image, &d.ThreeDObj, &d.Price, &d.Available, &d.CreatedAt, &d.UpdatedAt}, func() error {
		if d.Price != nil {
			*d.Price = *d.Price / 100
		}
		localizations, err := r.GetDishLocalizations(d.Id)
		if err != nil {
			return err
		}
		dishes = append(dishes, &Dish{
			Id:            d.Id,
			Image:         d.Image,
			ThreeDObj:     d.ThreeDObj,
			Price:         d.Price,
			Available:     d.Available,
			CreatedAt:     d.CreatedAt,
			UpdatedAt:     d.UpdatedAt,
			Localizations: localizations,
		})
		return nil
	})

	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		return nil, err
	}
	return dishes, nil
}

func (r *DishRepo) DeleteDish(dishId *int) (*Dish, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	_, err = tx.Exec(ctx, "DELETE FROM dish_menu WHERE dish_id = $1", dishId)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}

	_, err = tx.Exec(ctx, "DELETE FROM restaurant_dishes WHERE dish_id = $1", dishId)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}

	_, err = tx.Exec(ctx, "DELETE FROM dishes_localizations WHERE dish_id = $1", dishId)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}

	var d Dish
	err = tx.QueryRow(ctx, "DELETE FROM dishes WHERE id = $1 RETURNING *", dishId).Scan(&d.Id, &d.Image, &d.ThreeDObj, &d.Price, &d.Available, &d.CreatedAt, &d.UpdatedAt)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}

	err = tx.Commit(ctx)
	if err != nil {
		return nil, err
	}
	return &d, nil
}

func (r *DishRepo) GetDishesWithoutCategory(restaurantUUID *string, page, elements *int) ([]*Dish, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	limit := *elements
	offset := (*page - 1) * limit
	query := "SELECT d.id, image, three_d_obj, price, available, created_at, updated_at FROM dishes d JOIN restaurant_dishes rd ON d.id = rd.dish_id WHERE rd.restaurant_uuid = $1 ORDER BY d.created_at DESC LIMIT $2 OFFSET $3;"

	var dishes []*Dish
	rows, err := tx.Query(ctx, query, restaurantUUID, limit, offset)
	defer rows.Close()
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}

	var d Dish

	_, err = pgx.ForEachRow(rows, []any{&d.Id, &d.Image, &d.ThreeDObj, &d.Price, &d.Available, &d.CreatedAt, &d.UpdatedAt}, func() error {
		if d.Price != nil {
			*d.Price = *d.Price / 100
		}
		localizations, err := r.GetDishLocalizations(d.Id)
		if err != nil {
			fmt.Println(err)
			return err
		}
		dishes = append(dishes, &Dish{
			Id:            d.Id,
			Image:         d.Image,
			ThreeDObj:     d.ThreeDObj,
			Price:         d.Price,
			Available:     d.Available,
			CreatedAt:     d.CreatedAt,
			UpdatedAt:     d.UpdatedAt,
			Localizations: localizations,
		})
		return nil
	})

	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		return nil, err
	}
	return dishes, nil
}

func (r *DishRepo) GetDishLocalizations(dishId *int) ([]*DishLocalization, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	query := "SELECT * FROM dishes_localizations WHERE dish_id = $1;"

	var localizations []*DishLocalization
	rows, err := tx.Query(ctx, query, dishId)
	defer rows.Close()
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}

	var d DishLocalization

	_, err = pgx.ForEachRow(rows, []any{&d.Id, &d.Title, &d.Description, &d.Lang, &d.DishId}, func() error {
		localizations = append(localizations, &DishLocalization{
			Id:          d.Id,
			Title:       d.Title,
			Description: d.Description,
			Lang:        d.Lang,
			DishId:      d.DishId,
		})
		return nil
	})

	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		return nil, err
	}
	return localizations, nil
}
