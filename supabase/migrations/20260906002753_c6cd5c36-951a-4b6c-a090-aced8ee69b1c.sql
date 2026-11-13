CREATE OR REPLACE FUNCTION public.disparar_resumo_mensalidades()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE cfg RECORD;
BEGIN
  IF EXTRACT(DAY FROM (now() AT TIME ZONE 'Europe/Lisbon'))::int <> 3 THEN RETURN; END IF;
  SELECT * INTO cfg FROM public.cron_config LIMIT 1;
  IF cfg IS NULL THEN RETURN; END IF;
  PERFORM net.http_post(
    url := replace(cfg.endpoint, '/cron/lembretes', '/cron/mensalidades'),
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || cfg.secret),
    body := '{}'::jsonb
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.disparar_resumo_mensalidades() FROM PUBLIC, anon, authenticated;