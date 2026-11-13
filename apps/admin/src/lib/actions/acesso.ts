"use server";

/**
 * Acesso restrito: a plataforma é interna e a única forma de entrar é o
 * código de acesso da academia (secret CODIGO_ACESSO_INTERNO).
 * O código é validado no servidor e devolve a sessão da conta interna.
 */
const EMAIL_INTERNO = "equipa@samuelsoaresacademy.internal";

export async function entrarComCodigo(input: { codigo: string }) {
  const codigo = String(input?.codigo ?? "").trim();
  if (!codigo) {
    throw new Error("Código de acesso em falta");
  }

  const esperado = process.env.CODIGO_ACESSO_INTERNO;
  if (!esperado) {
    throw new Error("Código de acesso não configurado");
  }
  if (codigo !== esperado) {
    return { erro: "Código de acesso inválido", ok: false as const };
  }

  const password = `interno::${esperado}`;
  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );

  const { error: criarErro } = await supabaseAdmin.auth.admin.createUser({
    email: EMAIL_INTERNO,
    email_confirm: true,
    password,
  });

  if (criarErro) {
    // Conta já existe: garantir que a palavra-passe acompanha o código atual.
    const { data: lista } = await supabaseAdmin.auth.admin.listUsers();
    const utilizador = lista?.users.find((u) => u.email === EMAIL_INTERNO);
    if (!utilizador) {
      return { erro: criarErro.message, ok: false as const };
    }
    await supabaseAdmin.auth.admin.updateUserById(utilizador.id, { password });
  }

  const { data: sessao, error } = await supabaseAdmin.auth.signInWithPassword({
    email: EMAIL_INTERNO,
    password,
  });
  if (error || !sessao.session) {
    return {
      erro: error?.message ?? "Não foi possível iniciar sessão",
      ok: false as const,
    };
  }

  return {
    access_token: sessao.session.access_token,
    ok: true as const,
    refresh_token: sessao.session.refresh_token,
  };
}
