CREATE TABLE public.clubes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  nif text,
  contacto text,
  email text,
  valor_mensal numeric NOT NULL DEFAULT 0,
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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clubes TO authenticated;
GRANT ALL ON public.clubes TO service_role;

ALTER TABLE public.clubes ENABLE ROW LEVEL SECURITY;

CREATE POLICY clubes_auth_all ON public.clubes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER clubes_updated_at BEFORE UPDATE ON public.clubes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.mensalidades ALTER COLUMN aluno_id DROP NOT NULL;
ALTER TABLE public.mensalidades ADD COLUMN clube_id uuid REFERENCES public.clubes(id) ON DELETE CASCADE;
ALTER TABLE public.mensalidades ADD CONSTRAINT mensalidades_alvo_unico CHECK (num_nonnulls(aluno_id, clube_id) = 1);
CREATE UNIQUE INDEX mensalidades_clube_mes_idx ON public.mensalidades (clube_id, mes_referencia) WHERE clube_id IS NOT NULL;

ALTER TABLE public.movimentos ADD COLUMN mensalidade_id uuid REFERENCES public.mensalidades(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX movimentos_mensalidade_auto_idx ON public.movimentos (mensalidade_id) WHERE automatico AND mensalidade_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sincronizar_movimento_mensalidade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE nome_alvo text; categoria_alvo text;
BEGIN
  IF NEW.estado_pagamento = 'Pago' AND coalesce(NEW.valor, 0) > 0 THEN
    IF NEW.clube_id IS NOT NULL THEN
      SELECT nome INTO nome_alvo FROM public.clubes WHERE id = NEW.clube_id;
      categoria_alvo := 'Clube (B2B)';
    ELSE
      SELECT nome INTO nome_alvo FROM public.alunos WHERE id = NEW.aluno_id;
      categoria_alvo := 'Mensalidade';
    END IF;
    INSERT INTO public.movimentos (tipo, categoria, descricao, valor, data, mensalidade_id, automatico)
    VALUES ('Entrada', categoria_alvo, coalesce(nome_alvo, 'Mensalidade') || ' · ' || to_char(NEW.mes_referencia, 'MM/YYYY'), NEW.valor, NEW.mes_referencia, NEW.id, true)
    ON CONFLICT (mensalidade_id) WHERE automatico AND mensalidade_id IS NOT NULL
    DO UPDATE SET valor = EXCLUDED.valor, data = EXCLUDED.data, descricao = EXCLUDED.descricao, categoria = EXCLUDED.categoria;
  ELSE
    DELETE FROM public.movimentos WHERE mensalidade_id = NEW.id AND automatico;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER mensalidades_movimento_sync
AFTER INSERT OR UPDATE ON public.mensalidades
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_movimento_mensalidade();