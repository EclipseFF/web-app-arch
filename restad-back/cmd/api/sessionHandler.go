package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

func (app *App) CheckSession(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Not authenticated")
	}
	user, err := app.repos.User.GetUserBySessionId(&token)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"user": user})
}
