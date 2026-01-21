-- Correctifs pour les contraintes de clé étrangère et auto-création des profils

-- 1. Modifier la table file_uploads pour référencer directement auth.users
ALTER TABLE "public"."file_uploads" 
DROP CONSTRAINT IF EXISTS "file_uploads_user_id_fkey";

ALTER TABLE "public"."file_uploads" 
ADD CONSTRAINT "file_uploads_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- 2. Trigger function pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger pour créer le profil automatiquement lors de l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Créer des profils pour les utilisateurs existants (si ils existent)
INSERT INTO public.user_profiles (id, created_at, updated_at)
SELECT id, created_at, created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles);

-- 5. Mettre à jour le bucket storage pour correspondre à la référence
-- Supprimer l'ancien bucket s'il existe
DELETE FROM storage.objects WHERE bucket_id = 'invoices';
DELETE FROM storage.buckets WHERE id = 'invoices';

-- Créer le nouveau bucket 'uploads' (pour correspondre à la référence)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false, -- Bucket privé
  52428800, -- 50MB limit (comme dans la référence)
  ARRAY['application/pdf']::text[] -- Seulement les PDFs
)
ON CONFLICT (id) DO NOTHING;

-- 6. Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can upload invoices to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own invoices" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own invoices" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON storage.objects;

-- 7. Nouvelles RLS policies pour le bucket 'uploads'
CREATE POLICY "Users can upload files to their own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );