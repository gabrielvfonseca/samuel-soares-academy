ALTER TABLE public.treinos ADD COLUMN clube_id uuid REFERENCES public.clubes(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS treinos_clube_id_idx ON public.treinos (clube_id);