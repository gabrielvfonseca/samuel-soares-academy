REVOKE ALL ON FUNCTION public.disparar_lembretes_diarios() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.disparar_lembretes_diarios() TO postgres, service_role;