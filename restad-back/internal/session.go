package internal

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
)

type Session struct {
	UserId    *int
	SessionId *string
	CreatedAt *time.Time
}

type SessionRepo struct {
	Pool *pgxpool.Pool
}

func (r *SessionRepo) GetSessionByUUID(uuid *string) (*Session, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	var s Session
	err = tx.QueryRow(ctx, "SELECT user_id, session_id, created_at FROM sessions WHERE session_id = $1", uuid).
		Scan(&s.UserId, &s.SessionId, &s.CreatedAt)
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

func (r *SessionRepo) CreateSession(userId *int) (*Session, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	query := "INSERT INTO sessions (user_id, session_id, created_at) VALUES ($1, default, default) RETURNING user_id, session_id, created_at;"
	var s Session
	err = tx.QueryRow(ctx, query, userId).Scan(&s.UserId, &s.SessionId, &s.CreatedAt)
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

func (r *SessionRepo) DeleteSessionByUUID(uuid *string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, "DELETE FROM sessions WHERE session_id = $1", uuid)
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

func (r *SessionRepo) EnsureRestaurantAccessByUUID(uuid *string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, "SELECT ur.user_id FROM user_restaurants ur WHERE ur.user_id = (SELECT user_id FROM sessions WHERE session_id = $1)", uuid)
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
