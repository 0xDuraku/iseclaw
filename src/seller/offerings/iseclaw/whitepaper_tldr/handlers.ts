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

  const response = await callVenice(
    `You are Iseclaw. Summarize this whitepaper for Indonesian Web3 community. No jargon. Language: ${langMap[language as string]}

Project: ${project_name}
Whitepaper: ${(whitepaper_text as string).substring(0, 3000)}

TL;DR format:
�� WHAT IT IS — one sentence
⚙️ HOW IT WORKS — 2-3 sentences  
�� TOKENOMICS — key numbers only
�� TEAM — credibility signals
�� RED FLAGS — honest concerns
✅ BOTTOM LINE — worth following or not`,
    1000
  );

  return {
    deliverable: response,
  };
}
