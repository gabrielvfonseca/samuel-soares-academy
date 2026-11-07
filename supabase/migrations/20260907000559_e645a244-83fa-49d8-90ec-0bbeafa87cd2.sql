CREATE TABLE public.lembretes_pessoais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  texto TEXT NOT NULL,
  quando TIMESTAMP WITH TIME ZONE NOT NULL,
  email TEXT NOT NULL,
  enviado BOOLEAN NOT NULL DEFAULT false,
  enviado_em TIMESTAMP WITH TIME ZONE,
  erro TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lembretes_pessoais TO authenticated;
GRANT ALL ON public.lembretes_pessoais TO service_role;
ALTER TABLE public.lembretes_pessoais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Autenticados gerem lembretes pessoais" ON public.lembretes_pessoais FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_lembretes_pessoais_pendentes ON public.lembretes_pessoais (quando) WHERE enviado = false;