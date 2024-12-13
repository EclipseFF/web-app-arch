package main

import (
	"context"
	"errors"
	"flag"
	"net/http"
	"os"
	"os/signal"
	"time"
)

func main() {
	dbPassword := flag.String("db-password", "xIfeGIesZyJM3R9", "database password")
	port := flag.String("port", ":4000", "server port")
	dbUser := flag.String("db-user", "postgres", "database user")
	dbName := flag.String("db-name", "restad_dev", "database name")
	dbHost := flag.String("db-host", "localhost", "database host")
	dbPort := flag.String("db-port", "5432", "database port")
	baseDir := flag.String("base-dir", "./static/", "base directory for static files")
	flag.Parse()

	pgDsn := "postgres://" + *dbUser + ":" + *dbPassword + "@" + *dbHost + ":" + *dbPort + "/" + *dbName + "?sslmode=disable"
	app := NewApp(Config{port: *port, dsn: pgDsn, staticFolder: *baseDir})

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()
	go func() {
		if err := app.echo.Start(app.config.port); err != nil && !errors.Is(err, http.ErrServerClosed) {
			app.echo.Logger.Fatal("shutting down the server")
		}
	}()

	<-ctx.Done()
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()
	if err := app.echo.Shutdown(ctx); err != nil {
		app.echo.Logger.Fatal(err)
	}
}
