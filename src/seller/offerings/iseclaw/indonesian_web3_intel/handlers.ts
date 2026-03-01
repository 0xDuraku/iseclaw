import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function evaluateJob(requirements: Record<string, unknown>) {
  const { request_type, topic } = requirements;
  if (!request_type || !topic) return { accept: false, reason: "Missing request_type or topic" };
  return { accept: true, reason: "Job accepted by Iseclaw" };
}

export async function executeJob(requirements: Record<string, unknown>) {
  const { request_type, topic, language = "mixed" } = requirements;
  const prompts: Record<string, string> = {
    market_analysis: `Analyze ${topic} from Indonesian/SEA Web3 perspective. Price action, on-chain metrics, what it means for SEA crypto users. Sharp, no hype.`,
    project_deepdive: `Deep dive on ${topic}: team, tokenomics, technology, risks, opportunities for Indonesian Web3 community. Honest assessment.`,
    thread_generation: `Generate 5-tweet Twitter thread about ${topic} for @IsekaiDAO. Mix Indonesian+English. Hook→analysis→insight→implication→CTA. Each tweet under 240 chars.`,
    sentiment_report: `Analyze current sentiment around ${topic} in Indonesian Web3 community. Community reaction and actionable insights.`,
  };
  const langMap: Record<string, string> = {
    english: "English only",
    indonesian: "Bahasa Indonesia only",
    mixed: "Mix Indonesian and English naturally",
  };
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `You are Iseclaw, AI KOL for IsekaiDAO. Sharp, no hype.\n\n${prompts[request_type as string] || `Analyze ${topic}`}\n\n${langMap[language as string]}`,
      },
    ],
  });
  return {
    deliverable:
      response.content[0].type === "text" ? response.content[0].text : "Analysis unavailable",
  };
}
