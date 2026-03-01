import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function evaluateJob(requirements: Record<string, unknown>) {
  if (!requirements.tokens) return { accept: false, reason: "Missing tokens" };
  return { accept: true, reason: "Accepted" };
}

export async function executeJob(requirements: Record<string, unknown>) {
  const { tokens, language = "mixed" } = requirements;
  const langMap: Record<string, string> = {
    english: "English only",
    indonesian: "Bahasa Indonesia only",
    mixed: "Mix Indonesian + English",
  };

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `You are Iseclaw. Give market context for these tokens: ${tokens}
Language: ${langMap[language as string]}

For each token provide:
- Current market narrative (what's driving price)
- Key level to watch
- Short-term sentiment (bullish/neutral/bearish + why)
- One actionable insight

Sharp and concise. Real alpha for Indonesian Web3 community.`,
      },
    ],
  });

  return {
    deliverable:
      response.content[0].type === "text" ? response.content[0].text : "Summary unavailable",
  };
}
