"use server";

import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth.server";

const schema = z.object({
  vagas: z
    .array(
      z.object({
        data: z.string(),
        diaSemana: z.string(),
        campo: z.string(),
        treinador: z.string(),
        inicio: z.string(),
        fim: z.string(),
      }),
    )
    .max(200),
});

export async function sugerirMarcacoes(token: string, input: unknown) {
  await requireSupabaseAuth(token);
  const data = schema.parse(input);
  const { gerarSugestoes } = await import("../sugestoes.server");
  return { texto: await gerarSugestoes(data.vagas) };
}
