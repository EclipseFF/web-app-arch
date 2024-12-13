create table if not exists users
(
    id serial primary key,
    surname varchar(255),
    name varchar(255),
    patronymic varchar(255),
    email varchar(255) unique,
    password varchar(255),
    role varchar(255),
    is_verified boolean default false,
    is_blocked boolean default false,
    is_deleted boolean default false,
    updated_at timestamp default current_timestamp,
    created_at timestamp default current_timestamp
)