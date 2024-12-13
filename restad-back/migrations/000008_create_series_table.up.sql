create table if not exists series
(
    id serial primary key,
    name varchar(255),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

create table if not exists restaurant_series
(
    series_id int references series(id),
    restaurant_uuid uuid references restaurants(uuid),
    primary key (series_id, restaurant_uuid)
);

create index if not exists idx_restaurant_series_series_id on restaurant_series(series_id);
create index if not exists idx_restaurant_series_restaurant_uuid on restaurant_series(restaurant_uuid);

create table if not exists user_series
(
    user_id integer references users(id),
    series_id int references series(id),
    primary key (user_id, series_id)
);

create index if not exists idx_user_series_user_id on user_series(user_id);
create index if not exists idx_user_series_series_id on user_series(series_id);