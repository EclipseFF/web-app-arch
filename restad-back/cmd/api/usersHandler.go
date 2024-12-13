package main

import (
	"errors"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"restad/internal"
	"strconv"
)

func (app *App) ReadUserById(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	idParam := c.Param("id")
	if idParam == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}
	id, err := strconv.Atoi(idParam)
	if err != nil || id < 1 {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}
	user, err := app.repos.User.GetUserById(&id)
	if err != nil {
		app.echo.Logger.Error(err)
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusNotFound, "Not found")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"user": user})
}

func (app *App) CreateUser(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Not authenticated")
	}

	req := struct {
		Surname    *string `json:"surname"`
		Name       *string `json:"name"`
		Patronymic *string `json:"patronymic"`
		Email      *string `json:"email"`
		Password   *string `json:"password"`
		Role       *string `json:"role"`
	}{}
	err := c.Bind(&req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}

	if req.Surname == nil || *req.Surname == "" {
		req.Surname = nil
	}

	if req.Name == nil || *req.Name == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	if req.Patronymic == nil || *req.Patronymic == "" {
		req.Patronymic = nil
	}

	if req.Email == nil || *req.Email == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	if req.Password == nil || *req.Password == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	if req.Role == nil || *req.Role == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}
	u := internal.User{
		Id:         nil,
		Surname:    req.Surname,
		Name:       req.Name,
		Patronymic: req.Patronymic,
		Email:      req.Email,
		Password: internal.Password{
			Plaintext: req.Password,
			Hash:      nil,
		},
		Role: req.Role,
	}
	err = app.repos.User.CreateUser(&u)
	if err != nil {
		app.echo.Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}
	return c.JSON(http.StatusCreated, "OK")
}

func (app *App) LoginUser(c echo.Context) error {
	req := struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}{}
	err := c.Bind(&req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	user, err := app.repos.User.GetUserByEmail(&req.Email)
	if err != nil {
		app.echo.Logger.Error(err)
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusNotFound, "Not found")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}
	if user == nil {
		return c.JSON(http.StatusNotFound, "Not found")
	}

	if bcrypt.CompareHashAndPassword([]byte(*user.Password.Hash), []byte(req.Password)) != nil {
		return c.JSON(http.StatusUnauthorized, "Unauthorized")
	}

	session, err := app.repos.Session.CreateSession(user.Id)
	if err != nil {
		app.echo.Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, "Internal server error")

	}

	return c.JSON(http.StatusOK, map[string]interface{}{"token": session.SessionId})
}

func (app *App) LogoutUser(c echo.Context) error {
	req := struct {
		Token *string `json:"token"`
	}{}
	err := c.Bind(&req)
	if err != nil || req.Token == nil {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	err = app.repos.Session.DeleteSessionByUUID(req.Token)
	if err != nil {
		app.echo.Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, "Internal server error")

	}

	return c.JSON(http.StatusOK, "OK")
}

func (app *App) ReadUsersPagination(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Not authenticated")
	}

	user, err := app.repos.User.GetUserBySessionId(&token)

	if err != nil || user == nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusUnauthorized, "Not authenticated")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	if *user.Role != "moderator" && *user.Role != "admin" {
		return c.JSON(http.StatusForbidden, "Not allowed")
	}

	pageParam := c.QueryParam("page")
	elementsParam := c.QueryParam("elements")
	page, err := strconv.Atoi(pageParam)
	if err != nil || page < 1 {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}
	elements, err := strconv.Atoi(elementsParam)
	if err != nil || elements < 1 {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}
	users, err := app.repos.User.GetUsers(&page, &elements)
	if err != nil {
		app.echo.Logger.Error(err)
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusNotFound, "Not found")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"users": users})
}

func (app *App) GetUsersByRestaurant(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Not authenticated")
	}

	user, err := app.repos.User.GetUserBySessionId(&token)

	if err != nil || user == nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusUnauthorized, "Not authenticated")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	if *user.Role != "moderator" && *user.Role != "admin" {
		return c.JSON(http.StatusForbidden, "Not allowed")
	}

	uuid := c.Param("uuid")
	if uuid == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}
	users, err := app.repos.User.GetUsersByRestaurant(&uuid)
	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusNotFound, "Not found")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"users": users})
}

func (app *App) GetUserBySession(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Not authenticated")
	}
	user, err := app.repos.User.GetUserBySessionId(&token)
	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusUnauthorized, "Not authenticated")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"user": user})
}
