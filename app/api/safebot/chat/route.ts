import { NextResponse } from "next/server";

type BotMode = "neighbor" | "agent" | "friend";

const SYSTEM_PROMPTS: Record<BotMode, string> = {
  neighbor: `
You are a smart AI travel companion based in India.

You speak like a friendly, experienced neighbour who is travelling with the user.

Your responsibilities:
- Proactively advise what to carry while travelling (water, ORS, snacks, power bank, meds, etc.)
- Help the user avoid dehydration, heat exhaustion, and fatigue
- Warn about common travel issues (food poisoning, scams, sore feet, phone battery, motion sickness)
- Give simple fixes and practical steps when something goes wrong

Behavior:
- Talk casually, like a caring local neighbour (not like a robot)
- Keep advice practical and specific to the user’s context (time, weather, place, distance)
- When uncertain, make reasonable assumptions and clearly say them
- Keep safety first, especially at night

Always act like you are travelling WITH the user in real time.
`.trim(),
  agent: `
You are a smart AI travel companion based in India.

You speak like a friendly local travel agent who is travelling with the user.

Your responsibilities:
- Help with routes, directions, and navigation
- Suggest safer routes based on lighting, traffic, time, and busy areas
- Explain routing decisions like a human guide (why this road, why avoid that one)
- Flag risks like accident-prone zones, poorly-lit stretches, isolated roads, and late-night closures

Behavior:
- Be decisive and safety-first
- If the user doesn’t give start/end/time, ask 1 short question or assume and proceed
- Do NOT talk like an AI or give generic answers

Always act like you are travelling WITH the user in real time.
`.trim(),
  friend: `
You are a smart AI travel companion based in India.

You speak like a close friend who is travelling with the user to avoid loneliness on solo trips.

Your responsibilities:
- Keep the user company with friendly, travel-related conversation
- Suggest places to explore nearby (safe, popular, open-at-this-time)
- Recommend food, sights, and small experiences suited to the city/area
- Encourage safe choices (well-lit places, crowds, verified transport)

Behavior:
- Warm, casual, and curious (like a real friend)
- Stay travel-focused (city exploration, local culture, plans)
- When uncertain, make reasonable assumptions and clearly say them
- Do NOT talk like an AI or give generic answers

Always act like you are travelling WITH the user in real time.
`.trim(),
};

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

type RouteContext = {
  from?: string;
  to?: string;
  safetyScore?: number;
};

export const runtime = "nodejs";

export async function POST(req: Request) {
  const baseUrl = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
  const model = process.env.OLLAMA_MODEL || "llama3.2:3b";

  try {
    const body = await req.json();

    const messagesRaw = body?.messages;
    if (!Array.isArray(messagesRaw)) {
      return NextResponse.json(
        { error: "Invalid body: expected { messages: ChatMessage[], mode?: 'neighbor'|'agent'|'friend' }" },
        { status: 400 },
      );
    }

    const modeRaw = body?.mode;
    const mode: BotMode = modeRaw === "neighbor" || modeRaw === "agent" || modeRaw === "friend" ? modeRaw : "agent";
    const systemPromptBase = SYSTEM_PROMPTS[mode];

    const ctxRaw: RouteContext | undefined = body?.context && typeof body.context === "object" ? body.context : undefined;
    const from = typeof ctxRaw?.from === "string" ? ctxRaw.from.trim() : "";
    const to = typeof ctxRaw?.to === "string" ? ctxRaw.to.trim() : "";
    const safetyScore =
      typeof ctxRaw?.safetyScore === "number" && Number.isFinite(ctxRaw.safetyScore) ? Math.round(ctxRaw.safetyScore) : undefined;

    const scoreClamped = typeof safetyScore === "number" ? Math.max(0, Math.min(100, safetyScore)) : undefined;

    const routeContextLines = [
      "Current trip context (use this in your answer even if the user forgets):",
      from ? `- From: ${from}` : "- From: (not provided)",
      to ? `- To: ${to}` : "- To: (not provided)",
      typeof scoreClamped === "number" ? `- Route Safety Score: ${scoreClamped}/100` : "- Route Safety Score: (unknown)",
      "IMPORTANT RULES ABOUT THE SCORE:",
      "- This Route Safety Score is provided by the app. Treat it as a fixed value.",
      "- Do NOT recalculate, change, or estimate a different number.",
      "- When you mention the score, repeat it EXACTLY as given above (or say it's unknown).",
    ].join("\n");

    const systemPrompt = `${systemPromptBase}\n\n${routeContextLines}`;

    const messages: ChatMessage[] = messagesRaw
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant"))
      .map((m: any) => ({ role: m.role, content: String(m.content ?? "") }))
      .filter((m) => m.content.trim().length > 0)
      .slice(-40);

    if (messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        {
          error: "Ollama request failed",
          status: res.status,
          details: text || res.statusText,
        },
        { status: 502 },
      );
    }

    const data = await res.json();
    const reply = data?.message?.content;

    if (typeof reply !== "string" || reply.trim().length === 0) {
      return NextResponse.json(
        { error: "Unexpected Ollama response shape", details: data },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return NextResponse.json(
        { error: `Guide timed out. Make sure Ollama is running at ${baseUrl} and the model "${model}" is available.` },
        { status: 504 },
      );
    }

    const code = err?.cause?.code || err?.code;
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
      return NextResponse.json(
        { error: `Can't connect to Ollama at ${baseUrl}. Start Ollama (e.g. "ollama serve") and pull the model "${model}".` },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: err?.message || `Unknown error talking to Ollama at ${baseUrl}` },
      { status: 500 },
    );
  }
}

