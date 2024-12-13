alter table dishes add column if not exists available boolean default false;
alter table dishes add column if not exists created_at timestamp default current_timestamp;
alter table dishes add column if not exists updated_at timestamp default current_timestamp;