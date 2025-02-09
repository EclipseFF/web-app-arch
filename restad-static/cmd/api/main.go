package main

import (
	"context"
	"errors"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
	"os"
	"os/signal"
	"time"
)

func main() {

	if _, err := os.Stat("./static"); os.IsNotExist(err) {
		err := os.Mkdir("./static", os.ModeDir)
		if err != nil {
			panic(err)
		}
	}

	e := echo.New()
	e.Use(middleware.BodyLimit("512M"))
	e.Use(middleware.Recover())
	e.Static("/", "./static")

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()
	go func() {
		if err := e.Start(":5000"); err != nil && !errors.Is(err, http.ErrServerClosed) {
			e.Logger.Fatal("shutting down the server")
		}
	}()

	<-ctx.Done()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := e.Shutdown(ctx); err != nil {
		e.Logger.Fatal(err)
	}
}
