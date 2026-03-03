import fetch from "node-fetch";

async function callVenice(prompt: string, maxTokens = 800): Promise<string> {
  const response = await fetch("https://api.venice.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VENICE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "zai-org/glm-4-9b-chat",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = (await response.json()) as any;
  return data.choices?.[0]?.message?.content || "No response";
}

export async function evaluateJob(requirements: Record<string, unknown>) {
  // Accept all — use defaults if missing
  return { accept: true, reason: "Accepted" };
}

export async function executeJob(requirements: Record<string, unknown>) {
  const { game_name, genre, chain, focus = "full_report", language = "mixed" } = requirements;
  const langMap: Record<string, string> = {
    english: "English only",
    indonesian: "Bahasa Indonesia only",
    mixed: "Mix Indonesian + English naturally",
  };

  const response = await callVenice(
    `You are Iseclaw, GameFi researcher for IsekaiDAO — Indonesia's top Web3 gaming community. You understand SEA gaming culture deeply.

GameFi Research: ${game_name}
${genre ? `Genre: ${genre}` : ""}
${chain ? `Chain: ${chain}` : ""}
Focus: ${focus}
Language: ${langMap[language as string]}

Provide research covering:
1. GAME OVERVIEW — gameplay, fun factor, graphics, accessibility for SEA players
2. P2E MECHANICS — earning potential, sustainability, token sink mechanisms
3. TOKENOMICS — token utility, inflation control, long-term viability
4. GUILD OPPORTUNITY — scholarship potential, guild ROI for Indonesian guilds
5. SEA/INDONESIA FIT — device requirements, internet requirements, language support
6. MARKET POSITION — competitors, unique edge
7. RISKS — rug risk, game dying, economic collapse
8. VERDICT — play/invest/guild/avoid with reasoning for Indonesian community

IsekaiDAO community trusts this research for real decisions.`,
    1500
  );

  return {
    deliverable: response,
  };
}
