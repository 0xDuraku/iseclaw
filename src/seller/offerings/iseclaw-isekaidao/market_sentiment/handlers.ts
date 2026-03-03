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
    const { scope = "overall", language = "mixed" } = requirements;
    console.log(`[sentiment] executing: ${scope}`);
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
          content: `You are Iseclaw. Search latest news and sentiment for "${scope}" crypto market.

Language: ${langStr}

Output:
�� SENTIMENT REPORT: ${scope}
Overall: BULLISH/BEARISH/NEUTRAL (X/10)
Fear & Greed: X/100
Trend: Improving/Declining/Stable
Key narratives driving sentiment (3 bullet points)
Risk factors to watch (2 bullet points)
Indonesian community angle: [relevant insight for Indo Web3]
Verdict: [1 sentence actionable takeaway]

Use real current data from search.`,
        },
      ],
    });

    const text = response.content
      .map((b: any) => (b.type === "text" ? b.text : ""))
      .filter(Boolean)
      .join("\n");
    console.log(`[sentiment] done: ${text.length} chars`);
    return { deliverable: text || "Sentiment unavailable" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { deliverable: `Error: ${msg}` };
  }
}
