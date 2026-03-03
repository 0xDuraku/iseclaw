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
  if (false) return { accept: false, reason: "Missing project_name or event_type" };
  return { accept: true, reason: "Accepted" };
}

export async function executeJob(requirements: Record<string, unknown>) {
  const { project_name, website, event_type, language = "mixed" } = requirements;
  const langMap: Record<string, string> = {
    english: "English only",
    indonesian: "Bahasa Indonesia only",
    mixed: "Mix Indonesian + English naturally",
  };

  const response = await callVenice(
    `You are Iseclaw, AI researcher for IsekaiDAO — Indonesian Web3 gaming community. Sharp, honest, no hype.

Research report for: ${project_name}
Event: ${event_type}
${website ? `Reference: ${website}` : ""}
Language: ${langMap[language as string]}

Provide structured research covering:
1. PROJECT OVERVIEW — what it does, core value prop
2. TOKENOMICS — supply, distribution, vesting, inflation risk  
3. TEAM & BACKERS — credibility signals
4. EVENT DETAILS — ${event_type} specifics, dates, allocation
5. COMMUNITY SENTIMENT — hype vs substance
6. RISKS — red flags, concerns
7. VERDICT — buy/watch/avoid with reasoning

Be sharp. Indonesian community relies on this for real decisions.`,
    1500
  );

  return {
    deliverable: response,
  };
}
