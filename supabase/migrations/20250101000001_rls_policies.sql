-- Row Level Security (RLS) Policies pour Communauto CC
-- Sécurité granulaire basée sur la propriété des données

-- Activer RLS sur toutes les tables
ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."file_uploads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."trips" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."balance_summary" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."subscriber_groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."upload_errors" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES POUR USER_PROFILES
-- ============================================================

-- Les utilisateurs peuvent voir et modifier leur propre profil
CREATE POLICY "Users can view own profile" ON "public"."user_profiles"
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON "public"."user_profiles"
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON "public"."user_profiles"
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- POLICIES POUR FILE_UPLOADS
-- ============================================================

-- Les utilisateurs peuvent voir leurs propres uploads
CREATE POLICY "Users can view own file uploads" ON "public"."file_uploads"
    FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres uploads
CREATE POLICY "Users can create own file uploads" ON "public"."file_uploads"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres uploads
CREATE POLICY "Users can update own file uploads" ON "public"."file_uploads"
    FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres uploads
CREATE POLICY "Users can delete own file uploads" ON "public"."file_uploads"
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- POLICIES POUR TRIPS
-- ============================================================

-- Les utilisateurs peuvent voir leurs trajets (principal + co-abonnés)
CREATE POLICY "Users can view own trips" ON "public"."trips"
    FOR SELECT USING (auth.uid() = user_id);

-- Seuls les services peuvent insérer des trajets (via extraction PDF)
CREATE POLICY "Service can insert trips" ON "public"."trips"
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- Les utilisateurs peuvent modifier leurs trajets (pour annotations, etc.)
CREATE POLICY "Users can update own trips" ON "public"."trips"
    FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs trajets
CREATE POLICY "Users can delete own trips" ON "public"."trips"
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- POLICIES POUR TRANSACTIONS
-- ============================================================

-- Les utilisateurs peuvent voir leurs transactions
CREATE POLICY "Users can view own transactions" ON "public"."transactions"
    FOR SELECT USING (auth.uid() = user_id);

-- Seuls les services peuvent insérer des transactions
CREATE POLICY "Service can insert transactions" ON "public"."transactions"
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- Les utilisateurs peuvent modifier leurs transactions
CREATE POLICY "Users can update own transactions" ON "public"."transactions"
    FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs transactions
CREATE POLICY "Users can delete own transactions" ON "public"."transactions"
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- POLICIES POUR BALANCE_SUMMARY
-- ============================================================

-- Les utilisateurs peuvent voir leurs résumés de balance
CREATE POLICY "Users can view own balance summary" ON "public"."balance_summary"
    FOR SELECT USING (auth.uid() = user_id);

-- Seuls les services peuvent insérer des résumés
CREATE POLICY "Service can insert balance summary" ON "public"."balance_summary"
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- POLICIES POUR SUBSCRIBER_GROUPS
-- ============================================================

-- Les utilisateurs peuvent voir leurs groupes d'abonnés
CREATE POLICY "Users can view own subscriber groups" ON "public"."subscriber_groups"
    FOR SELECT USING (auth.uid() = main_subscriber_id);

-- Les utilisateurs peuvent gérer leurs groupes d'abonnés
CREATE POLICY "Users can manage own subscriber groups" ON "public"."subscriber_groups"
    FOR ALL USING (auth.uid() = main_subscriber_id);

-- ============================================================
-- POLICIES POUR UPLOAD_ERRORS
-- ============================================================

-- Les utilisateurs peuvent voir leurs erreurs d'upload
CREATE POLICY "Users can view own upload errors" ON "public"."upload_errors"
    FOR SELECT USING (auth.uid() = user_id);

-- Seuls les services peuvent insérer des erreurs
CREATE POLICY "Service can insert upload errors" ON "public"."upload_errors"
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

-- Permissions pour les utilisateurs authentifiés
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."user_profiles" TO "authenticated";
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."file_uploads" TO "authenticated";
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."trips" TO "authenticated";
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."transactions" TO "authenticated";
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."balance_summary" TO "authenticated";
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."subscriber_groups" TO "authenticated";
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."upload_errors" TO "authenticated";

-- Permissions pour les services (Edge Functions)
GRANT ALL ON ALL TABLES IN SCHEMA "public" TO "service_role";
GRANT ALL ON ALL SEQUENCES IN SCHEMA "public" TO "service_role";

-- Permissions pour les utilisateurs anonymes (lecture limitée si nécessaire)
-- Actuellement aucune permission pour anon, tout doit être authentifié
