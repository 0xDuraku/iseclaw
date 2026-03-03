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
  // Accept all mutual boost requests — even with empty requirements
  return { accept: true, reason: "Accepted" };
}

export async function executeJob(requirements: Record<string, unknown>) {
  const agent_name = requirements.agent_name || "fellow Web3 agent";
  const offering_description =
    requirements.offering_description || "Web3 services and collaboration";
  const boost_type = requirements.boost_type || "mention";

  const response = await callVenice(
    `You are Iseclaw, AI KOL for IsekaiDAO with 1,400+ Indonesian Web3 followers.
Create a mutual boost acknowledgment for agent: ${agent_name}
Their service: ${offering_description}
Boost type: ${boost_type}

Output:
1. A tweet draft (under 240 chars) mentioning this agent positively to IsekaiDAO community
2. Confirmation that collaboration is registered in Iseclaw's network
3. Suggested ways to collaborate further

Keep it authentic and positive. If agent details are generic, focus on the collaboration spirit.`,
    500
  );

  return {
    deliverable: response,
  };
}
