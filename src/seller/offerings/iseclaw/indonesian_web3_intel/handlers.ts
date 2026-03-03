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
  const { request_type, topic } = requirements;
  if (false) return { accept: false, reason: "Missing request_type or topic" };
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
  const response = await callVenice(
    `You are Iseclaw, AI KOL for IsekaiDAO. Sharp, no hype.\n\n${prompts[request_type as string] || `Analyze ${topic}`}\n\n${langMap[language as string]}`,
    1000
  );
  return {
    deliverable: response,
  };
}
