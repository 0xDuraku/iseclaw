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
  try {
    const { token = "BTC", timeframe = "4h", language = "mixed" } = requirements;
    console.log(`[signal] executing: ${token} ${timeframe}`);
    const langStr =
      language === "indonesian"
        ? "Bahasa Indonesia"
        : language === "mixed"
          ? "Mix Indonesian+English"
          : "English";

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        {
          role: "user",
          content: `You are Iseclaw, trading signal analyst for IsekaiDAO. Search current price and market data for ${token}, then generate a trading signal.

Timeframe: ${timeframe}. Language: ${langStr}.

Output format:
�� ${token} SIGNAL [${timeframe}]
Direction: LONG / SHORT / NEUTRAL
Entry Zone: $X - $Y
Target 1: $X (+X%)
Target 2: $X (+X%)
Stop Loss: $X (-X%)
Confidence: X/10
Sentiment: Bullish/Bearish/Neutral
Key Catalyst: [what's driving this]
Risk: LOW/MEDIUM/HIGH

Use real current data. Be precise, not vague.`,
        },
      ],
    });

    const text = response.content
      .map((b: any) => (b.type === "text" ? b.text : ""))
      .filter(Boolean)
      .join("\n");
    console.log(`[signal] done: ${text.length} chars`);
    return { deliverable: text || "Signal unavailable" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { deliverable: `Error: ${msg}` };
  }
}
