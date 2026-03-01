import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function evaluateJob(requirements: Record<string, unknown>) {
  if (!requirements.game_name) return { accept: false, reason: "Missing game_name" };
  return { accept: true, reason: "Accepted" };
}

export async function executeJob(requirements: Record<string, unknown>) {
  const { game_name, genre, chain, focus = "full_report", language = "mixed" } = requirements;
  const langMap: Record<string, string> = {
    english: "English only",
    indonesian: "Bahasa Indonesia only",
    mixed: "Mix Indonesian + English naturally",
  };

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `You are Iseclaw, GameFi researcher for IsekaiDAO — Indonesia's top Web3 gaming community. You understand SEA gaming culture deeply.

GameFi Research: ${game_name}
${genre ? `Genre: ${genre}` : ""}
${chain ? `Chain: ${chain}` : ""}
Focus: ${focus}
Language: ${langMap[language as string]}

Provide research covering:
1. GAME OVERVIEW — gameplay, fun factor, graphics, accessibility for SEA players
2. P2E MECHANICS — earning potential, sustainability, token sink mechanisms
3. TOKENOMICS — token utility, inflation control, long-term viability
4. GUILD OPPORTUNITY — scholarship potential, guild ROI for Indonesian guilds
5. SEA/INDONESIA FIT — device requirements, internet requirements, language support
6. MARKET POSITION — competitors, unique edge
7. RISKS — rug risk, game dying, economic collapse
8. VERDICT — play/invest/guild/avoid with reasoning for Indonesian community

IsekaiDAO community trusts this research for real decisions.`,
      },
    ],
  });

  return {
    deliverable:
      response.content[0].type === "text" ? response.content[0].text : "Research unavailable",
  };
}
