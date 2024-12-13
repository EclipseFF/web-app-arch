package internal

import (
	"context"
	"errors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
)

type Series struct {
	Id        *int       `json:"id"`
	Name      *string    `json:"name"`
	CreatedAt *time.Time `json:"createdAt"`
	UpdatedAt *time.Time `json:"updatedAt"`
}

type SeriesRepo struct {
	Pool *pgxpool.Pool
}

func (r *SeriesRepo) CreateSeries(ser *Series, userIDs []*int) (*Series, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	query := "INSERT INTO series(id, name, created_at, updated_at) VALUES (default, $1, default, default) RETURNING id, name, created_at, updated_at;"

	err = tx.QueryRow(ctx, query, ser.Name).
		Scan(&ser.Id, &ser.Name, &ser.CreatedAt, &ser.UpdatedAt)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	rows := make([][]interface{}, len(userIDs))
	for i, userID := range userIDs {
		rows[i] = []interface{}{userID, ser.Id}
	}
	copyCount, err := tx.CopyFrom(ctx, pgx.Identifier{"user_series"}, []string{"user_id", "series_id"}, pgx.CopyFromRows(rows))
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	if copyCount != int64(len(userIDs)) {
		tx.Rollback(ctx)
		return nil, err
	}

	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return ser, nil
}

func (r *SeriesRepo) GetUserSeriesPagination(userID *int, page, elements int) ([]*Series, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	query := "SELECT s.* FROM series s JOIN user_series us ON s.id = us.series_id WHERE us.user_id = $1 ORDER BY s.created_at DESC LIMIT $2 OFFSET $3;"
	var series []*Series
	rows, err := tx.Query(ctx, query, userID, elements, (page-1)*elements)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	for rows.Next() {
		var s Series
		err = rows.Scan(&s.Id, &s.Name, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			tx.Rollback(ctx)
			return nil, err
		}
		series = append(series, &s)
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return series, nil
}

func (r *SeriesRepo) GetSeriesPagination(page, elements int) ([]*Series, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	query := "SELECT s.* FROM series s ORDER BY s.created_at DESC LIMIT $1 OFFSET $2;"
	var series []*Series
	rows, err := tx.Query(ctx, query, elements, (page-1)*elements)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	for rows.Next() {
		var s Series
		err = rows.Scan(&s.Id, &s.Name, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			tx.Rollback(ctx)
			return nil, err
		}
		series = append(series, &s)
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return series, nil
}

func (r *SeriesRepo) GetUserSeriesById(seriesId, userId *int) (*Series, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	query := "SELECT s.* FROM series s JOIN user_series us ON s.id = us.series_id WHERE us.user_id = $1 AND s.id = $2;"
	var s Series
	err = tx.QueryRow(ctx, query, userId, seriesId).
		Scan(&s.Id, &s.Name, &s.CreatedAt, &s.UpdatedAt)
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

func (r *SeriesRepo) GetSeriesById(seriesId *int) (*Series, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	query := "SELECT * FROM series WHERE id = $1;"
	var s Series
	err = tx.QueryRow(ctx, query, seriesId).
		Scan(&s.Id, &s.Name, &s.CreatedAt, &s.UpdatedAt)
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

func (r *SeriesRepo) AddUserToSeries(seriesId, userId *int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return err
	}

	query := "INSERT INTO user_series (user_id, series_id) VALUES ($1, $2);"
	_, err = tx.Exec(ctx, query, userId, seriesId)
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

func (r *SeriesRepo) DeleteUserFromSeries(seriesId, userId *int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return err
	}

	query := "DELETE FROM user_series WHERE user_id = $1 AND series_id = $2;"
	_, err = tx.Exec(ctx, query, userId, seriesId)
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

func (r *SeriesRepo) ChangeAccRestaurantsToSeries(seriesId *int, restUuid []*string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return err
	}
	rows := make([][]interface{}, len(restUuid))
	for i, rest := range restUuid {
		rows[i] = []interface{}{seriesId, rest}
	}

	if len(restUuid) == 0 {
		_, err = tx.Exec(ctx, "DELETE FROM restaurant_series WHERE series_id = $1;", seriesId)
		if err != nil && !errors.Is(err, pgx.ErrNoRows) {
			tx.Rollback(ctx)
		}
	} else {
		_, err = tx.Exec(ctx, "DELETE FROM restaurant_series WHERE restaurant_uuid = ANY ($1);", restUuid)
		if err != nil && !errors.Is(err, pgx.ErrNoRows) {
			tx.Rollback(ctx)
			return err
		}
	}

	copyCount, err := tx.CopyFrom(ctx, pgx.Identifier{"restaurant_series"}, []string{"series_id", "restaurant_uuid"}, pgx.CopyFromRows(rows))
	if err != nil {
		tx.Rollback(ctx)
		return err
	}
	if copyCount != int64(len(restUuid)) {
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

func (r *SeriesRepo) DeleteRestaurantFromSeries(seriesId *int, restUuid *string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return err
	}

	query := "DELETE FROM restaurant_series WHERE series_id = $1 AND restaurant_uuid = $2;"
	_, err = tx.Exec(ctx, query, seriesId, restUuid)
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

func (r *SeriesRepo) AddUsersToSeries(seriesId *int, users []*int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return err
	}

	rows := make([][]interface{}, len(users))
	for i, user := range users {
		rows[i] = []interface{}{user, seriesId}
	}

	_, err = tx.Exec(ctx, "DELETE FROM user_series WHERE series_id = $1;", seriesId)
	if err != nil {
		tx.Rollback(ctx)
		return err
	}

	copyCount, err := tx.CopyFrom(ctx, pgx.Identifier{"user_series"}, []string{"user_id", "series_id"}, pgx.CopyFromRows(rows))
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
