package internal

import (
	"context"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
)

type Menu struct {
	Id             *int    `json:"id"`
	RestaurantUUID *string `json:"restaurant_uuid"`
	NameRu         *string `json:"nameRu"`
	NameKz         *string `json:"nameKz"`
	NameEn         *string `json:"nameEn"`
}

type MenuRepo struct {
	Pool *pgxpool.Pool
}

func (r *MenuRepo) GetMenusByRestaurantUUID(uuid *string) ([]*Menu, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	menus := []*Menu{}

	query := "SELECT id, restaurant_uuid, nameru, namekz, nameen FROM restaurant_menu WHERE restaurant_uuid = $1;"

	rows, err := tx.Query(ctx, query, uuid)
	defer rows.Close()
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	var m Menu
	_, err = pgx.ForEachRow(rows, []any{&m.Id, &m.RestaurantUUID, &m.NameRu, &m.NameKz, &m.NameEn}, func() error {
		menus = append(menus, &Menu{
			Id:             m.Id,
			RestaurantUUID: m.RestaurantUUID,
			NameRu:         m.NameRu,
			NameKz:         m.NameKz,
			NameEn:         m.NameEn,
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
	return menus, nil
}

func (r *MenuRepo) CreateMenu(m *Menu) (*Menu, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	query := `INSERT INTO restaurant_menu(id, restaurant_uuid, nameru, namekz, nameen) VALUES (default, $1, $2, $3, $4);`

	_, err = tx.Exec(ctx, query, m.RestaurantUUID, m.NameRu, m.NameKz, m.NameEn)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return m, nil
}

func (r *MenuRepo) GetRestaurantMenuByName(restId *string, menuNameRu, menuNameKz, menuNameEn *string) (*Menu, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	var m Menu
	query := "SELECT * FROM restaurant_menu WHERE restaurant_uuid = $1 AND (nameru = $2 OR namekz = $3 OR nameen = $4);"
	err = tx.QueryRow(ctx, query, restId, menuNameRu, menuNameKz, menuNameEn).
		Scan(&m.Id, &m.RestaurantUUID, &m.NameRu, &m.NameKz, &m.NameEn)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return &m, nil
}

func (r *MenuRepo) GetMenuById(id *int) (*Menu, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	var m Menu
	query := "SELECT * FROM restaurant_menu WHERE id = $1;"
	err = tx.QueryRow(ctx, query, id).
		Scan(&m.Id, &m.RestaurantUUID, &m.NameRu, &m.NameKz, &m.NameEn)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return &m, nil
}

func (r *MenuRepo) DeleteMenuByRestUUID(uuid *string) ([]*int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := tx.Query(ctx, "DELETE FROM restaurant_menu WHERE restaurant_uuid = $1 RETURNING id", uuid)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	menuIds := make([]*int, 0)
	var id int
	_, err = pgx.ForEachRow(rows, []any{&id}, func() error {
		menuIds = append(menuIds, &id)
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
	return menuIds, nil
}
