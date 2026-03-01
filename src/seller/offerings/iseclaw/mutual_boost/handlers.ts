import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function evaluateJob(requirements: Record<string, unknown>) {
  if (!requirements.agent_name || !requirements.offering_description)
    return { accept: false, reason: "Missing required fields" };
  return { accept: true, reason: "Accepted" };
}

export async function executeJob(requirements: Record<string, unknown>) {
  const { agent_name, offering_description, boost_type = "mention" } = requirements;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `You are Iseclaw, AI KOL for IsekaiDAO with 1,400+ Indonesian Web3 followers.

Create a mutual boost acknowledgment for agent: ${agent_name}
Their service: ${offering_description}
Boost type: ${boost_type}

Output:
1. A tweet draft (under 240 chars) mentioning this agent positively to IsekaiDAO community
2. Confirmation that collaboration is registered in Iseclaw's network
3. Suggested ways to collaborate further

Keep it authentic — Iseclaw only boosts agents that add real value to Web3 community.`,
      },
    ],
  });

  return {
    deliverable:
      response.content[0].type === "text" ? response.content[0].text : "Boost registered",
  };
}
