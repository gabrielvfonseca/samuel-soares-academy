CREATE TABLE public.turmas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  escalao text,
  treinador_id uuid REFERENCES public.treinadores(id) ON DELETE SET NULL,
  campo_id uuid REFERENCES public.campos(id) ON DELETE SET NULL,
  dia_semana smallint,
  hora_inicio time,
  hora_fim time,
  ativo boolean NOT NULL DEFAULT true,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.turmas TO authenticated;
GRANT ALL ON public.turmas TO service_role;

ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

CREATE POLICY turmas_auth_all ON public.turmas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER turmas_updated_at BEFORE UPDATE ON public.turmas
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.alunos ADD COLUMN turma_id uuid REFERENCES public.turmas(id) ON DELETE SET NULL;
ALTER TABLE public.treinos ADD COLUMN turma_id uuid REFERENCES public.turmas(id) ON DELETE SET NULL;

CREATE INDEX idx_alunos_turma ON public.alunos(turma_id);
CREATE INDEX idx_treinos_turma ON public.treinos(turma_id);