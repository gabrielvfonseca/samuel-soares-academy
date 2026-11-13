ALTER TABLE public.treinadores
  ADD COLUMN IF NOT EXISTS valor_hora_individual numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_hora_grupo numeric NOT NULL DEFAULT 0;

ALTER TABLE public.alunos
  ADD COLUMN IF NOT EXISTS data_inscricao date,
  ADD COLUMN IF NOT EXISTS modalidade_inscricao text;

ALTER TABLE public.alunos DROP CONSTRAINT IF EXISTS alunos_modalidade_inscricao_check;
ALTER TABLE public.alunos ADD CONSTRAINT alunos_modalidade_inscricao_check
  CHECK (modalidade_inscricao IS NULL OR modalidade_inscricao IN ('Inscrição Base','Inscrição Pro','Inscrição Supreme'));

CREATE OR REPLACE FUNCTION public.e_dia_de_envio_mensal()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT (now() AT TIME ZONE 'Europe/Lisbon')::date IN (
    ((date_trunc('month', (now() AT TIME ZONE 'Europe/Lisbon')) + interval '1 month - 3 day')::date),
    ((date_trunc('month', (now() AT TIME ZONE 'Europe/Lisbon')) + interval '1 month - 2 day')::date)
  );
$$;

CREATE OR REPLACE FUNCTION public.disparar_resumo_faturas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE cfg RECORD;
BEGIN
  IF NOT public.e_dia_de_envio_mensal() THEN RETURN; END IF;
  SELECT * INTO cfg FROM public.cron_config LIMIT 1;
  IF cfg IS NULL THEN RETURN; END IF;
  PERFORM net.http_post(
    url := replace(cfg.endpoint, '/cron/lembretes', '/cron/faturas'),
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || cfg.secret),
    body := '{}'::jsonb
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.disparar_resumo_ordenados()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE cfg RECORD;
BEGIN
  IF NOT public.e_dia_de_envio_mensal() THEN RETURN; END IF;
  SELECT * INTO cfg FROM public.cron_config LIMIT 1;
  IF cfg IS NULL THEN RETURN; END IF;
  PERFORM net.http_post(
    url := replace(cfg.endpoint, '/cron/lembretes', '/cron/ordenados'),
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || cfg.secret),
    body := '{}'::jsonb
  );
END;
$function$;

SELECT cron.unschedule('resumo-faturas-mensal')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'resumo-faturas-mensal');

SELECT cron.schedule('resumo-faturas-mensal', '0 9 * * *', $$SELECT public.disparar_resumo_faturas();$$);

SELECT cron.unschedule('resumo-ordenados-mensal')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'resumo-ordenados-mensal');

SELECT cron.schedule('resumo-ordenados-mensal', '15 9 * * *', $$SELECT public.disparar_resumo_ordenados();$$);