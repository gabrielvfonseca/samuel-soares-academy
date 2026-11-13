CREATE TABLE public.disponibilidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treinador_id uuid NOT NULL REFERENCES public.treinadores(id) ON DELETE CASCADE,
  dia_semana smallint NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio time NOT NULL,
  hora_fim time NOT NULL,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (hora_fim > hora_inicio)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.disponibilidades TO authenticated;
GRANT SELECT, INSERT ON public.disponibilidades TO anon;
GRANT ALL ON public.disponibilidades TO service_role;

ALTER TABLE public.disponibilidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "disponibilidades_auth_all" ON public.disponibilidades
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "disponibilidades_anon_select" ON public.disponibilidades
  FOR SELECT TO anon USING (true);

CREATE POLICY "disponibilidades_anon_insert" ON public.disponibilidades
  FOR INSERT TO anon WITH CHECK (true);

CREATE TRIGGER disponibilidades_updated_at BEFORE UPDATE ON public.disponibilidades
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX disponibilidades_treinador_idx ON public.disponibilidades (treinador_id, dia_semana);

-- Permitir que o treinador se identifique na página pública partilhada
CREATE POLICY "treinadores_anon_select" ON public.treinadores
  FOR SELECT TO anon USING (ativo);

GRANT SELECT ON public.treinadores TO anon;