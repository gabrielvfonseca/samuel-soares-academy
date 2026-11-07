ALTER TABLE public.treinos
  ADD COLUMN tipo text NOT NULL DEFAULT 'Individual';

ALTER TABLE public.treinos
  ADD CONSTRAINT treinos_tipo_check CHECK (tipo IN ('Individual','Grupo'));

CREATE TABLE public.mensalidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  mes_referencia date NOT NULL,
  valor numeric(10,2),
  estado_pagamento text NOT NULL DEFAULT 'A aguardar pagamento',
  fatura text,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mensalidades_estado_check CHECK (estado_pagamento IN ('A aguardar pagamento','Pago')),
  CONSTRAINT mensalidades_fatura_check CHECK (fatura IS NULL OR fatura IN ('Com fatura','Sem fatura')),
  CONSTRAINT mensalidades_unicas UNIQUE (aluno_id, mes_referencia)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mensalidades TO authenticated;
GRANT ALL ON public.mensalidades TO service_role;

ALTER TABLE public.mensalidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY mensalidades_auth_all ON public.mensalidades
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER mensalidades_updated_at
  BEFORE UPDATE ON public.mensalidades
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_mensalidades_mes ON public.mensalidades(mes_referencia);