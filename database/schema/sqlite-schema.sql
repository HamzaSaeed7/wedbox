CREATE TABLE IF NOT EXISTS "migrations"(
  "id" integer primary key autoincrement not null,
  "migration" varchar not null,
  "batch" integer not null
);
CREATE TABLE IF NOT EXISTS "users"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "email" varchar not null,
  "email_verified_at" datetime,
  "password" varchar not null,
  "remember_token" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  "role" varchar check("role" in('customer', 'vendor', 'admin')) not null default 'customer',
  "banned_at" datetime,
  "stripe_customer_id" varchar,
  "vendor_plan" varchar,
  "vendor_subscription_status" varchar,
  "stripe_checkout_session_id" varchar
);
CREATE UNIQUE INDEX "users_email_unique" on "users"("email");
CREATE TABLE IF NOT EXISTS "password_reset_tokens"(
  "email" varchar not null,
  "token" varchar not null,
  "created_at" datetime,
  primary key("email")
);
CREATE TABLE IF NOT EXISTS "sessions"(
  "id" varchar not null,
  "user_id" integer,
  "ip_address" varchar,
  "user_agent" text,
  "payload" text not null,
  "last_activity" integer not null,
  primary key("id")
);
CREATE INDEX "sessions_user_id_index" on "sessions"("user_id");
CREATE INDEX "sessions_last_activity_index" on "sessions"("last_activity");
CREATE TABLE IF NOT EXISTS "cache"(
  "key" varchar not null,
  "value" text not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE INDEX "cache_expiration_index" on "cache"("expiration");
CREATE TABLE IF NOT EXISTS "cache_locks"(
  "key" varchar not null,
  "owner" varchar not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE INDEX "cache_locks_expiration_index" on "cache_locks"("expiration");
CREATE TABLE IF NOT EXISTS "jobs"(
  "id" integer primary key autoincrement not null,
  "queue" varchar not null,
  "payload" text not null,
  "attempts" integer not null,
  "reserved_at" integer,
  "available_at" integer not null,
  "created_at" integer not null
);
CREATE INDEX "jobs_queue_index" on "jobs"("queue");
CREATE TABLE IF NOT EXISTS "job_batches"(
  "id" varchar not null,
  "name" varchar not null,
  "total_jobs" integer not null,
  "pending_jobs" integer not null,
  "failed_jobs" integer not null,
  "failed_job_ids" text not null,
  "options" text,
  "cancelled_at" integer,
  "created_at" integer not null,
  "finished_at" integer,
  primary key("id")
);
CREATE TABLE IF NOT EXISTS "failed_jobs"(
  "id" integer primary key autoincrement not null,
  "uuid" varchar not null,
  "connection" varchar not null,
  "queue" varchar not null,
  "payload" text not null,
  "exception" text not null,
  "failed_at" datetime not null default CURRENT_TIMESTAMP
);
CREATE INDEX "failed_jobs_connection_queue_failed_at_index" on "failed_jobs"(
  "connection",
  "queue",
  "failed_at"
);
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" on "failed_jobs"("uuid");
CREATE TABLE IF NOT EXISTS "personal_access_tokens"(
  "id" integer primary key autoincrement not null,
  "tokenable_type" varchar not null,
  "tokenable_id" integer not null,
  "name" text not null,
  "token" varchar not null,
  "abilities" text,
  "last_used_at" datetime,
  "expires_at" datetime,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_index" on "personal_access_tokens"(
  "tokenable_type",
  "tokenable_id"
);
CREATE UNIQUE INDEX "personal_access_tokens_token_unique" on "personal_access_tokens"(
  "token"
);
CREATE INDEX "personal_access_tokens_expires_at_index" on "personal_access_tokens"(
  "expires_at"
);
CREATE TABLE IF NOT EXISTS "profiles"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "first_name" varchar not null,
  "last_name" varchar not null,
  "avatar_url" varchar,
  "address1" varchar,
  "address2" varchar,
  "city" varchar,
  "country" varchar,
  "postal_code" varchar,
  "phone" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "categories"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "slug" varchar not null,
  "description" text,
  "icon_url" varchar,
  "order" integer not null default '0',
  "created_at" datetime,
  "updated_at" datetime
);
CREATE UNIQUE INDEX "categories_slug_unique" on "categories"("slug");
CREATE TABLE IF NOT EXISTS "cities"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "country" varchar,
  "bar_price" numeric,
  "show_in_footer" tinyint(1) not null default '0',
  "created_at" datetime,
  "updated_at" datetime
);
CREATE TABLE IF NOT EXISTS "services"(
  "id" integer primary key autoincrement not null,
  "vendor_id" integer not null,
  "category_id" integer not null,
  "title" varchar not null,
  "description" text,
  "location" varchar,
  "images" text,
  "minimum_price" numeric not null default '0',
  "rating" numeric not null default '0',
  "review_count" integer not null default '0',
  "is_featured" tinyint(1) not null default '0',
  "status" varchar check("status" in('active', 'inactive', 'pending')) not null default 'active',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("vendor_id") references "users"("id") on delete cascade,
  foreign key("category_id") references "categories"("id")
);
CREATE INDEX "services_category_id_location_status_index" on "services"(
  "category_id",
  "location",
  "status"
);
CREATE TABLE IF NOT EXISTS "service_venues"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "min_people" integer not null,
  "max_people" integer not null,
  "price_per_person" numeric not null,
  "min_cost" numeric not null default '0',
  "location" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_caterings"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_catering_cuisines"(
  "id" integer primary key autoincrement not null,
  "service_catering_id" integer not null,
  "cuisine_name" varchar not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_catering_id") references "service_caterings"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_catering_menus"(
  "id" integer primary key autoincrement not null,
  "cuisine_id" integer not null,
  "name" varchar not null,
  "max_choices" integer not null default '1',
  "price" numeric not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("cuisine_id") references "service_catering_cuisines"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_catering_items"(
  "id" integer primary key autoincrement not null,
  "menu_id" integer not null,
  "name" varchar not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("menu_id") references "service_catering_menus"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_florists"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "fresh_flower_price" numeric not null default '0',
  "fake_flower_price" numeric not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_florist_packages"(
  "id" integer primary key autoincrement not null,
  "service_florist_id" integer not null,
  "name" varchar not null,
  "price" numeric not null,
  "type" varchar check("type" in('fresh', 'fake')) not null,
  "features" text,
  "images" text,
  "created_at" datetime,
  "updated_at" datetime,
  "tier" varchar,
  foreign key("service_florist_id") references "service_florists"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_florist_colors"(
  "id" integer primary key autoincrement not null,
  "service_florist_id" integer not null,
  "hex_color" varchar not null,
  "price" numeric not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_florist_id") references "service_florists"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_florist_designs"(
  "id" integer primary key autoincrement not null,
  "service_florist_id" integer not null,
  "name" varchar not null,
  "price" numeric not null,
  "images" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_florist_id") references "service_florists"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_florist_addons"(
  "id" integer primary key autoincrement not null,
  "service_florist_id" integer not null,
  "name" varchar not null,
  "price_per_unit" numeric not null,
  "unit" varchar not null default 'piece',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_florist_id") references "service_florists"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_car_hires"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "addon_options" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_car_hire_hours"(
  "id" integer primary key autoincrement not null,
  "service_car_hire_id" integer not null,
  "label" varchar not null,
  "price" numeric not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_car_hire_id") references "service_car_hires"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_car_hire_addons"(
  "id" integer primary key autoincrement not null,
  "service_car_hire_id" integer not null,
  "name" varchar not null,
  "image_url" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_car_hire_id") references "service_car_hires"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_photography"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_photography_packages"(
  "id" integer primary key autoincrement not null,
  "service_photography_id" integer not null,
  "package_name" varchar not null,
  "price" numeric not null,
  "includes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_photography_id") references "service_photography"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_photography_addons"(
  "id" integer primary key autoincrement not null,
  "package_id" integer not null,
  "name" varchar not null,
  "price" numeric not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("package_id") references "service_photography_packages"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_music"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "price_per_hour" numeric not null,
  "video_url" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_bride_dresses"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "price_rent" numeric not null,
  "price_buy" numeric not null,
  "available_sizes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_bride_dress_extras"(
  "id" integer primary key autoincrement not null,
  "service_bride_dress_id" integer not null,
  "name" varchar not null,
  "price" numeric not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_bride_dress_id") references "service_bride_dresses"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_groom_suites"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "price_rent" numeric not null,
  "price_buy" numeric not null,
  "jacket_sizes" text,
  "vest_sizes" text,
  "shirt_sizes" text,
  "bottom_sizes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_best_man_suits"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "price_rent" numeric not null,
  "price_buy" numeric not null,
  "jacket_sizes" text,
  "vest_sizes" text,
  "shirt_sizes" text,
  "bottom_sizes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_bridesmaids_dresses"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "price" numeric not null,
  "available_sizes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_flower_girl_dresses"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "price" numeric not null,
  "age_groups" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_yacht_hires"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "min_people" integer not null,
  "max_people" integer not null,
  "speed" varchar,
  "length" varchar,
  "cabin_crew" integer,
  "washroom" integer,
  "shower" integer,
  "chef_included" tinyint(1) not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_yacht_hire_hours"(
  "id" integer primary key autoincrement not null,
  "service_yacht_hire_id" integer not null,
  "label" varchar not null,
  "price" numeric not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_yacht_hire_id") references "service_yacht_hires"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_bachelors"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "price_per_hour" numeric not null,
  "price_per_person" numeric not null,
  "catamaran_price" numeric,
  "excursion_price" numeric,
  "bar_crawl_price" numeric,
  "night_out_price" numeric,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_bachelorettes"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "price_per_hour" numeric not null,
  "price_per_person" numeric not null,
  "catamaran_price" numeric,
  "excursion_price" numeric,
  "bar_crawl_price" numeric,
  "night_out_price" numeric,
  "spa_day_price" numeric,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_accommodations"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "location" varchar,
  "images" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_accommodation_rooms"(
  "id" integer primary key autoincrement not null,
  "accommodation_id" integer not null,
  "room_type" varchar not null,
  "price_per_night" numeric not null,
  "max_adults" integer not null,
  "max_kids" integer not null,
  "images" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("accommodation_id") references "service_accommodations"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_accommodation_facilities"(
  "id" integer primary key autoincrement not null,
  "accommodation_id" integer not null,
  "name" varchar not null,
  "price" numeric not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("accommodation_id") references "service_accommodations"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_bars"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "description" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_bar_menus"(
  "id" integer primary key autoincrement not null,
  "service_bar_id" integer not null,
  "name" varchar not null,
  "price" numeric not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_bar_id") references "service_bars"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_bar_menu_items"(
  "id" integer primary key autoincrement not null,
  "menu_id" integer not null,
  "name" varchar not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("menu_id") references "service_bar_menus"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "service_makeups"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "price_bridal" numeric,
  "price_after_wedding" numeric,
  "price_party" numeric,
  "price_trial_1" numeric,
  "price_trial_2" numeric,
  "available_date_trial_1" date,
  "available_date_trial_2" date,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "orders"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "service_id" integer not null,
  "vendor_id" integer not null,
  "price" numeric not null default '0',
  "deliver_date" date,
  "note" text,
  "status" varchar check("status" in('in_cart', 'pending', 'approved', 'rejected', 'completed', 'cancelled')) not null default 'in_cart',
  "stripe_session_id" varchar,
  "order_type" varchar not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade,
  foreign key("service_id") references "services"("id") on delete cascade,
  foreign key("vendor_id") references "users"("id")
);
CREATE INDEX "orders_user_id_status_index" on "orders"("user_id", "status");
CREATE INDEX "orders_vendor_id_status_index" on "orders"(
  "vendor_id",
  "status"
);
CREATE TABLE IF NOT EXISTS "order_venues"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "no_of_people" integer not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_caterings"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "adults" integer not null default '0',
  "kids" integer not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_catering_items"(
  "id" integer primary key autoincrement not null,
  "order_catering_id" integer not null,
  "cuisine_id" integer,
  "menu_id" integer,
  "item_id" integer,
  "price" numeric not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_catering_id") references "order_caterings"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_florists"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "type" varchar check("type" in('fresh', 'fake')) not null,
  "package_id" integer,
  "selected_colors" text,
  "selected_designs" text,
  "selected_addons" text,
  "inspiration_image_url" varchar,
  "fake_price" numeric not null default '0',
  "real_price" numeric not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_car_hires"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "hire_hour_id" integer,
  "pickup_location" varchar,
  "pickup_time" varchar,
  "dropoff_location" varchar,
  "dropoff_time" varchar,
  "selected_addons" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_photography"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "package_id" integer,
  "selected_addons" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_music"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "hours" integer not null,
  "entrance_song" varchar,
  "first_dance_song" varchar,
  "cutting_cake_song" varchar,
  "songs_list" text,
  "further_details" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_bride_dresses"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "type" varchar check("type" in('rent', 'buy')) not null,
  "sizes" text,
  "extras" text,
  "fitting_1" datetime,
  "fitting_2" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_groom_suites"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "type" varchar check("type" in('rent', 'buy')) not null,
  "jacket_size" varchar,
  "vest_size" varchar,
  "shirt_size" varchar,
  "bottom_size" varchar,
  "fitting_1" datetime,
  "fitting_2" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_best_man_suits"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "type" varchar check("type" in('rent', 'buy')) not null,
  "jacket_size" varchar,
  "vest_size" varchar,
  "shirt_size" varchar,
  "bottom_size" varchar,
  "fitting_1" datetime,
  "fitting_2" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_bridesmaids"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "sizes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_flower_girls"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "dress_size" varchar not null,
  "quantity" integer not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_yacht_hires"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "hire_hour_id" integer,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_bachelors"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "num_boys" integer not null,
  "hours" integer not null,
  "includes" text,
  "includes_price" numeric not null default '0',
  "total_price" numeric not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_bachelorettes"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "num_girls" integer not null,
  "hours" integer not null,
  "includes" text,
  "includes_price" numeric not null default '0',
  "total_price" numeric not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_hotels"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "room_id" integer,
  "room_type" varchar not null,
  "arrival_date" date not null,
  "departure_date" date not null,
  "facilities" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_bars"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "people" integer not null,
  "hours" integer not null,
  "city_id" integer,
  "address" varchar,
  "selected_menus" text,
  "price" numeric not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "order_makeups"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "date_bridal" datetime,
  "date_after_wedding" datetime,
  "date_party" datetime,
  "date_trial_1" datetime,
  "date_trial_2" datetime,
  "price_bridal" numeric not null default '0',
  "price_after_wedding" numeric not null default '0',
  "price_party" numeric not null default '0',
  "price_trial_1" numeric not null default '0',
  "price_trial_2" numeric not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "favorites"(
  "user_id" integer not null,
  "service_id" integer not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade,
  foreign key("service_id") references "services"("id") on delete cascade,
  primary key("user_id", "service_id")
);
CREATE TABLE IF NOT EXISTS "conversations"(
  "id" integer primary key autoincrement not null,
  "customer_id" integer not null,
  "vendor_id" integer not null,
  "service_id" integer,
  "last_message_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("customer_id") references "users"("id") on delete cascade,
  foreign key("vendor_id") references "users"("id") on delete cascade,
  foreign key("service_id") references "services"("id") on delete set null
);
CREATE TABLE IF NOT EXISTS "messages"(
  "id" integer primary key autoincrement not null,
  "conversation_id" integer not null,
  "sender_id" integer not null,
  "body" text not null,
  "read_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("conversation_id") references "conversations"("id") on delete cascade,
  foreign key("sender_id") references "users"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "reviews"(
  "id" integer primary key autoincrement not null,
  "service_id" integer not null,
  "user_id" integer not null,
  "rating" integer not null,
  "comment" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("service_id") references "services"("id") on delete cascade,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "testimonials"(
  "id" integer primary key autoincrement not null,
  "user_name" varchar not null,
  "location" varchar,
  "text" text not null,
  "photo_url" varchar,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE TABLE IF NOT EXISTS "blog_posts"(
  "id" integer primary key autoincrement not null,
  "slug" varchar not null,
  "title" varchar not null,
  "cover_image_url" varchar,
  "body" text not null,
  "read_time_minutes" integer not null default '5',
  "published_at" datetime,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE UNIQUE INDEX "blog_posts_slug_unique" on "blog_posts"("slug");
CREATE TABLE IF NOT EXISTS "contact_messages"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "email" varchar not null,
  "phone" varchar,
  "service" varchar,
  "message" text not null,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE TABLE IF NOT EXISTS "vendor_profiles"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "business_name" varchar,
  "business_description" text,
  "contact_first_name" varchar,
  "contact_last_name" varchar,
  "contact_title" varchar,
  "location" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  "category_id" integer,
  "address1" varchar,
  "address2" varchar,
  "country" varchar,
  "city" varchar,
  "phone" varchar,
  "avatar_url" varchar,
  "onboarding_completed" tinyint(1) not null default('0'),
  foreign key("category_id") references categories("id") on delete set null on update no action,
  foreign key("user_id") references users("id") on delete cascade on update no action
);
CREATE TABLE IF NOT EXISTS "order_hair"(
  "id" integer primary key autoincrement not null,
  "order_id" integer not null,
  "style" varchar,
  "people" integer not null default '1',
  "note" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("order_id") references "orders"("id") on delete cascade
);

INSERT INTO migrations VALUES(1,'0001_01_01_000000_create_users_table',1);
INSERT INTO migrations VALUES(2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO migrations VALUES(3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO migrations VALUES(4,'2026_06_01_051523_create_personal_access_tokens_table',1);
INSERT INTO migrations VALUES(5,'2026_06_01_100000_modify_users_add_role',1);
INSERT INTO migrations VALUES(6,'2026_06_01_100001_create_profiles_table',1);
INSERT INTO migrations VALUES(7,'2026_06_01_100002_create_vendor_profiles_table',1);
INSERT INTO migrations VALUES(8,'2026_06_01_100003_create_categories_table',1);
INSERT INTO migrations VALUES(9,'2026_06_01_100004_create_cities_table',1);
INSERT INTO migrations VALUES(10,'2026_06_01_100005_create_services_table',1);
INSERT INTO migrations VALUES(11,'2026_06_01_100006_create_service_subtables',1);
INSERT INTO migrations VALUES(12,'2026_06_01_100007_create_orders_table',1);
INSERT INTO migrations VALUES(13,'2026_06_01_100008_create_order_subtables',1);
INSERT INTO migrations VALUES(14,'2026_06_01_100009_create_supporting_tables',1);
INSERT INTO migrations VALUES(15,'2026_06_03_100001_add_vendor_subscription_to_users',2);
INSERT INTO migrations VALUES(16,'2026_06_03_100002_expand_vendor_profiles',2);
INSERT INTO migrations VALUES(17,'2026_06_03_074403_add_tier_to_service_florist_packages',3);
INSERT INTO migrations VALUES(18,'2026_06_03_103534_create_order_hair_table',4);
