package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
	"net/http"
	"path"
	"restad/internal"
	"restad/internal/lib"
	"sync"
)

func (app *App) CreateDishSeries(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Not authenticated")
	}

	req := struct {
		Target          *int     `json:"target" form:"target"`
		MenuRu          *string  `json:"menu_ru" form:"menu_ru"`
		MenuKaz         *string  `json:"menu_kaz" form:"menu_kaz"`
		MenuEng         *string  `json:"menu_eng" form:"menu_eng"`
		LocalizationRu  *string  `json:"ru" form:"ru"`
		LocalizationKaz *string  `json:"kaz" form:"kaz"`
		LocalizationEng *string  `json:"eng" form:"eng"`
		Price           *float64 `json:"price" form:"price"`
		Available       *bool    `json:"available" form:"available"`
	}{}

	if err := c.Bind(&req); err != nil {
		return err
	}
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
		if req.Target == nil || req.Price == nil || req.Available == nil {

			errCh <- echo.ErrBadRequest
			return
		}
	}()
	//var user *internal.User
	go func() {
		defer wg.Done()
		u, err := app.repos.User.GetUserBySessionId(&token)
		if err != nil {
			errCh <- err
			return
		}

		if *u.Role != "admin" {
			errCh <- echo.ErrForbidden
			return
		}

	}()
	go func() {
		wg.Wait()
		close(errCh)
	}()

	if err := <-errCh; err != nil {
		fmt.Println(err)
		switch {
		case errors.Is(err, echo.ErrForbidden):
			return c.JSON(http.StatusForbidden, "User have no access to this resource")
		case errors.Is(err, echo.ErrBadRequest):
			return c.JSON(http.StatusBadRequest, "Invalid request body")
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusForbidden, "User have no access to this resource")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}
	rests, err := app.repos.Rest.GetRestaurantsBySeries(req.Target)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal server error")
	}

	var localizationRu internal.DishLocalization
	var localizationEng internal.DishLocalization
	var localizationKaz internal.DishLocalization

	if req.LocalizationRu != nil {
		err = json.Unmarshal([]byte(*req.LocalizationRu), &localizationRu)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}
	if req.LocalizationEng != nil {
		err = json.Unmarshal([]byte(*req.LocalizationEng), &localizationEng)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}
	if req.LocalizationKaz != nil {
		err = json.Unmarshal([]byte(*req.LocalizationKaz), &localizationKaz)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	for _, rest := range rests {
		var menus []*internal.Menu
		if (req.MenuRu != nil || req.MenuKaz != nil || req.MenuEng != nil) && (*req.MenuRu != "" || *req.MenuKaz != "" || *req.MenuEng != "") {
			menu, err := app.repos.Menu.GetRestaurantMenuByName(rest.UUID, req.MenuRu, req.MenuKaz, req.MenuEng)
			if err != nil {
				switch {
				case errors.Is(err, pgx.ErrNoRows):
					m, err := app.repos.Menu.CreateMenu(&internal.Menu{
						RestaurantUUID: rest.UUID,
						NameRu:         req.MenuRu,
						NameKz:         req.MenuKaz,
						NameEn:         req.MenuEng,
					})
					if err != nil {
						return c.JSON(http.StatusInternalServerError, "Internal server error")
					}
					menu = m
				default:
					return c.JSON(http.StatusInternalServerError, "Internal server error")
				}
			}

			if menu != nil {
				menus = append(menus, menu)
			}
		}
		fileName := lib.GenerateRandomString()
		dishImage, _ := c.FormFile("image")
		price := *req.Price * 100

		dish := &internal.Dish{
			Image:     nil,
			ThreeDObj: nil,
			Price:     &price,
			Available: req.Available,
		}
		if dishImage != nil {
			temp := fileName + path.Ext(dishImage.Filename)
			dish.Image = &temp
		}
		fmt.Println(1)
		err = app.repos.Dish.CreateDish(dish, menus, rest, []*internal.DishLocalization{&localizationRu, &localizationEng, &localizationKaz})
		if err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}

		if dishImage != nil {
			_, err = app.repos.File.SaveFile(dishImage, &internal.Restaurant{UUID: rest.UUID}, &fileName)
			if err != nil {
				go app.repos.File.DeleteFile(&internal.Restaurant{UUID: rest.UUID}, &fileName)
				return c.JSON(http.StatusInternalServerError, "Internal server error")
			}
		}

	}
	return c.JSON(http.StatusOK, "OK")
}

func (app *App) CreateDishRestaurant(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Not authenticated")
	}

	req := struct {
		UUID            []*string `json:"uuid" form:"uuid"`
		Menu            *int      `json:"menu" form:"menu"`
		LocalizationRu  *string   `json:"ru" form:"ru"`
		LocalizationKaz *string   `json:"kaz" form:"kaz"`
		LocalizationEng *string   `json:"eng" form:"en"`
		Price           *float64  `json:"price" form:"price"`
		Available       *bool     `json:"available" form:"available"`
	}{}
	var user internal.User
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
		if req.UUID == nil || req.Menu == nil || req.Price == nil || req.Available == nil {
			errCh <- echo.ErrBadRequest
			return
		}
	}()

	go func() {
		defer wg.Done()
		u, err := app.repos.User.GetUserBySessionId(&token)
		if err != nil {
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
		case errors.Is(err, echo.ErrForbidden):
			return c.JSON(http.StatusForbidden, "User have no access to this resource")
		case errors.Is(err, echo.ErrBadRequest):
			return c.JSON(http.StatusBadRequest, "Invalid request body")
		case errors.Is(err, pgx.ErrNoRows):
			return c.JSON(http.StatusForbidden, "User have no access to this resource")
		default:
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}
	if user.Role != nil && *user.Role != "admin" {
		wgCh := sync.WaitGroup{}
		wgCh.Add(len(req.UUID))
		errCh = make(chan error, len(req.UUID)+1)

		for _, uuid := range req.UUID {
			go func(uuid *string) {
				defer wgCh.Done()
				err := app.repos.User.CheckAccessToRestaurant(user.Id, uuid)
				if err != nil {
					errCh <- err
					return
				}
			}(uuid)
		}

		go func() {
			wgCh.Wait()
			close(errCh)
		}()

		if err := <-errCh; err != nil {
			return c.JSON(http.StatusForbidden, "User have no access to this resource")
		}
	}

	var localizationRu internal.DishLocalization
	var localizationEng internal.DishLocalization
	var localizationKaz internal.DishLocalization

	if req.LocalizationRu != nil {
		err := json.Unmarshal([]byte(*req.LocalizationRu), &localizationRu)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	if req.LocalizationEng != nil {
		err := json.Unmarshal([]byte(*req.LocalizationEng), &localizationEng)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}

	}

	if req.LocalizationKaz != nil {

		err := json.Unmarshal([]byte(*req.LocalizationKaz), &localizationKaz)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
	}

	for _, uuid := range req.UUID {
		price := *req.Price * 100
		dish := &internal.Dish{
			Price:     &price,
			Available: req.Available,
		}
		fileName := lib.GenerateRandomString()
		dishImage, _ := c.FormFile("image")

		if dishImage != nil {
			temp := fileName + path.Ext(dishImage.Filename)
			dish.Image = &temp
		}

		var menus []*internal.Menu
		if req.Menu != nil && *req.Menu > 0 {
			menu, err := app.repos.Menu.GetMenuById(req.Menu)
			if err != nil && !errors.Is(err, pgx.ErrNoRows) {
				return c.JSON(http.StatusInternalServerError, "Internal server error")
			}
			if menu != nil {
				menus = append(menus, menu)
			}
		}
		var err error
		if len(menus) == 0 {
			err = app.repos.Dish.CreateDish(dish, menus, &internal.Restaurant{UUID: uuid}, []*internal.DishLocalization{&localizationRu, &localizationEng, &localizationKaz})
		} else {
			err = app.repos.Dish.CreateDish(dish, menus, nil, []*internal.DishLocalization{&localizationRu, &localizationEng, &localizationKaz})
		}

		if err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal server error")
		}
		if dishImage != nil {
			_, err = app.repos.File.SaveFile(dishImage, &internal.Restaurant{UUID: uuid}, &fileName)
			if err != nil {
				fmt.Println(err)
				go app.repos.File.DeleteFile(&internal.Restaurant{UUID: uuid}, &fileName)
				return c.JSON(http.StatusInternalServerError, "Internal server error")
			}
		}
	}

	return c.JSON(http.StatusOK, "OK")
}

func (app *App) UpdateDish(c echo.Context) error {
	token := c.Request().Header.Get("Authentication-Token")
	if token == "" {
		return c.JSON(http.StatusUnauthorized, "Not authenticated")
	}
	/*req := struct {
		UUID       *string `form:"uuid"`
		Menu       *int    `form:"menu"`
		Price      *float64 `form:"price"`
		Available  *bool   `form:"available"`
	}*/
	return c.JSON(http.StatusOK, "OK")
}
