create table if not exists discounts
(
    id serial primary key,
    name varchar(255),
    discount float,
    start_at timestamp,
    end_at timestamp,
    type varchar(255),
    dish_id int references dishes(id),
    menu_id int references restaurant_menu(id)
);
