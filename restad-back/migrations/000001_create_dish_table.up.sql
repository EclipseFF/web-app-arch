CREATE EXTENSION if not exists pgcrypto;



create table if not exists dishes
(
    id          serial primary key,
    image       varchar(255),
    three_d_obj varchar(255),
    price       decimal(10, 2)
    );

create table if not exists dishes_localizations
(
    id          serial primary key,
    title       varchar(255),
    description text,
    lang    varchar(16),
    dish_id     int references dishes (id)
);  