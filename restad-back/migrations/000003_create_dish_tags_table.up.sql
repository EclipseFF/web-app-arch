create table if not exists restaurant_menu (
    id serial primary key,
    restaurant_uuid uuid references restaurants(uuid),
    nameRu varchar(32),
    nameKz varchar(32),
    nameEn varchar(32),
    unique (restaurant_uuid, nameRu, nameKz, nameEn)
);

create table if not exists dish_menu (
    dish_id integer references dishes(id),
    menu_id integer references restaurant_menu(id),
    primary key (dish_id, menu_id)
);

create table if not exists restaurant_dishes (
    dish_id integer references dishes(id),
    restaurant_uuid uuid references restaurants(uuid),
    primary key (dish_id, restaurant_uuid)
);


CREATE INDEX idx_restaurant_menu_restaurant_uuid_id ON restaurant_menu(restaurant_uuid, id);
CREATE INDEX idx_dish_menu_dish_id ON dish_menu(dish_id);
CREATE INDEX idx_restaurant_dishes_dish_id ON restaurant_dishes(dish_id);
CREATE INDEX idx_restaurant_dishes_restaurant_uuid ON restaurant_dishes(restaurant_uuid);