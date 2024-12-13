package internal

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
	"time"
)

type UserRepo struct {
	Pool *pgxpool.Pool
}

type User struct {
	Id         *int     `json:"id"`
	Surname    *string  `json:"surname"`
	Name       *string  `json:"name"`
	Patronymic *string  `json:"patronymic"`
	Email      *string  `json:"email"`
	Password   Password `json:"-"`
	Role       *string  `json:"role"`
	IsVerified *bool    `json:"isVerified"`
	IsBlocked  *bool    `json:"isBlocked"`
	IsDeleted  *bool    `json:"isDeleted"`
	UpdatedAt  *time.Time
	CreatedAt  *time.Time
}

type Password struct {
	Plaintext *string `json:"-"`
	Hash      *string `json:"hash"`
}

func (r *UserRepo) CreateUser(user *User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(*user.Password.Plaintext), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	query := "INSERT INTO users (surname, name, patronymic, email, password, role, is_verified, is_blocked, is_deleted, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, default, default, default, default, default)"
	_, err = tx.Exec(ctx, query, user.Surname, user.Name, user.Patronymic, user.Email, hash, user.Role)
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

func (r *UserRepo) GetUserByEmail(email *string) (*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	query := "SELECT u.id, u.surname, u.name, u.patronymic, u.email, u.password, u.role, u.is_verified, u.is_blocked, u.is_deleted, u.updated_at, u.created_at FROM users u WHERE u.email = $1;"

	var u User
	err = tx.QueryRow(ctx, query, email).
		Scan(&u.Id, &u.Surname, &u.Name, &u.Patronymic, &u.Email, &u.Password.Hash, &u.Role, &u.IsVerified, &u.IsBlocked, &u.IsDeleted, &u.UpdatedAt, &u.CreatedAt)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) GetUserById(id *int) (*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	query := "SELECT id, surname, name, patronymic, email, password, role, is_verified, is_blocked, is_deleted, updated_at, created_at FROM users u WHERE u.id = $1;"
	var u User
	err = tx.QueryRow(ctx, query, id).
		Scan(&u.Id, &u.Surname, &u.Name, &u.Patronymic, &u.Email, &u.Password.Hash, &u.Role, &u.IsVerified, &u.IsBlocked, &u.IsDeleted, &u.UpdatedAt, &u.CreatedAt)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) GetUserBySessionId(sessionID *string) (*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	query := "SELECT u.id, u.surname, u.name, u.patronymic, u.email, u.password, u.role, u.is_verified, u.is_blocked, u.is_deleted, u.updated_at, u.created_at FROM users u " +
		"JOIN sessions s ON s.user_id = u.id WHERE s.session_id = $1;"
	var u User

	err = tx.QueryRow(ctx, query, sessionID).
		Scan(&u.Id, &u.Surname, &u.Name, &u.Patronymic, &u.Email, &u.Password.Hash, &u.Role, &u.IsVerified, &u.IsBlocked, &u.IsDeleted, &u.UpdatedAt, &u.CreatedAt)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}

	return &u, nil
}

func (r *UserRepo) CheckAccessToRestaurant(userId *int, restaurantUUID *string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return err
	}
	query := "SELECT * FROM user_restaurants WHERE user_id = $1 AND restaurant_uuid = $2;"
	_, err = tx.Exec(ctx, query, userId, restaurantUUID)
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

func (r *UserRepo) CheckAccessToSeries(userId *int, seriesId *int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return err
	}
	query := "SELECT * FROM user_series WHERE user_id = $1 AND series_id = $2;"
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

func (r *UserRepo) GetUsersBySeries(seriesId *int) ([]*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	query := "SELECT u.id, u.surname, u.name, u.patronymic, u.email, u.password, u.role, u.is_verified, u.is_blocked, u.is_deleted, u.updated_at, u.created_at FROM users u " +
		"JOIN user_series us ON us.user_id = u.id WHERE us.series_id = $1;"
	rows, err := tx.Query(ctx, query, seriesId)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	var users []*User
	for rows.Next() {
		var u User
		err = rows.Scan(&u.Id, &u.Surname, &u.Name, &u.Patronymic, &u.Email, &u.Password.Hash, &u.Role, &u.IsVerified, &u.IsBlocked, &u.IsDeleted, &u.UpdatedAt, &u.CreatedAt)
		if err != nil {
			tx.Rollback(ctx)
			return nil, err
		}
		users = append(users, &u)
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return users, nil
}

func (r *UserRepo) GetUsers(page, elements *int) ([]*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	query := "SELECT u.id, u.surname, u.name, u.patronymic, u.email, u.password, u.role, u.is_verified, u.is_blocked, u.is_deleted, u.updated_at, u.created_at FROM users u LIMIT $1 OFFSET $2;"
	rows, err := tx.Query(ctx, query, elements, (*page-1)**elements)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	var users []*User
	for rows.Next() {
		var u User
		err = rows.Scan(&u.Id, &u.Surname, &u.Name, &u.Patronymic, &u.Email, &u.Password.Hash, &u.Role, &u.IsVerified, &u.IsBlocked, &u.IsDeleted, &u.UpdatedAt, &u.CreatedAt)
		if err != nil {
			tx.Rollback(ctx)
			return nil, err
		}
		users = append(users, &u)
	}
	err = tx.Commit(ctx)
	if err != nil {
		return nil, err
	}
	return users, nil
}

func (r *UserRepo) GetUsersByRestaurant(uuid *string) ([]*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tx, err := r.Pool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}
	query := "SELECT u.id, u.surname, u.name, u.patronymic, u.email, u.password, u.role, u.is_verified, u.is_blocked, u.is_deleted, u.updated_at, u.created_at FROM users u " +
		"JOIN user_restaurants ur ON ur.user_id = u.id WHERE ur.restaurant_uuid = $1;"
	rows, err := tx.Query(ctx, query, uuid)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	var users []*User
	for rows.Next() {
		var u User
		err = rows.Scan(&u.Id, &u.Surname, &u.Name, &u.Patronymic, &u.Email, &u.Password.Hash, &u.Role, &u.IsVerified, &u.IsBlocked, &u.IsDeleted, &u.UpdatedAt, &u.CreatedAt)
		if err != nil {
			tx.Rollback(ctx)
			return nil, err
		}
		users = append(users, &u)
	}
	err = tx.Commit(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return nil, err
	}
	return users, nil
}
