create table public.dish_comments (
                                      id uuid not null default gen_random_uuid (),
                                      dish_id uuid not null,
                                      user_name text not null,
                                      comment_text text not null,
                                      created_at timestamp with time zone not null default timezone ('utc'::text, now()),
                                      updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
                                      constraint dish_comments_pkey primary key (id),
                                      constraint dish_comments_dish_id_fkey foreign KEY (dish_id) references user_dishes (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_dish_comments_dish_id on public.dish_comments using btree (dish_id) TABLESPACE pg_default;

create index IF not exists idx_dish_comments_created_at on public.dish_comments using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_dish_comments_user_name on public.dish_comments using btree (user_name) TABLESPACE pg_default;

create trigger update_dish_comments_updated_at BEFORE
    update on dish_comments for EACH row
    execute FUNCTION update_updated_at_column ();



create view public.expiring_foods as
select
    f.id,
    f.user_id,
    f.food_name,
    f.quantity,
    f.unit,
    f.expiration_date,
    f.storage_suggestion,
    f.created_at,
    f.updated_at,
    u.user_name,
    f.expiration_date - CURRENT_DATE as days_remaining
from
    foods f
        join users u on f.user_id = u.id
where
    f.expiration_date <= (CURRENT_DATE + '7 days'::interval)
order by
    f.expiration_date;


create table public.favorites (
                                  id uuid not null default gen_random_uuid (),
                                  recipe_id text not null,
                                  recipe_name text not null,
                                  cuisine text null,
                                  ingredients jsonb not null,
                                  steps jsonb not null,
                                  cooking_tips text null,
                                  difficulty text null,
                                  cooking_time text null,
                                  favorite_date timestamp with time zone null default now(),
                                  user_notes text null,
                                  created_at timestamp with time zone null default now(),
                                  updated_at timestamp with time zone null default now(),
                                  user_name character varying(255) null,
                                  constraint favorites_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_favorites_recipe_id on public.favorites using btree (recipe_id) TABLESPACE pg_default;

create index IF not exists idx_favorites_favorite_date on public.favorites using btree (favorite_date desc) TABLESPACE pg_default;

create index IF not exists idx_favorites_cuisine on public.favorites using btree (cuisine) TABLESPACE pg_default;

create index IF not exists idx_favorites_user_name on public.favorites using btree (user_name) TABLESPACE pg_default;

create trigger update_favorites_updated_at BEFORE
    update on favorites for EACH row
    execute FUNCTION update_updated_at_column ();


create table public.foods (
                              id serial not null,
                              user_id uuid not null,
                              food_name character varying(100) not null,
                              quantity integer not null default 1,
                              unit character varying(20) not null default '个'::character varying,
                              expiration_date date not null,
                              storage_suggestion text null,
                              created_at timestamp without time zone null default CURRENT_TIMESTAMP,
                              updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
                              constraint foods_pkey primary key (id),
                              constraint fk_user foreign KEY (user_id) references users (id) on delete CASCADE,
                              constraint chk_expiration_date check ((expiration_date > CURRENT_DATE))
) TABLESPACE pg_default;

create index IF not exists idx_foods_user_id on public.foods using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_foods_expiration_date on public.foods using btree (expiration_date) TABLESPACE pg_default;

create index IF not exists idx_foods_created_at on public.foods using btree (created_at) TABLESPACE pg_default;

create trigger update_foods_updated_at BEFORE
    update on foods for EACH row
    execute FUNCTION update_updated_at_column ();



create table public.recipe_images (
                                      id uuid not null default gen_random_uuid (),
                                      image_url text not null,
                                      recipe_name text not null,
                                      recipe_id text not null,
                                      cuisine text not null,
                                      ingredients text[] null,
                                      user_id text null,
                                      file_path text null,
                                      file_size bigint null,
                                      prompt text null,
                                      created_at timestamp with time zone null default now(),
                                      updated_at timestamp with time zone null default now(),
                                      constraint recipe_images_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_recipe_images_recipe_id on public.recipe_images using btree (recipe_id) TABLESPACE pg_default;

create index IF not exists idx_recipe_images_cuisine on public.recipe_images using btree (cuisine) TABLESPACE pg_default;

create index IF not exists idx_recipe_images_created_at on public.recipe_images using btree (created_at desc) TABLESPACE pg_default;


create table public.user_comments (
                                      id uuid not null default gen_random_uuid (),
                                      user_name text not null,
                                      comment_text text not null,
                                      created_at timestamp with time zone null default now(),
                                      updated_at timestamp with time zone null default now(),
                                      constraint user_comments_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_user_comments_created_at on public.user_comments using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_user_comments_user_name on public.user_comments using btree (user_name) TABLESPACE pg_default;

create trigger update_user_comments_updated_at BEFORE
    update on user_comments for EACH row
    execute FUNCTION update_updated_at_column ();


create table public.user_dishes (
                                    id uuid not null default gen_random_uuid (),
                                    recipe_id text not null,
                                    recipe_name text not null,
                                    cuisine text null,
                                    ingredients text[] not null,
                                    steps jsonb not null,
                                    cooking_tips text null,
                                    difficulty text null,
                                    cooking_time text null,
                                    favorite_date timestamp with time zone null default now(),
                                    user_notes text null,
                                    created_at timestamp with time zone null default now(),
                                    updated_at timestamp with time zone null default now(),
                                    user_name character varying(255) null,
                                    constraint user_dishes_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_user_dishes_recipe_name on public.user_dishes using btree (recipe_name) TABLESPACE pg_default;

create index IF not exists idx_user_dishes_created_at on public.user_dishes using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_user_dishes_user_name on public.user_dishes using btree (user_name) TABLESPACE pg_default;


create table public.users (
                              id uuid not null default gen_random_uuid (),
                              user_name character varying(255) not null,
                              password character varying(255) not null,
                              created_at timestamp with time zone null default now(),
                              updated_at timestamp with time zone null default now(),
                              constraint users_pkey primary key (id),
                              constraint users_user_name_key unique (user_name)
) TABLESPACE pg_default;

create index IF not exists idx_users_user_name on public.users using btree (user_name) TABLESPACE pg_default;

create index IF not exists idx_users_created_at on public.users using btree (created_at) TABLESPACE pg_default;

create trigger update_users_updated_at BEFORE
    update on users for EACH row
    execute FUNCTION update_updated_at_column ();
