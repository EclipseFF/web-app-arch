package main

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"restad/internal"
)

type Config struct {
	port         string
	dsn          string
	staticFolder string
}

type Repos struct {
	User    *internal.UserRepo
	Dish    *internal.DishRepo
	Rest    *internal.RestaurantRepo
	Menu    *internal.MenuRepo
	Session *internal.SessionRepo
	Series  *internal.SeriesRepo
	File    *internal.FileStorage
}

type App struct {
	echo   *echo.Echo
	config Config
	pool   *pgxpool.Pool
	repos  *Repos
}

func NewApp(cfg Config) *App {
	e := echo.New()
	pool, err := ConnectDB(cfg.dsn)
	if err != nil {
		e.Logger.Fatal(err)
	}

	app := &App{
		echo:   e,
		config: cfg,
		pool:   pool,
		repos: &Repos{
			User:    &internal.UserRepo{Pool: pool},
			Dish:    &internal.DishRepo{Pool: pool},
			Rest:    &internal.RestaurantRepo{Pool: pool},
			Menu:    &internal.MenuRepo{Pool: pool},
			Session: &internal.SessionRepo{Pool: pool},
			Series:  &internal.SeriesRepo{Pool: pool},
			File:    &internal.FileStorage{BaseDir: &cfg.staticFolder},
		},
	}

	app.UseMiddleware()
	app.AddRoutes()
	return app
}
