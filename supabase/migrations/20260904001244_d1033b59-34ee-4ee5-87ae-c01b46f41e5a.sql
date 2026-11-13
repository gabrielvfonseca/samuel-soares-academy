CREATE TABLE public.movimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('Entrada','Saída')),
  categoria text NOT NULL DEFAULT 'Outros',
  descricao text,
  valor numeric(10,2) NOT NULL DEFAULT 0,
  data date NOT NULL DEFAULT (now() AT TIME ZONE 'Europe/Lisbon')::date,
  treino_id uuid REFERENCES public.treinos(id) ON DELETE CASCADE,
  treinador_id uuid REFERENCES public.treinadores(id) ON DELETE SET NULL,
  automatico boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.movimentos TO authenticated;
GRANT ALL ON public.movimentos TO service_role;

ALTER TABLE public.movimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY movimentos_auth_all ON public.movimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE UNIQUE INDEX movimentos_treino_auto_idx ON public.movimentos (treino_id) WHERE automatico;
CREATE INDEX movimentos_data_idx ON public.movimentos (data);

CREATE TRIGGER movimentos_updated_at BEFORE UPDATE ON public.movimentos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.sincronizar_movimento_treino()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tipo = 'Individual' THEN
    INSERT INTO public.movimentos (tipo, categoria, descricao, valor, data, treino_id, treinador_id, automatico)
    VALUES ('Entrada', 'Treino individual', 'Treino individual marcado', 40, (NEW.data_hora_inicio AT TIME ZONE 'Europe/Lisbon')::date, NEW.id, NEW.treinador_id, true)
    ON CONFLICT (treino_id) WHERE automatico
    DO UPDATE SET data = EXCLUDED.data, treinador_id = EXCLUDED.treinador_id;
  ELSE
    DELETE FROM public.movimentos WHERE treino_id = NEW.id AND automatico;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER treinos_movimento_sync
AFTER INSERT OR UPDATE OF tipo, data_hora_inicio, treinador_id ON public.treinos
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_movimento_treino();

INSERT INTO public.movimentos (tipo, categoria, descricao, valor, data, treino_id, treinador_id, automatico)
SELECT 'Entrada', 'Treino individual', 'Treino individual marcado', 40, (t.data_hora_inicio AT TIME ZONE 'Europe/Lisbon')::date, t.id, t.treinador_id, true
FROM public.treinos t WHERE t.tipo = 'Individual';