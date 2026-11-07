ALTER TABLE public.treinos ADD COLUMN IF NOT EXISTS nif text;
ALTER TABLE public.mensalidades ADD COLUMN IF NOT EXISTS nif text;

CREATE OR REPLACE FUNCTION public.sincronizar_movimento_treino()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.tipo = 'Individual' AND NEW.estado_pagamento = 'Pago' THEN
    INSERT INTO public.movimentos (tipo, categoria, descricao, valor, data, treino_id, treinador_id, automatico)
    VALUES ('Entrada', 'Treino individual', 'Treino individual pago', 40, (NEW.data_hora_inicio AT TIME ZONE 'Europe/Lisbon')::date, NEW.id, NEW.treinador_id, true)
    ON CONFLICT (treino_id) WHERE automatico
    DO UPDATE SET data = EXCLUDED.data, treinador_id = EXCLUDED.treinador_id;
  ELSE
    DELETE FROM public.movimentos WHERE treino_id = NEW.id AND automatico;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.sincronizar_movimento_treino() FROM public, anon, authenticated;

DELETE FROM public.movimentos m
USING public.treinos t
WHERE m.automatico AND m.treino_id = t.id
  AND NOT (t.tipo = 'Individual' AND t.estado_pagamento = 'Pago');

INSERT INTO public.movimentos (tipo, categoria, descricao, valor, data, treino_id, treinador_id, automatico)
SELECT 'Entrada', 'Treino individual', 'Treino individual pago', 40,
       (t.data_hora_inicio AT TIME ZONE 'Europe/Lisbon')::date, t.id, t.treinador_id, true
FROM public.treinos t
WHERE t.tipo = 'Individual' AND t.estado_pagamento = 'Pago'
ON CONFLICT (treino_id) WHERE automatico DO NOTHING;

CREATE OR REPLACE FUNCTION public.disparar_resumo_faturas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE cfg RECORD;
BEGIN
  SELECT * INTO cfg FROM public.cron_config LIMIT 1;
  IF cfg IS NULL THEN RETURN; END IF;
  PERFORM net.http_post(
    url := replace(cfg.endpoint, '/cron/lembretes', '/cron/faturas'),
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || cfg.secret),
    body := '{}'::jsonb
  );
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.disparar_resumo_faturas() FROM public, anon, authenticated;

SELECT cron.schedule('resumo-faturas-mensal', '0 9 29,30 * *', 'SELECT public.disparar_resumo_faturas();');