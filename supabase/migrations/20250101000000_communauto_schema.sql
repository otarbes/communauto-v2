-- Migration pour le schéma Communauto CC
-- Basé sur communauto-nss avec améliorations architecturales

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Extensions requises
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

SET default_tablespace = '';
SET default_table_access_method = "heap";

-- Table user_profiles (extension des users auth.users)
CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" REFERENCES "auth"."users" ON DELETE CASCADE NOT NULL,
    "account_number" "text", -- Numéro d'abonné Communauto principal
    "display_name" "text",
    "current_plan" "text",
    "plan_expiry" "date",
    "onboarding_completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- Table file_uploads (fichiers PDF uploadés)
CREATE TABLE IF NOT EXISTS "public"."file_uploads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE NOT NULL,
    "filename" "text" NOT NULL,
    "file_path" "text" NOT NULL, -- Chemin dans Supabase Storage
    "account_number" "text",
    "billing_period" "text",
    "invoice_number" "text",
    "current_plan" "text",
    "plan_expiry" "date",
    "total_amount" numeric(10,2),
    "processed" boolean DEFAULT false,
    "processed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    UNIQUE("filename", "user_id")
);

-- Table trips (trajets extraits des factures)
CREATE TABLE IF NOT EXISTS "public"."trips" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "file_upload_id" "uuid" REFERENCES "public"."file_uploads"("id") ON DELETE CASCADE,
    "user_id" "uuid" REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE NOT NULL,
    "vehicle_number" "text" NOT NULL,
    "user_number" "text" NOT NULL, -- Peut être différent de l'abonné principal (co-abonnés)
    "start_datetime" timestamp with time zone NOT NULL,
    "end_datetime" timestamp with time zone NOT NULL,
    "days" "text",
    "hours" "text",
    "time_price" numeric(10,2) NOT NULL,
    "km" numeric(10,2) NOT NULL,
    "km_price" numeric(10,2) NOT NULL,
    "reservation_fee" numeric(10,2) NOT NULL,
    "other_fee_credit" numeric(10,2) NOT NULL,
    "description" "text",
    "total_due" numeric(10,2) NOT NULL,
    "rate_applied" "text",
    "purchase_credit" numeric(10,2) NOT NULL,
    "note" "text",
    "billing_period" "text",
    "invoice_number" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- Table transactions (transactions financières)
CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "file_upload_id" "uuid" REFERENCES "public"."file_uploads"("id") ON DELETE CASCADE,
    "user_id" "uuid" REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE NOT NULL,
    "user_number" "text" NOT NULL,
    "transaction_date" "date" NOT NULL,
    "type" "text",
    "description" "text",
    "cost" numeric(10,2) NOT NULL,
    "tps" numeric(10,2),
    "tvq" numeric(10,2),
    "total" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- Table balance_summary (résumés de facturation)
CREATE TABLE IF NOT EXISTS "public"."balance_summary" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "file_upload_id" "uuid" REFERENCES "public"."file_uploads"("id") ON DELETE CASCADE,
    "user_id" "uuid" REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE NOT NULL,
    "previous_balance" numeric(10,2),
    "payments" numeric(10,2),
    "remaining_balance" numeric(10,2),
    "late_interest" numeric(10,2),
    "trips_total" numeric(10,2),
    "tps" numeric(10,2),
    "tvq" numeric(10,2),
    "purchase_credits" numeric(10,2),
    "other_transactions" numeric(10,2),
    "new_period_total" numeric(10,2),
    "new_balance" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- Table subscriber_groups (groupes d'abonnés - principal + co-abonnés)
CREATE TABLE IF NOT EXISTS "public"."subscriber_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "main_subscriber_id" "uuid" REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE NOT NULL,
    "subscriber_number" "text" NOT NULL, -- Numéro du co-abonné
    "display_name" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    UNIQUE("main_subscriber_id", "subscriber_number")
);

-- Table upload_errors (erreurs de traitement)
CREATE TABLE IF NOT EXISTS "public"."upload_errors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE,
    "file_name" "text",
    "error_message" "text" NOT NULL,
    "error_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS "idx_trips_user_id" ON "public"."trips"("user_id");
CREATE INDEX IF NOT EXISTS "idx_trips_start_datetime" ON "public"."trips"("start_datetime");
CREATE INDEX IF NOT EXISTS "idx_trips_user_number" ON "public"."trips"("user_number");
CREATE INDEX IF NOT EXISTS "idx_transactions_user_id" ON "public"."transactions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_transactions_date" ON "public"."transactions"("transaction_date");
CREATE INDEX IF NOT EXISTS "idx_file_uploads_user_id" ON "public"."file_uploads"("user_id");
CREATE INDEX IF NOT EXISTS "idx_subscriber_groups_main_id" ON "public"."subscriber_groups"("main_subscriber_id");

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER "update_user_profiles_updated_at"
    BEFORE UPDATE ON "public"."user_profiles"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_file_uploads_updated_at"
    BEFORE UPDATE ON "public"."file_uploads"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
