CREATE TABLE public.clube_sessoes (
  id uuid not null default gen_random_uuid() primary key,
  clube_id uuid not null references public.clubes(id) on delete cascade,
  dia_semana smallint not null,
  hora_inicio time without time zone not null,
  hora_fim time without time zone not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clube_sessoes TO authenticated;
GRANT ALL ON public.clube_sessoes TO service_role;
ALTER TABLE public.clube_sessoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clube_sessoes_auth_all" ON public.clube_sessoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX clube_sessoes_clube_id_idx ON public.clube_sessoes (clube_id);
CREATE TRIGGER update_clube_sessoes_updated_at BEFORE UPDATE ON public.clube_sessoes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();