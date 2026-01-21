-- Création du bucket Storage pour les factures PDF
-- Compatible avec Supabase Storage

-- Créer le bucket 'invoices' pour stocker les PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false, -- Bucket privé
  10485760, -- 10MB limit
  ARRAY['application/pdf']::text[] -- Seulement les PDFs
);

-- RLS Policy pour le bucket 'invoices'
-- Les utilisateurs peuvent seulement accéder à leurs propres fichiers

CREATE POLICY "Users can upload invoices to their own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'invoices' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own invoices" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'invoices' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own invoices" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'invoices' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own invoices" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'invoices' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );