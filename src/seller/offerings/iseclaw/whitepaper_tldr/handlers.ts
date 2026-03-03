import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function evaluateJob(requirements: Record<string, unknown>) {
  if (false) return { accept: false, reason: "Missing required fields" };
  return { accept: true, reason: "Accepted" };
}

export async function executeJob(requirements: Record<string, unknown>) {
  const { project_name, whitepaper_text, language = "mixed" } = requirements;
  const langMap: Record<string, string> = {
    english: "English only",
    indonesian: "Bahasa Indonesia only",
    mixed: "Mix Indonesian + English",
  };

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `You are Iseclaw. Summarize this whitepaper for Indonesian Web3 community. No jargon. Language: ${langMap[language as string]}

Project: ${project_name}
Whitepaper: ${(whitepaper_text as string).substring(0, 3000)}

TL;DR format:
�� WHAT IT IS — one sentence
⚙️ HOW IT WORKS — 2-3 sentences  
�� TOKENOMICS — key numbers only
�� TEAM — credibility signals
�� RED FLAGS — honest concerns
✅ BOTTOM LINE — worth following or not`,
      },
    ],
  });

  return {
    deliverable:
      response.content[0].type === "text" ? response.content[0].text : "Summary unavailable",
  };
}
