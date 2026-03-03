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
  const tokens_raw = requirements.tokens || "BTC,ETH,SOL";
  const { tokens = tokens_raw, language = "mixed" } = requirements;
  const langMap: Record<string, string> = {
    english: "English only",
    indonesian: "Bahasa Indonesia only",
    mixed: "Mix Indonesian + English",
  };

  const response = await callVenice(
    `You are Iseclaw. Give market context for these tokens: ${tokens}
Language: ${langMap[language as string]}

For each token provide:
- Current market narrative (what's driving price)
- Key level to watch
- Short-term sentiment (bullish/neutral/bearish + why)
- One actionable insight

Sharp and concise. Real alpha for Indonesian Web3 community.`,
    800
  );

  return {
    deliverable: response,
  };
}
