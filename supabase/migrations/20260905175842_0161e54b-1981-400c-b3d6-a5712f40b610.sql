ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS tipo_atleta text NOT NULL DEFAULT 'Individual';
ALTER TABLE public.alunos DROP CONSTRAINT IF EXISTS alunos_tipo_atleta_check;
ALTER TABLE public.alunos ADD CONSTRAINT alunos_tipo_atleta_check CHECK (tipo_atleta IN ('Individual','Grupo'));

UPDATE public.alunos a SET tipo_atleta = 'Grupo'
WHERE EXISTS (SELECT 1 FROM public.treinos t WHERE t.aluno_id = a.id AND t.tipo = 'Grupo')
   OR a.modalidade_inscricao IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.campos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  morada text,
  notas text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campos TO authenticated;
GRANT SELECT ON public.campos TO anon;
GRANT ALL ON public.campos TO service_role;
ALTER TABLE public.campos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS campos_auth_all ON public.campos;
CREATE POLICY campos_auth_all ON public.campos FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS campos_anon_select ON public.campos;
CREATE POLICY campos_anon_select ON public.campos FOR SELECT TO anon USING (ativo);
DROP TRIGGER IF EXISTS campos_updated_at ON public.campos;
CREATE TRIGGER campos_updated_at BEFORE UPDATE ON public.campos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.disponibilidades_campos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campo_id uuid NOT NULL REFERENCES public.campos(id) ON DELETE CASCADE,
  dia_semana smallint NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio time NOT NULL,
  hora_fim time NOT NULL CHECK (hora_fim > hora_inicio),
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.disponibilidades_campos TO authenticated;
GRANT SELECT ON public.disponibilidades_campos TO anon;
GRANT ALL ON public.disponibilidades_campos TO service_role;
ALTER TABLE public.disponibilidades_campos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS disp_campos_auth_all ON public.disponibilidades_campos;
CREATE POLICY disp_campos_auth_all ON public.disponibilidades_campos FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS disp_campos_anon_select ON public.disponibilidades_campos;
CREATE POLICY disp_campos_anon_select ON public.disponibilidades_campos FOR SELECT TO anon USING (true);
CREATE INDEX IF NOT EXISTS disp_campos_campo_idx ON public.disponibilidades_campos (campo_id, dia_semana);
DROP TRIGGER IF EXISTS disp_campos_updated_at ON public.disponibilidades_campos;
CREATE TRIGGER disp_campos_updated_at BEFORE UPDATE ON public.disponibilidades_campos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();