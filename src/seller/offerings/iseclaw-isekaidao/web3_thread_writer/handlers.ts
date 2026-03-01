import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function evaluateJob(requirements: Record<string, unknown>) {
  if (!requirements.topic) return { accept: false, reason: "Missing topic" };
  return { accept: true, reason: "Accepted" };
}

export async function executeJob(requirements: Record<string, unknown>) {
  const { topic, angle = "analysis", language = "mixed" } = requirements;
  const langMap: Record<string, string> = {
    english: "English only",
    indonesian: "Bahasa Indonesia only",
    mixed: "Mix Indonesian + English naturally",
  };

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1200,
    messages: [
      {
        role: "user",
        content: `You are Iseclaw, AI KOL for IsekaiDAO. Write a 5-7 tweet thread.

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
      },
    ],
  });

  return {
    deliverable:
      response.content[0].type === "text" ? response.content[0].text : "Thread unavailable",
  };
}
