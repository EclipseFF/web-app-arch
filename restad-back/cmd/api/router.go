package main

func (app *App) AddRoutes() {
	version := app.echo.Group("/v1")
	dishes := version.Group("/dishes")
	dishes.GET("", app.ReadDishById)
	dishes.GET("/pagination", app.ReadDishesPagination)
	dishes.GET("/categories", app.ReadDishesCategories)
	dishes.POST("/series", app.CreateDishSeries)
	dishes.POST("/rest", app.CreateDishRestaurant)
	dishes.PATCH("", app.UpdateDish)

	menus := version.Group("/menus")
	menus.POST("", app.CreateMenu)
	menus.GET("/restaurant/:uuid", app.ReadMenusByRestaurant)

	restaurants := version.Group("/restaurants")
	restaurants.GET("/:uuid", app.ReadRestaurantById)
	restaurants.GET("/pagination", app.ReadRestaurantsPagination)
	restaurants.POST("", app.CreateRestaurant)
	restaurants.DELETE("/:uuid", app.DeleteRestaurant)

	users := version.Group("/users")
	users.GET("/:id", app.ReadUserById)
	users.POST("", app.CreateUser)
	users.GET("/pagination", app.ReadUsersPagination)
	users.POST("/login", app.LoginUser)
	users.POST("/logout", app.LogoutUser)
	users.GET("/restaurant/:uuid", app.GetUsersByRestaurant)
	users.GET("/session", app.GetUserBySession)

	sessions := version.Group("/sessions")
	sessions.POST("", app.CheckSession)

	series := version.Group("/series")
	series.POST("", app.CreateSeries)
	series.GET("/pagination", app.ReadSeriesPagination)
	series.GET("/:id", app.ReadSeriesById)
	series.PATCH("/:id", app.UpdateSeries)
	series.DELETE("/:id", app.DeleteSeries)

	restaurants.POST("/access-user-restaurant", app.ChangeAccessRestUser)
	series.POST("/access-series-restaurant", app.ChangeAccessSeriesRest)
	series.POST("/access-user-series", app.ChangeAccessSeriesUser)
}
