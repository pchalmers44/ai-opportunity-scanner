import { NextResponse } from "next/server";
import type { ScanResponse, Suggestion } from "../../../lib/scanTypes";

type ScanRequestBody = {
  prompt?: unknown;
};

function clampPriorityScore(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(100, Math.round(value)));
}

function computePriorityScore(input: Pick<Suggestion, "impact" | "effort" | "confidence">) {
  const impactScore = input.impact === "High" ? 90 : input.impact === "Medium" ? 60 : 30;
  const effortScore = input.effort === "Low" ? 80 : input.effort === "Medium" ? 50 : 20;
  const confidenceScore =
    input.confidence === "High" ? 90 : input.confidence === "Medium" ? 60 : 30;
  return clampPriorityScore(impactScore * 0.5 + effortScore * 0.3 + confidenceScore * 0.2);
}

function errorSuggestion(title: string, description: string): Suggestion {
  return {
    title,
    description,
    repetitiveTasks: [],
    automationType: "API",
    recommendedTools: [],
    impact: "Low",
    effort: "Low",
    confidence: "Low",
    priorityScore: 1,
    nextSteps: [],
    risks: [],
  };
}

function isToolList(value: unknown): value is Array<{ name: string; why: string }> {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const maybe = item as { name?: unknown; why?: unknown };
    return typeof maybe.name === "string" && typeof maybe.why === "string";
  });
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

function parseSuggestionsJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start >= 0 && end > start) {
      const slice = text.slice(start, end + 1);
      return JSON.parse(slice) as unknown;
    }
    throw new Error("Invalid JSON");
  }
}

function isSuggestions(value: unknown): value is Suggestion[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const maybe = item as Partial<Suggestion> & Record<string, unknown>;

    if (typeof maybe.title !== "string") return false;
    if (typeof maybe.description !== "string") return false;
    if (!isStringArray(maybe.repetitiveTasks)) return false;

    if (
      maybe.automationType !== "API" &&
      maybe.automationType !== "Webhook" &&
      maybe.automationType !== "Task Queue" &&
      maybe.automationType !== "Agent"
    ) {
      return false;
    }

    if (!isToolList(maybe.recommendedTools)) return false;

    if (maybe.impact !== "Low" && maybe.impact !== "Medium" && maybe.impact !== "High") {
      return false;
    }
    if (maybe.effort !== "Low" && maybe.effort !== "Medium" && maybe.effort !== "High") {
      return false;
    }
    if (maybe.confidence !== "Low" && maybe.confidence !== "Medium" && maybe.confidence !== "High") {
      return false;
    }

    if (typeof maybe.priorityScore !== "number") return false;
    if (!Number.isFinite(maybe.priorityScore)) return false;
    if (maybe.priorityScore < 1 || maybe.priorityScore > 100) return false;

    if (!isStringArray(maybe.nextSteps)) return false;
    if (!isStringArray(maybe.risks)) return false;

    return true;
  });
}

export async function POST(request: Request) {
  const requestId =
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : undefined;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const response: ScanResponse = {
      result: [],
      error:
        "Server misconfigured: missing OPENAI_API_KEY. Add it to `.env.local` and restart the dev server.",
      requestId,
    };
    return NextResponse.json(response, { status: 500 });
  }

  let body: ScanRequestBody;
  try {
    body = (await request.json()) as ScanRequestBody;
  } catch {
    const response: ScanResponse = {
      result: [],
      error: "Invalid JSON body; expected { prompt }.",
      requestId,
    };
    return NextResponse.json(response, { status: 400 });
  }

  if (typeof body.prompt !== "string") {
    const response: ScanResponse = {
      result: [],
      error: "`prompt` must be a string.",
      requestId,
    };
    return NextResponse.json(response, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    signal: controller.signal,
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            'You are an automation consultant. Return ONLY valid JSON: an array of objects with keys:\n- "title" (string)\n- "description" (string; concise summary + why the automationType fits)\n- "repetitiveTasks" (string[])\n- "automationType" (one of "API", "Webhook", "Task Queue", "Agent")\n- "recommendedTools" (array of { "name": string, "why": string } ; include 2-5 tools)\n- "impact" (one of "Low", "Medium", "High")\n- "effort" (one of "Low", "Medium", "High")\n- "confidence" (one of "Low", "Medium", "High")\n- "priorityScore" (number 1-100; higher = do sooner)\n- "nextSteps" (string[]; 3-6 concrete steps)\n- "risks" (string[]; key risks/constraints)\n\nScoring guidance:\n- Higher impact and higher confidence increase priority.\n- Higher effort decreases priority.\n\nDo not include markdown, code fences, or any extra text.',
        },
        { role: "user", content: body.prompt },
      ],
    }),
  }).finally(() => clearTimeout(timeout));

  if (!openaiResponse.ok) {
    let message = `OpenAI request failed with status ${openaiResponse.status}.`;
    try {
      const errorBody = (await openaiResponse.json()) as {
        error?: { message?: unknown };
      };
      if (typeof errorBody.error?.message === "string") message = errorBody.error.message;
    } catch {
      // ignore
    }
    const response: ScanResponse = {
      result: [],
      error: message,
      requestId,
    };
    return NextResponse.json(response, { status: 502 });
  }

  const data = (await openaiResponse.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    const response: ScanResponse = {
      result: [],
      error: "Unexpected OpenAI response format.",
      requestId,
    };
    return NextResponse.json(response, { status: 502 });
  }

  try {
    const parsed = parseSuggestionsJson(content);
    if (isSuggestions(parsed)) {
      const normalized = parsed
        .map((s) => {
          const fallbackScore = computePriorityScore(s);
          return {
            ...s,
            priorityScore: clampPriorityScore(s.priorityScore || fallbackScore),
          };
        })
        .sort((a, b) => b.priorityScore - a.priorityScore);

      const response: ScanResponse = { result: normalized, requestId };
      return NextResponse.json(response);
    }
  } catch {
    // ignore
  }

  const response: ScanResponse = {
    result: [errorSuggestion("Unstructured output", content)],
    error: "Model returned an unexpected format; showing raw output.",
    requestId,
  };
  return NextResponse.json(response, { status: 502 });
}
