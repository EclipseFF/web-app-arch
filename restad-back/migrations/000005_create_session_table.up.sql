create table if not exists sessions
(
    user_id integer references users(id),
    session_id uuid primary key default gen_random_uuid(),
    created_at timestamp default current_timestamp
);

create table if not exists user_restaurants
(
    user_id integer references users(id),
    restaurant_uuid uuid references restaurants(uuid),
    primary key (user_id, restaurant_uuid)
);

create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_user_restaurants_user_id on user_restaurants(user_id);
create index if not exists idx_user_restaurants_restaurant_uuid on user_restaurants(restaurant_uuid);