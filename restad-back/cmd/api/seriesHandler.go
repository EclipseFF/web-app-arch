package main

import (
	"errors"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
	"net/http"
	"restad/internal"
	"strconv"
	"sync"
)

func (app *App) CreateSeries(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Not authenticated")
	}

	req := struct {
		UserIds []*int  `json:"userIds"`
		Name    *string `json:"name"`
	}{}
	wg := sync.WaitGroup{}
	wg.Add(2)

	errCh := make(chan error, 2)

	go func() {
		defer wg.Done()
		err := c.Bind(&req)
		if err != nil {
			errCh <- err
			return
		}
		if req.Name == nil || *req.Name == "" {
			errCh <- echo.ErrBadRequest
			return
		}
	}()

	go func() {
		defer wg.Done()
		user, err := app.repos.User.GetUserBySessionId(&token)
		if err != nil {
			app.echo.Logger.Error(err)
			errCh <- err
			return
		}

		if user == nil {
			errCh <- pgx.ErrNoRows
			return
		}

		if *user.Role != "admin" {
			errCh <- echo.ErrUnauthorized
			return
		}
	}()

	go func() {
		wg.Wait()
		close(errCh)
	}()

	if err := <-errCh; err != nil {
		app.echo.Logger.Error(err)
		switch {
		case errors.Is(err, echo.ErrBadRequest):
			return c.JSON(http.StatusBadRequest, "Invalid request body")
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusUnauthorized, "Not authenticated")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	if len(req.UserIds) != 0 {
		errCh = make(chan error, len(req.UserIds))
		wg := sync.WaitGroup{}
		wg.Add(len(req.UserIds))

		for _, userId := range req.UserIds {
			go func(userId *int) {
				defer wg.Done()
				_, err := app.repos.User.GetUserById(userId)
				if err != nil {
					app.echo.Logger.Error(err)
					errCh <- err
				}
			}(userId)
		}

		go func() {
			wg.Wait()
			close(errCh)
		}()

		if err := <-errCh; err != nil {
			app.echo.Logger.Error(err)
			switch {
			case errors.Is(err, pgx.ErrNoRows):
				return c.JSON(http.StatusBadRequest, "User not found")
			default:
				return c.JSON(http.StatusInternalServerError, "Internal server error")
			}
		}
	}

	ser := internal.Series{
		Name: req.Name,
	}

	series, err := app.repos.Series.CreateSeries(&ser, req.UserIds)
	if err != nil {
		app.echo.Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"series": series})
}

func (app *App) ReadSeriesPagination(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Not authenticated")
	}

	user, err := app.repos.User.GetUserBySessionId(&token)

	if err != nil || user == nil {
		app.echo.Logger.Error(err)
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusUnauthorized, "Not authenticated")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	req := struct {
		Page     int `json:"page" query:"page"`
		Elements int `json:"elements" query:"elements"`
	}{}

	if err := c.Bind(&req); err != nil || req.Page <= 0 || req.Elements <= 0 {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	if *user.Role == "moderator" {
		series, err := app.repos.Series.GetUserSeriesPagination(user.Id, req.Page, req.Elements)
		if err != nil {
			app.echo.Logger.Error(err)
			switch {
			case errors.Is(err, pgx.ErrNoRows):
				return c.JSON(http.StatusNotFound, "Not found")
			default:
				return c.JSON(http.StatusInternalServerError, "Internal server error")
			}
		}
		return c.JSON(http.StatusOK, map[string]interface{}{"series": series})
	}

	if *user.Role == "admin" {
		series, err := app.repos.Series.GetSeriesPagination(req.Page, req.Elements)
		if err != nil {
			app.echo.Logger.Error(err)
			switch {
			case errors.Is(err, pgx.ErrNoRows):
				return c.JSON(http.StatusNotFound, "Not found")
			default:
				return c.JSON(http.StatusInternalServerError, "Internal server error")
			}
		}
		return c.JSON(http.StatusOK, map[string]interface{}{"series": series})
	}

	return c.JSON(http.StatusForbidden, "Not allowed")
}

func (app *App) ReadSeriesById(c echo.Context) error {
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

	idParam := c.Param("id")
	if idParam == "" {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}
	id, err := strconv.Atoi(idParam)
	if err != nil || id < 1 {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	if *user.Role == "moderator" {
		err = app.repos.User.CheckAccessToSeries(user.Id, &id)
		if err != nil {
			switch {
			case errors.Is(err, pgx.ErrNoRows):
				return c.JSON(http.StatusNotFound, "Not found")
			default:
				return c.JSON(http.StatusInternalServerError, "Internal server error")
			}
		}
	}

	wg := sync.WaitGroup{}
	wg.Add(2)
	errCh := make(chan error, 2)

	var users []*internal.User
	var rests []*internal.Restaurant

	go func() {
		defer wg.Done()
		u, err := app.repos.User.GetUsersBySeries(&id)
		if err != nil {
			return
		}
		users = u
	}()
	go func() {
		defer wg.Done()
		r, err := app.repos.Rest.GetRestaurantsBySeries(&id)
		if err != nil {
			return
		}
		rests = r
	}()
	go func() {
		wg.Wait()
		close(errCh)
	}()
	if err := <-errCh; err != nil {
		app.echo.Logger.Error(err)
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusNotFound, "Not found")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	series, err := app.repos.Series.GetSeriesById(&id)
	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusNotFound, "Not found")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"series": series, "restaurants": rests, "users": users})

}

func (app *App) UpdateSeries(c echo.Context) error {
	return c.String(200, "Ok")
}

func (app *App) DeleteSeries(c echo.Context) error {
	return c.String(200, "Ok")
}

func (app *App) ChangeAccessSeriesRest(c echo.Context) error {
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
		SeriesId         *int      `json:"seriesId"`
		RestaurantsUUIDs []*string `json:"restaurantsUUIDs"`
	}{}
	go func() {
		defer wg.Done()
		if err := c.Bind(&req); err != nil || *req.SeriesId < 1 {
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
		wg := sync.WaitGroup{}
		wg.Add(len(req.RestaurantsUUIDs) + 1)
		errCh := make(chan error, len(req.RestaurantsUUIDs)+1)
		for _, uuid := range req.RestaurantsUUIDs {
			go func(uuid *string) {
				defer wg.Done()
				err := app.repos.User.CheckAccessToRestaurant(user.Id, uuid)
				if err != nil {
					app.echo.Logger.Error(err)
					errCh <- err
					return
				}
			}(uuid)
		}
		go func() {
			defer wg.Done()
			err := app.repos.User.CheckAccessToSeries(user.Id, req.SeriesId)
			if err != nil {
				app.echo.Logger.Error(err)
				errCh <- err
				return
			}
		}()
		go func() {
			wg.Wait()
			close(errCh)
		}()
		if err := <-errCh; err != nil {
			switch {
			case errors.Is(err, pgx.ErrNoRows):
				return c.JSON(http.StatusForbidden, "User have no access to this resource")
			default:
				return c.JSON(http.StatusInternalServerError, "Internal server error")
			}
		}
	}

	err := app.repos.Series.ChangeAccRestaurantsToSeries(req.SeriesId, req.RestaurantsUUIDs)
	if err != nil {
		app.echo.Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}
	return c.String(200, "Ok")
}

func (app *App) ChangeAccessSeriesUser(c echo.Context) error {
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
		SeriesId *int   `json:"seriesId"`
		UserIds  []*int `json:"userIds"`
	}{}
	go func() {
		defer wg.Done()
		if err := c.Bind(&req); err != nil || req.SeriesId == nil || *req.SeriesId < 1 {
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
		err := app.repos.User.CheckAccessToSeries(user.Id, req.SeriesId)
		if err != nil {
			switch {
			case errors.Is(err, pgx.ErrNoRows):
				return c.JSON(http.StatusForbidden, "User have no access to this resource")
			default:
				return c.JSON(http.StatusInternalServerError, "Internal server error")
			}
		}
	}

	err := app.repos.Series.AddUsersToSeries(req.SeriesId, req.UserIds)
	if err != nil {
		app.echo.Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}
	return c.String(200, "Ok")
}
