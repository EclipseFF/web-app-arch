package main

import (
	"errors"
	"fmt"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
	"net/http"
	"restad/internal"
	"strconv"
	"sync"
)

func (app *App) CreateMenu(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Not authenticated")
	}
	req := struct {
		Scope           *string `json:"scope"`
		Target          *string `json:"target"`
		LocalizationRu  *string `json:"ru"`
		LocalizationKaz *string `json:"kaz"`
		LocalizationEng *string `json:"eng"`
	}{}
	wg := sync.WaitGroup{}
	wg.Add(2)
	errCh := make(chan error, 2)

	go func() {
		defer wg.Done()
		err := c.Bind(&req)
		if err != nil || req.Scope == nil || req.Target == nil || (req.LocalizationRu == nil && req.LocalizationKaz == nil && req.LocalizationEng == nil) {
			errCh <- err
			return
		}
	}()
	var user internal.User
	go func() {
		defer wg.Done()
		u, err := app.repos.User.GetUserBySessionId(&token)
		if err != nil || u == nil {
			app.echo.Logger.Error(err)
			errCh <- err
			return
		}
		user = *u
	}()

	go func() {
		wg.Wait()
		close(errCh)
	}()

	if err := <-errCh; err != nil {

		switch {
		case errors.Is(err, echo.ErrBadRequest):
			return c.JSON(http.StatusBadRequest, "Invalid request body")
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusUnauthorized, "Not authenticated")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	fmt.Println(req.LocalizationKaz)
	fmt.Println(req.LocalizationRu)
	fmt.Println(req.LocalizationEng)
	fmt.Println(req.Scope)
	fmt.Println(req.Target)
	if *req.Scope == "restaurant" {
		if *user.Role != "moderator" && *user.Role != "admin" {
			return c.JSON(http.StatusForbidden, "Not allowed")
		}
		if *user.Role == "moderator" {
			err := app.repos.User.CheckAccessToRestaurant(user.Id, req.Target)
			if err != nil {
				return c.JSON(http.StatusForbidden, "Not allowed")
			}
		}
		_, err := app.repos.Menu.CreateMenu(&internal.Menu{
			RestaurantUUID: req.Target,
			NameRu:         req.LocalizationRu,
			NameKz:         req.LocalizationKaz,
			NameEn:         req.LocalizationEng,
		})
		if err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
		return c.JSON(http.StatusOK, "Success")
	}
	if *req.Scope == "series" {
		seriesId, err := strconv.Atoi(*req.Target)
		if err != nil || seriesId < 1 {
			return c.JSON(http.StatusBadRequest, "Invalid request body")
		}

		if *user.Role != "moderator" && *user.Role != "admin" {
			return c.JSON(http.StatusForbidden, "Not allowed")
		}
		if *user.Role == "moderator" {
			err := app.repos.User.CheckAccessToSeries(user.Id, &seriesId)
			if err != nil {
				return c.JSON(http.StatusForbidden, "Not allowed")
			}
		}

		rests, err := app.repos.Rest.GetRestaurantsBySeries(&seriesId)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
		if len(rests) == 0 {
			return c.JSON(http.StatusNotFound, "No restaurants")
		}
		wg := sync.WaitGroup{}
		wg.Add(len(rests))
		errCh := make(chan error, len(rests)+1)

		for _, rest := range rests {
			go func(rest *internal.Restaurant) {
				defer wg.Done()
				_, err := app.repos.Menu.CreateMenu(&internal.Menu{
					RestaurantUUID: rest.UUID,
					NameRu:         req.LocalizationRu,
					NameKz:         req.LocalizationKaz,
					NameEn:         req.LocalizationEng,
				})
				if err != nil {
					errCh <- err
					return
				}
			}(rest)
		}

		go func() {
			wg.Wait()
			close(errCh)
		}()

		if err := <-errCh; err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}

		return c.JSON(http.StatusOK, "Success")
	}

	return c.JSON(http.StatusForbidden, "Not allowed")
}

func (app *App) ReadMenusByRestaurant(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Not authenticated")
	}
	uuid := c.Param("uuid")
	if uuid == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}
	user, err := app.repos.User.GetUserBySessionId(&token)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}
	if *user.Role != "moderator" && *user.Role != "admin" {
		return c.JSON(http.StatusForbidden, "Not allowed")
	}
	if *user.Role == "moderator" {
		err := app.repos.User.CheckAccessToRestaurant(user.Id, &uuid)
		if err != nil {
			return c.JSON(http.StatusForbidden, "Not allowed")
		}
	}

	menus, err := app.repos.Menu.GetMenusByRestaurantUUID(&uuid)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"menus": menus})
}
