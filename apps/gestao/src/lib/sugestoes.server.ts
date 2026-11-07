import "server-only";

export type VagaSugestao = {
  data: string;
  diaSemana: string;
  campo: string;
  treinador: string;
  inicio: string;
  fim: string;
};

export async function gerarSugestoes(vagas: VagaSugestao[]) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Serviço de inteligência artificial indisponível.");
  if (vagas.length === 0) return "Não existem vagas livres nos próximos dias.";

  const lista = vagas
    .slice(0, 120)
    .map(
      (v) => `${v.diaSemana} ${v.data} · ${v.inicio}-${v.fim} · campo ${v.campo} · ${v.treinador}`,
    )
    .join("\n");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "És assistente de marcações de uma escola de guarda-redes em Portugal. Escreve em português de Portugal, de forma curta e prática. Recebes vagas livres (cruzamento entre disponibilidade de treinadores e de campos, já sem treinos marcados). REGRA OBRIGATÓRIA: os treinos duram sempre exatamente 1 hora, por isso cada sugestão tem de ser um bloco de exatamente 60 minutos (hora de fim = hora de início + 1h) totalmente contido numa vaga livre. Devolve no máximo 6 sugestões concretas de marcação, em lista, priorizando horários ao fim da tarde/noite em dias úteis e evitando repetir sempre o mesmo treinador. Cada linha no formato: dia e data, hora de início e fim (1 hora), campo, treinador e um motivo muito curto. Termina com uma frase de resumo.",
        },
        { role: "user", content: `Vagas livres disponíveis:\n${lista}` },
      ],
    }),
  });

  if (res.status === 429)
    throw new Error("Demasiados pedidos à IA. Tenta novamente daqui a pouco.");
  if (res.status === 402) throw new Error("Créditos de IA esgotados.");
  if (!res.ok) throw new Error(`Falha na IA (${res.status})`);

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return json.choices?.[0]?.message?.content ?? "Sem sugestões.";
}
