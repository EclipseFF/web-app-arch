package main

import (
	"errors"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
	"net/http"
	"restad/internal"
	"sync"
)

func (app *App) ReadDishById(c echo.Context) error {
	req := struct {
		RestaurantUUID string `json:"restaurant_uuid" query:"restaurant_uuid"`
		DishId         int    `json:"dish_id" query:"dish_id"`
	}{}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	dish, err := app.repos.Dish.GetDishById(&req.RestaurantUUID, &req.DishId)

	if err != nil {
		app.echo.Logger.Error(err)
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusNotFound, "Not found")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"dish": dish})
}

func (app *App) ReadDishesPagination(c echo.Context) error {
	req := struct {
		RestaurantUUID string `json:"restaurant_uuid" query:"restaurant_uuid"`
		Page           int    `json:"page" query:"page"`
		Elements       int    `json:"elements" query:"elements"`
	}{}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	dishes, err := app.repos.Dish.GetDishesPagination(&req.RestaurantUUID, &req.Page, &req.Elements)

	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		switch {
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	dishesWithoutCategory, err := app.repos.Dish.GetDishesWithoutCategory(&req.RestaurantUUID, &req.Page, &req.Elements)

	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		app.echo.Logger.Error(err)
		switch {
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}
	dishes = append(dishes, dishesWithoutCategory...)
	return c.JSON(http.StatusOK, map[string]interface{}{"dishes": dishes})
}

func (app *App) ReadDishesCategories(c echo.Context) error {
	req := struct {
		RestaurantUUID string `json:"restaurant_uuid" query:"restaurant_uuid"`
		Page           int    `json:"page" query:"page"`
		Elements       int    `json:"elements" query:"elements"`
	}{}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}
	menus, err := app.repos.Menu.GetMenusByRestaurantUUID(&req.RestaurantUUID)
	if err != nil {
		app.echo.Logger.Error(err)
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusNotFound, "Not found")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	if len(menus) == 0 {
		return c.JSON(http.StatusBadRequest, "Invalid request body")
	}

	var wg sync.WaitGroup
	ch := make(chan map[string]interface{}, len(menus)+1)

	for _, menu := range menus {
		wg.Add(1)
		go func(menu *internal.Menu) {
			defer wg.Done()
			var temp *string
			if menu.NameRu != nil {
				temp = menu.NameRu
			} else if menu.NameKz != nil {
				temp = menu.NameKz
			} else if menu.NameEn != nil {
				temp = menu.NameEn
			}
			dishes, err := app.repos.Dish.GetDishesByMenuNameAndRestaurantUUID(temp, &req.RestaurantUUID)
			if err != nil {
				ch <- nil
				return
			}

			ch <- map[string]interface{}{
				"menu":   menu,
				"dishes": dishes,
			}
		}(menu)
	}

	wg.Wait()
	close(ch)
	dishesWithoutCategory, err := app.repos.Dish.GetDishesWithoutCategory(&req.RestaurantUUID, &req.Page, &req.Elements)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		app.echo.Logger.Error(err)
		switch {
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	var response []map[string]interface{}
	for result := range ch {
		if result != nil {
			response = append(response, result)
		} else {
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}
	temp := "without category"
	tempId := -1
	response = append(response, map[string]interface{}{
		"menu": internal.Menu{
			Id:             &tempId,
			RestaurantUUID: &req.RestaurantUUID,
			NameRu:         &temp,
			NameKz:         &temp,
			NameEn:         &temp,
		},
		"dishes": dishesWithoutCategory,
	})
	return c.JSON(http.StatusOK, response)
}
