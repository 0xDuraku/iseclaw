import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function evaluateJob(requirements: Record<string, unknown>) {
  // Accept all — use defaults if missing
  return { accept: true, reason: "Accepted" };
}

export async function executeJob(requirements: Record<string, unknown>) {
  try {
    const { chain, min_apy = 5, risk_level = "all", language = "mixed" } = requirements;
    console.log(`[yield] executing: ${chain}`);
    const langStr =
      language === "indonesian"
        ? "Bahasa Indonesia"
        : language === "mixed"
          ? "Mix Indonesian+English"
          : "English";

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        {
          role: "user",
          content: `You are Iseclaw. Search current DeFi yield opportunities on ${chain === "all" ? "Base, Solana, and Monad" : chain}.

Min APY: ${min_apy}%. Risk level: ${risk_level}. Language: ${langStr}.

Output top 5 opportunities:
�� YIELD SCAN: ${chain.toUpperCase()}

For each opportunity:
Protocol: [name]
Chain: [chain]
Pool: [pair/strategy]
APY: X%
TVL: $X
Risk: LOW/MEDIUM/HIGH
Audit: Yes/No
Notes: [key info]

Bottom line: [best pick and why]

Use real data from DeFiLlama, protocol sites, or recent news.`,
        },
      ],
    });

    const text = response.content
      .map((b: any) => (b.type === "text" ? b.text : ""))
      .filter(Boolean)
      .join("\n");
    console.log(`[yield] done: ${text.length} chars`);
    return { deliverable: text || "Yield data unavailable" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { deliverable: `Error: ${msg}` };
  }
}
