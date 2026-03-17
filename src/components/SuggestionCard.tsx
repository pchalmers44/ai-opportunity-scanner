import type { Suggestion } from "@/lib/scanTypes";
import { Badge } from "./Badge";
import { Card } from "./Card";

function automationIcon(type: Suggestion["automationType"]) {
  const common = "h-4 w-4 shrink-0";

  switch (type) {
    case "API":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path
            d="M8.5 7.5L4 12l4.5 4.5M15.5 7.5L20 12l-4.5 4.5M13.5 5.5L10.5 18.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Webhook":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path
            d="M13 2L4 14h7l-1 8 10-14h-7l0-6Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Task Queue":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path
            d="M8 6h13M8 12h13M8 18h13"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "Agent":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path
            d="M12 2l1.3 4.2L18 8l-4.7 1.8L12 14l-1.3-4.2L6 8l4.7-1.8L12 2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M19 13l.7 2.2L22 16l-2.3.8L19 19l-.7-2.2L16 16l2.3-.8L19 13Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function levelTone(value: Suggestion["impact"] | Suggestion["effort"]) {
  if (value === "High") return "bg-red-100 text-red-800";
  if (value === "Medium")
    return "bg-amber-100 text-amber-900";
  return "bg-emerald-100 text-emerald-900";
}

function confidenceTone(value: Suggestion["confidence"]) {
  if (value === "High") return "bg-emerald-100 text-emerald-900";
  if (value === "Medium")
    return "bg-amber-100 text-amber-900";
  return "bg-red-100 text-red-800";
}

export function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  return (
    <Card className="p-0">
      <div className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-zinc-700">{automationIcon(suggestion.automationType)}</span>
              <div className="truncate text-base font-semibold text-[color:var(--foreground)]">
                {suggestion.title}
              </div>
            </div>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
              {suggestion.description}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Badge className="border border-[color:var(--border)] bg-[color:rgb(var(--brand-50))] text-[color:rgb(var(--brand-700))]">
              {automationIcon(suggestion.automationType)}
              <span>{suggestion.automationType}</span>
            </Badge>
            <Badge className={levelTone(suggestion.impact)}>Impact: {suggestion.impact}</Badge>
            <Badge className={levelTone(suggestion.effort)}>Effort: {suggestion.effort}</Badge>
            <Badge className={confidenceTone(suggestion.confidence)}>
              Confidence: {suggestion.confidence}
            </Badge>
            <Badge className="bg-indigo-100 text-indigo-900">
              Priority: {suggestion.priorityScore}
            </Badge>
          </div>
        </div>

        <details className="mt-4 rounded-xl border border-[color:var(--border)] bg-white/60 p-4">
          <summary className="cursor-pointer select-none text-sm font-medium text-[color:var(--foreground)]">
            Details
          </summary>
          <div className="mt-3 space-y-4 text-sm text-zinc-700">
            {suggestion.repetitiveTasks.length > 0 ? (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
                  Repetitive tasks
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {suggestion.repetitiveTasks.map((t, i) => (
                    <li key={`${t}-${i}`}>{t}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {suggestion.recommendedTools.length > 0 ? (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
                  Recommended tools
                </div>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {suggestion.recommendedTools.map((tool, i) => (
                    <div key={`${tool.name}-${i}`} className="space-y-1">
                      <Badge className="w-fit bg-zinc-200 text-zinc-800">
                        {tool.name}
                      </Badge>
                      <div className="text-sm text-zinc-700">{tool.why}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {suggestion.nextSteps.length > 0 ? (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
                  Next steps
                </div>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  {suggestion.nextSteps.map((step, i) => (
                    <li key={`${step}-${i}`}>{step}</li>
                  ))}
                </ol>
              </div>
            ) : null}

            {suggestion.risks.length > 0 ? (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
                  Risks
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {suggestion.risks.map((r, i) => (
                    <li key={`${r}-${i}`}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </details>
      </div>
    </Card>
  );
}