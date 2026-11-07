"use server";

/**
 * Acesso restrito: a plataforma é interna e a única forma de entrar é o
 * código de acesso da academia (secret CODIGO_ACESSO_INTERNO).
 * O código é validado no servidor e devolve a sessão da conta interna.
 */
const EMAIL_INTERNO = "equipa@samuelsoaresacademy.internal";

export async function entrarComCodigo(input: { codigo: string }) {
  const codigo = String(input?.codigo ?? "").trim();
  if (!codigo) throw new Error("Código de acesso em falta");

  const esperado = process.env["CODIGO_ACESSO_INTERNO"];
  if (!esperado) throw new Error("Código de acesso não configurado");
  if (codigo !== esperado) {
    return { ok: false as const, erro: "Código de acesso inválido" };
  }

  const password = `interno::${esperado}`;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { error: criarErro } = await supabaseAdmin.auth.admin.createUser({
    email: EMAIL_INTERNO,
    password,
    email_confirm: true,
  });

  if (criarErro) {
    // Conta já existe: garantir que a palavra-passe acompanha o código atual.
    const { data: lista } = await supabaseAdmin.auth.admin.listUsers();
    const utilizador = lista?.users.find((u) => u.email === EMAIL_INTERNO);
    if (!utilizador) return { ok: false as const, erro: criarErro.message };
    await supabaseAdmin.auth.admin.updateUserById(utilizador.id, { password });
  }

  const { data: sessao, error } = await supabaseAdmin.auth.signInWithPassword({
    email: EMAIL_INTERNO,
    password,
  });
  if (error || !sessao.session) {
    return { ok: false as const, erro: error?.message ?? "Não foi possível iniciar sessão" };
  }

  return {
    ok: true as const,
    access_token: sessao.session.access_token,
    refresh_token: sessao.session.refresh_token,
  };
}
