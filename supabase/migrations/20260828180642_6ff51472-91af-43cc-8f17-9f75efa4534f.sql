CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.treinadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone_whatsapp TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.treinadores TO authenticated;
GRANT ALL ON public.treinadores TO service_role;
ALTER TABLE public.treinadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "treinadores_auth_all" ON public.treinadores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER treinadores_updated_at BEFORE UPDATE ON public.treinadores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  escalao TEXT,
  contacto_ee TEXT,
  notas_tecnicas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alunos TO authenticated;
GRANT ALL ON public.alunos TO service_role;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alunos_auth_all" ON public.alunos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER alunos_updated_at BEFORE UPDATE ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.treinos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_hora_inicio TIMESTAMPTZ NOT NULL,
  data_hora_fim TIMESTAMPTZ NOT NULL,
  treinador_id UUID REFERENCES public.treinadores(id) ON DELETE SET NULL,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE SET NULL,
  campo_local TEXT,
  estado TEXT NOT NULL DEFAULT 'Agendado' CHECK (estado IN ('Agendado','Concluído','Cancelado')),
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.treinos TO authenticated;
GRANT ALL ON public.treinos TO service_role;
ALTER TABLE public.treinos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "treinos_auth_all" ON public.treinos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER treinos_updated_at BEFORE UPDATE ON public.treinos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX treinos_inicio_idx ON public.treinos (data_hora_inicio);

CREATE TABLE public.configuracoes_notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hora_envio_diario TIME NOT NULL DEFAULT '20:00',
  canal_preferencial TEXT NOT NULL DEFAULT 'Email' CHECK (canal_preferencial IN ('Email','WhatsApp','Ambos')),
  chave_api_resend TEXT,
  chave_api_whatsapp TEXT,
  whatsapp_phone_id TEXT,
  email_remetente TEXT DEFAULT 'onboarding@resend.dev',
  fuso_horario TEXT NOT NULL DEFAULT 'Europe/Lisbon',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracoes_notificacoes TO authenticated;
GRANT ALL ON public.configuracoes_notificacoes TO service_role;
ALTER TABLE public.configuracoes_notificacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config_auth_all" ON public.configuracoes_notificacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER config_updated_at BEFORE UPDATE ON public.configuracoes_notificacoes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.configuracoes_notificacoes (hora_envio_diario, canal_preferencial) VALUES ('20:00', 'Email');

CREATE TABLE public.historico_lembretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treino_id UUID REFERENCES public.treinos(id) ON DELETE SET NULL,
  treinador_id UUID REFERENCES public.treinadores(id) ON DELETE SET NULL,
  data_envio TIMESTAMPTZ NOT NULL DEFAULT now(),
  canal TEXT NOT NULL,
  estado_envio TEXT NOT NULL,
  detalhe TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.historico_lembretes TO authenticated;
GRANT ALL ON public.historico_lembretes TO service_role;
ALTER TABLE public.historico_lembretes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "historico_auth_all" ON public.historico_lembretes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX historico_data_idx ON public.historico_lembretes (data_envio DESC);

CREATE TABLE public.cron_config (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  secret TEXT NOT NULL,
  endpoint TEXT NOT NULL
);
ALTER TABLE public.cron_config ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.cron_config TO service_role;
INSERT INTO public.cron_config (secret, endpoint) VALUES (
  encode(extensions.gen_random_bytes(32), 'hex'),
  'https://project--e7df9304-63a4-4a9d-ac91-19bc8e70b75b.lovable.app/api/public/cron/lembretes'
);

CREATE OR REPLACE FUNCTION public.disparar_lembretes_diarios()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE cfg RECORD;
BEGIN
  SELECT * INTO cfg FROM public.cron_config LIMIT 1;
  IF cfg IS NULL THEN RETURN; END IF;
  PERFORM net.http_post(
    url := cfg.endpoint,
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || cfg.secret),
    body := '{}'::jsonb
  );
END;
$$;

SELECT cron.schedule('lembretes-treinos-hourly', '0 * * * *', $$SELECT public.disparar_lembretes_diarios();$$);