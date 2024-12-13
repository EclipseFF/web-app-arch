package main

import (
	"errors"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
	"net/http"
	"path"
	"restad/internal"
	"restad/internal/lib"
	"sync"
)

func (app *App) ReadRestaurantById(c echo.Context) error {
	uniqueId := c.Param("uuid")
	if uniqueId == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	rest, err := app.repos.Rest.GetRestaurantByUUID(&uniqueId)

	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusNotFound, "Not found")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	series, err := app.repos.Rest.GetRestaurantSeries(&uniqueId)

	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"restaurant": rest, "series": series})
}

func (app *App) ReadRestaurantsPagination(c echo.Context) error {
	req := struct {
		Page     int  `json:"page" query:"page"`
		Elements int  `json:"elements" query:"elements"`
		UserId   *int `json:"userId" query:"userId"`
	}{}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}
	var restaurants []*internal.Restaurant
	var err error
	if req.UserId != nil {
		restaurants, err = app.repos.Rest.GetRestaurantsByUser(req.UserId, &req.Page, &req.Elements)

	} else {
		restaurants, err = app.repos.Rest.GetRestaurantsPagination(&req.Page, &req.Elements)
	}

	if err != nil {
		app.echo.Logger.Error(err)
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusNotFound, "Not found")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"restaurants": restaurants})
}

func (app *App) CreateRestaurant(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}
	user, err := app.repos.User.GetUserBySessionId(&token)
	if err != nil {
		app.echo.Logger.Error(err)
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusForbidden, "Forbidden")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}
	var r internal.Restaurant
	err = c.Bind(&r)

	if err != nil {
		app.echo.Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}

	if r.Name == nil || *r.Name == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	if r.Translation == nil || *r.Translation == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	if r.Description == nil || *r.Description == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	if r.PrimaryColor == nil || *r.PrimaryColor == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	if r.SecondaryColor == nil || *r.SecondaryColor == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	fileName := lib.GenerateRandomString()

	logoImage, err := c.FormFile("logo_image")
	if err != nil {
		app.echo.Logger.Error(err)
	}

	if logoImage != nil && logoImage.Filename != "" {
		temp := fileName + path.Ext(logoImage.Filename)
		r.LogoImage = &temp
	}

	rest, err := app.repos.Rest.CreateRestaurant(&r, user.Id)
	if err != nil {
		app.echo.Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}

	if logoImage != nil && logoImage.Filename != "" {
		_, err := app.repos.File.SaveFile(logoImage, rest, &fileName)

		if err != nil {
			app.echo.Logger.Error(err)
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}

	}

	return c.JSON(http.StatusOK, map[string]interface{}{"restaurant": rest})
}

func (app *App) UpdateRestaurant(c echo.Context) error {
	//TODO
	return c.String(200, "Ok")
}

func (app *App) DeleteRestaurant(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Unauthenticated")
	}
	user, err := app.repos.User.GetUserBySessionId(&token)
	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusForbidden, "Forbidden")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}
	uuid := c.Param("uuid")
	if uuid == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}
	if *user.Role != "admin" {
		return c.JSON(http.StatusForbidden, "Forbidden")
	}

	err = app.repos.Rest.DeleteRestaurantByUUID(&uuid)
	if err != nil {
		app.echo.Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}
	_, err = app.repos.File.DeleteRestaurantFolder(&internal.Restaurant{UUID: &uuid})
	if err != nil {
		app.echo.Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}
	return c.JSON(http.StatusOK, "OK")
}

func (app *App) ChangeAccessRestUser(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Not authenticated")
	}

	wg := sync.WaitGroup{}
	wg.Add(2)
	errCh := make(chan error, 2)
	var user *internal.User
	go func() {
		defer wg.Done()
		u, err := app.repos.User.GetUserBySessionId(&token)
		if err != nil || u == nil {
			app.echo.Logger.Error(err)
			switch {
			case errors.Is(err, pgx.ErrNoRows):
				errCh <- echo.ErrUnauthorized
			default:
				errCh <- echo.ErrInternalServerError
			}
		}
		if *u.Role != "moderator" && *u.Role != "admin" {
			errCh <- echo.ErrForbidden
			return
		}
		user = u
	}()
	req := struct {
		RestUuid *string `json:"restUUID"`
		UserIds  []*int  `json:"userIds"`
	}{}
	go func() {
		defer wg.Done()
		if err := c.Bind(&req); err != nil || req.RestUuid == nil {
			errCh <- echo.ErrBadRequest
		}
	}()

	go func() {
		wg.Wait()
		close(errCh)
	}()
	if err := <-errCh; err != nil {
		switch {
		case errors.Is(err, echo.ErrUnauthorized):
			return c.JSON(http.StatusUnauthorized, "Not authenticated")
		case errors.Is(err, echo.ErrForbidden):
			return c.JSON(http.StatusForbidden, "Not allowed")
		case errors.Is(err, echo.ErrBadRequest):
			return c.JSON(http.StatusBadRequest, "Invalid request body")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	if *user.Role == "moderator" {
		err := app.repos.User.CheckAccessToRestaurant(user.Id, req.RestUuid)
		if err != nil {
			switch {
			case errors.Is(err, pgx.ErrNoRows):
				return c.JSON(http.StatusForbidden, "User have no access to this resource")
			default:
				return c.JSON(http.StatusInternalServerError, "Internal server error")
			}
		}
	}

	err := app.repos.Rest.ChangeAccUsersToRestaurant(req.RestUuid, req.UserIds)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}

	return c.JSON(http.StatusOK, "OK")
}
