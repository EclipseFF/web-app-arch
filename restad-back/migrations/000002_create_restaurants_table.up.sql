create table if not exists restaurants
(
    uuid          uuid primary key default gen_random_uuid(),
    name        varchar(255),
    translation varchar(255),
    description text,
    logo_image       varchar(255),
    primary_color varchar(255),
    secondary_color varchar(255),
    address      varchar(255)
);

