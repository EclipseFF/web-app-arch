package internal

import (
	"context"
	"errors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
)

type Restaurant struct {
	UUID           *string `json:"uuid"`
	Name           *string `json:"name" form:"name"`
	Translation    *string `json:"translation" form:"translation"`
	Description    *string `json:"description" form:"description"`
	LogoImage      *string `json:"logo_image"`
	PrimaryColor   *string `json:"primary_color" form:"primary_color"`
	SecondaryColor *string `json:"secondary_color" form:"secondary_color"`
	Address        *string `json:"address" form:"address"`
}

type RestaurantRepo struct {
	Pool *pgxpool.Pool
}

func (r *RestaurantRepo) CreateRestaurant(rst *Restaurant, userID *int) (*Restaurant, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	query := "INSERT INTO restaurants (uuid, name, translation, description, logo_image, primary_color, secondary_color, address) VALUES (default, $1, $2, $3, $4, $5, $6, $7) RETURNING uuid, name, translation, description, logo_image, primary_color, secondary_color, address;"

	err = tx.QueryRow(ctx, query, rst.Name, rst.Translation, rst.Description, rst.LogoImage, rst.PrimaryColor, rst.SecondaryColor, rst.Address).
		Scan(&rst.UUID, &rst.Name, &rst.Translation, &rst.Description, &rst.LogoImage, &rst.PrimaryColor, &rst.SecondaryColor, &rst.Address)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}

	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return rst, nil
}

func (r *RestaurantRepo) GetRestaurantByUUID(uuid *string) (*Restaurant, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	query := "SELECT r.uuid, r.name, r.translation, r.description, r.logo_image, r.primary_color, r.secondary_color, r.address FROM restaurants r WHERE r.uuid = $1;"

	var rst Restaurant
	err = tx.QueryRow(ctx, query, uuid).
		Scan(&rst.UUID, &rst.Name, &rst.Translation, &rst.Description, &rst.LogoImage, &rst.PrimaryColor, &rst.SecondaryColor, &rst.Address)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return &rst, nil
}

func (r *RestaurantRepo) GetRestaurantsPagination(page *int, elements *int) ([]*Restaurant, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	query := "SELECT r.uuid, r.name, r.translation, r.description, r.logo_image, r.primary_color, r.secondary_color, r.address FROM restaurants r LIMIT $1 OFFSET $2;"

	rows, err := tx.Query(ctx, query, *elements, (*page-1)**elements)
	defer rows.Close()
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}

	var rst Restaurant
	var rstList []*Restaurant
	_, err = pgx.ForEachRow(rows, []any{&rst.UUID, &rst.Name, &rst.Translation, &rst.Description, &rst.LogoImage, &rst.PrimaryColor, &rst.SecondaryColor, &rst.Address}, func() error {
		rstList = append(rstList, &Restaurant{
			UUID:           rst.UUID,
			Name:           rst.Name,
			Translation:    rst.Translation,
			Description:    rst.Description,
			LogoImage:      rst.LogoImage,
			PrimaryColor:   rst.PrimaryColor,
			SecondaryColor: rst.SecondaryColor,
			Address:        rst.Address,
		})
		return nil
	})
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return rstList, nil
}

func (r *RestaurantRepo) DeleteRestaurantByUUID(uuid *string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, "DELETE FROM user_restaurants WHERE restaurant_uuid = $1", uuid)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		tx.Rollback(ctx)
	}

	rows, err := tx.Query(ctx, "SELECT id FROM restaurant_menu WHERE restaurant_uuid = $1;", uuid)
	defer rows.Close()
	if err != nil {
		tx.Rollback(ctx)
		return err
	}
	var id int
	menuIds := make([]int, 0)
	_, err = pgx.ForEachRow(rows, []any{&id}, func() error {
		menuIds = append(menuIds, menuIds...)
		return err
	})

	rows, err = tx.Query(ctx, "DELETE FROM dish_menu WHERE menu_id = ANY($1) RETURNING dish_id", menuIds)
	defer rows.Close()
	if err != nil {
		tx.Rollback(ctx)
		return err
	}
	var dishId int
	dishIds := make([]int, 0)
	_, err = pgx.ForEachRow(rows, []any{&dishId}, func() error {
		dishIds = append(dishIds, dishId)
		return err
	})
	_, err = tx.Exec(ctx, "DELETE FROM dishes WHERE id = ANY($1)", dishIds)
	if err != nil {
		tx.Rollback(ctx)
		return err
	}

	_, err = tx.Exec(ctx, "DELETE FROM restaurant_series WHERE restaurant_uuid = $1", uuid)
	if err != nil {
		tx.Rollback(ctx)
		return err
	}
	_, err = tx.Exec(ctx, "DELETE FROM restaurant_menu WHERE restaurant_uuid = $1", uuid)
	if err != nil {
		tx.Rollback(ctx)
		return err
	}

	_, err = tx.Exec(ctx, "DELETE FROM restaurants WHERE uuid = $1", uuid)
	if err != nil {
		tx.Rollback(ctx)
		return err
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return err
	}
	return nil
}

func (r *RestaurantRepo) GetRestaurantsBySeries(seriesId *int) ([]*Restaurant, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	query := "SELECT r.* FROM restaurants r INNER JOIN restaurant_series rs ON r.uuid = rs.restaurant_uuid WHERE rs.series_id = $1;"

	rows, err := tx.Query(ctx, query, seriesId)
	defer rows.Close()
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}

	var rst Restaurant
	var rstList []*Restaurant
	_, err = pgx.ForEachRow(rows, []any{&rst.UUID, &rst.Name, &rst.Translation, &rst.Description, &rst.LogoImage, &rst.PrimaryColor, &rst.SecondaryColor, &rst.Address}, func() error {
		rstList = append(rstList, &Restaurant{
			UUID:           rst.UUID,
			Name:           rst.Name,
			Translation:    rst.Translation,
			Description:    rst.Description,
			LogoImage:      rst.LogoImage,
			PrimaryColor:   rst.PrimaryColor,
			SecondaryColor: rst.SecondaryColor,
			Address:        rst.Address,
		})
		return nil
	})
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return rstList, nil
}

func (r *RestaurantRepo) ChangeAccUsersToRestaurant(restaurantUUID *string, users []*int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return err
	}

	rows := make([][]interface{}, len(users))
	for i, user := range users {
		rows[i] = []interface{}{user, restaurantUUID}
	}

	_, err = tx.Exec(ctx, "DELETE FROM user_restaurants WHERE restaurant_uuid = $1", restaurantUUID)
	if err != nil {
		tx.Rollback(ctx)
		return err
	}

	copyCount, err := tx.CopyFrom(ctx, pgx.Identifier{"user_restaurants"}, []string{"user_id", "restaurant_uuid"}, pgx.CopyFromRows(rows))
	if err != nil {
		tx.Rollback(ctx)
		return err
	}
	if copyCount != int64(len(users)) {
		tx.Rollback(ctx)
		return err
	}

	err = tx.Commit(ctx)
	if err != nil {
		return err
	}
	return nil
}

func (r *RestaurantRepo) GetRestaurantSeries(restaurantUUID *string) (*Series, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	var s Series
	query := "SELECT s.* FROM series s JOIN restaurant_series rs ON s.id = rs.series_id WHERE rs.restaurant_uuid = $1;"
	err = tx.QueryRow(ctx, query, restaurantUUID).Scan(&s.Id, &s.Name, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return &s, nil
}

func (r *RestaurantRepo) GetRestaurantsByUser(userId *int, page, elements *int) ([]*Restaurant, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	limit := *elements
	offset := (*page - 1) * limit
	query := "SELECT r.* FROM restaurants r INNER JOIN user_restaurants ur ON r.uuid = ur.restaurant_uuid WHERE ur.user_id = $1 LIMIT $2 OFFSET $3;"

	rows, err := tx.Query(ctx, query, userId, limit, offset)
	defer rows.Close()
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}

	var rst Restaurant
	var rstList []*Restaurant
	_, err = pgx.ForEachRow(rows, []any{&rst.UUID, &rst.Name, &rst.Translation, &rst.Description, &rst.LogoImage, &rst.PrimaryColor, &rst.SecondaryColor, &rst.Address}, func() error {
		rstList = append(rstList, &Restaurant{
			UUID:           rst.UUID,
			Name:           rst.Name,
			Translation:    rst.Translation,
			Description:    rst.Description,
			LogoImage:      rst.LogoImage,
			PrimaryColor:   rst.PrimaryColor,
			SecondaryColor: rst.SecondaryColor,
			Address:        rst.Address,
		})
		return nil
	})
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return rstList, nil

}
