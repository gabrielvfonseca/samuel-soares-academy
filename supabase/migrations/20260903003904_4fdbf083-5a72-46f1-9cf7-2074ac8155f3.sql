select cron.schedule(
  'reiniciar-disponibilidades-semanal',
  '0 3 * * 6',
  $$delete from public.disponibilidades$$
);