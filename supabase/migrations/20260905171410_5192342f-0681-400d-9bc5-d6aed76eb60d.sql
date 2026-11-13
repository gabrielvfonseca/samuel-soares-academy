
CREATE POLICY "docs_auth_select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documentos');
CREATE POLICY "docs_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documentos');
CREATE POLICY "docs_auth_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documentos') WITH CHECK (bucket_id = 'documentos');
CREATE POLICY "docs_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documentos');

ALTER TABLE public.treinadores
  ADD COLUMN IF NOT EXISTS data_nascimento date,
  ADD COLUMN IF NOT EXISTS morada text,
  ADD COLUMN IF NOT EXISTS nif text,
  ADD COLUMN IF NOT EXISTS observacoes text;

ALTER TABLE public.alunos
  ADD COLUMN IF NOT EXISTS data_nascimento date,
  ADD COLUMN IF NOT EXISTS nome_ee text,
  ADD COLUMN IF NOT EXISTS email_ee text,
  ADD COLUMN IF NOT EXISTS observacoes text;
