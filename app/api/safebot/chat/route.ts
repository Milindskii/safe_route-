import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are a smart AI travel companion based in India.

You speak like a friendly, knowledgeable local guide who travels with the user.

Your responsibilities:
- Help with routes, directions, and navigation
- Suggest safer routes based on conditions like lighting, traffic, and time
- Answer any travel-related doubts clearly and conversationally
- Explain decisions like a human guide, not like a robot
- Give practical, real-world advice (shortcuts, unsafe areas, busy zones)

Behavior:
- Speak casually but informatively (like a friend guiding you)
- Always prioritize safety when suggesting routes
- If data is missing, make reasonable assumptions and clearly mention them
- Do NOT talk like an AI or give generic answers

Always act like you are travelling WITH the user in real time.
`.trim();

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

export const runtime = "nodejs";

export async function POST(req: Request) {
  const baseUrl = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
  const model = process.env.OLLAMA_MODEL || "llama3.2:3b";

  try {
    const body = await req.json();

    const messagesRaw = body?.messages;
    if (!Array.isArray(messagesRaw)) {
      return NextResponse.json(
        { error: "Invalid body: expected { messages: ChatMessage[] }" },
        { status: 400 },
      );
    }

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
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
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

