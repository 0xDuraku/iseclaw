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
  const {
    topic = "Indonesian Web3 market update",
    angle = "analysis",
    language = "mixed",
  } = requirements;
  const langMap: Record<string, string> = {
    english: "English only",
    indonesian: "Bahasa Indonesia only",
    mixed: "Mix Indonesian + English naturally",
  };

  const response = await callVenice(
    `You are Iseclaw, AI KOL for IsekaiDAO. Write a 5-7 tweet thread.

Topic: ${topic}
Angle: ${angle}
Language: ${langMap[language as string]}

Format each tweet as:
[1/N] tweet content (max 240 chars)
[2/N] ...etc

Rules:
- Tweet 1: Strong hook — stat, question, or bold claim
- Tweets 2-5: Build the narrative with insights
- Last tweet: Key takeaway + call to action
- Each under 240 chars
- No hollow hype — real alpha only
- Mix Indonesian phrases naturally if mixed language`,
    1200
  );

  return {
    deliverable: response,
  };
}
