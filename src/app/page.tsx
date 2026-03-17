"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { Section } from "@/components/Section";
import { SuggestionCard } from "@/components/SuggestionCard";
import { AnimatePresence, motion, useReducedMotion } from "@/components/motion";
import type { ScanResponse, Suggestion } from "@/lib/scanTypes";

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(true);
  const [resultsKey, setResultsKey] = useState(0);

  const examples = [
    "Customer support email triage workflow",
    "Sales lead qualification workflow",
    "Weekly reporting workflow",
    "Marketing content pipeline",
  ] as const;

  async function runScan() {
    setIsLoading(true);
    setError(null);
    setCopyStatus(null);

    if (result.length > 0) {
      setShowResults(false);
    } else {
      setResult([]);
    }

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      let data: ScanResponse | null = null;
      try {
        data = (await res.json()) as ScanResponse;
      } catch {
        // ignore
      }

      if (data?.requestId) {
        // helpful for internal debugging; intentionally not shown as a primary UI element
        console.info("scan requestId:", data.requestId);
      }

      if (!res.ok) {
        const message =
          data?.error || data?.result?.[0]?.description || `Request failed (${res.status}).`;
        setError(message);
        setResult([]);
        return;
      }

      if (data?.error) setError(data.error);
      setResult(data?.result ?? []);
      setResultsKey((k) => k + 1);
      setShowResults(true);
    } catch {
      setError("Network error. Please try again.");
      setResult([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runScan();
  }

  const sorted = useMemo(() => {
    return [...result].sort((a, b) => b.priorityScore - a.priorityScore);
  }, [result]);
  const hasSuggestions = sorted.length > 0;

  const heroContainer = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  } as const;

  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0 },
  } as const;

  function suggestionsAsJson() {
    return JSON.stringify(sorted, null, 2);
  }

  function suggestionsAsMarkdown() {
    const lines: string[] = [];
    lines.push("# AI Automation Opportunity Scanner Report");
    lines.push("");
    lines.push("## Input");
    lines.push("");
    lines.push(prompt.trim() ? prompt.trim() : "_(empty)_");
    lines.push("");
    lines.push("## Suggestions");
    lines.push("");

    sorted.forEach((s, idx) => {
      lines.push(
        `${idx + 1}. **${s.title}** (Priority: ${s.priorityScore}, Type: ${s.automationType}, Impact: ${s.impact}, Effort: ${s.effort}, Confidence: ${s.confidence})`,
      );
      lines.push("");
      lines.push(`   ${s.description.replaceAll("\n", "\n   ")}`);
      lines.push("");

      if (s.repetitiveTasks.length > 0) {
        lines.push("   **Repetitive tasks**");
        s.repetitiveTasks.forEach((t) => lines.push(`   - ${t}`));
        lines.push("");
      }

      if (s.recommendedTools.length > 0) {
        lines.push("   **Recommended tools**");
        s.recommendedTools.forEach((tool) => lines.push(`   - ${tool.name}: ${tool.why}`));
        lines.push("");
      }

      if (s.nextSteps.length > 0) {
        lines.push("   **Next steps**");
        s.nextSteps.forEach((step) => lines.push(`   1. ${step}`));
        lines.push("");
      }

      if (s.risks.length > 0) {
        lines.push("   **Risks**");
        s.risks.forEach((r) => lines.push(`   - ${r}`));
        lines.push("");
      }
    });

    return lines.join("\n");
  }

  function downloadText(filename: string, text: string, mimeType: string) {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied.");
    } catch {
      setCopyStatus("Copy failed.");
    } finally {
      window.setTimeout(() => setCopyStatus(null), 1500);
    }
  }

  return (
    <div className="bg-white">
      <Container>
        <Section className="pb-6 pt-12 sm:pb-10 sm:pt-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <motion.div
              variants={heroContainer}
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? undefined : "show"}
              className="space-y-4"
            >
              <motion.div variants={fadeUp}>
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white/80 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm shadow-zinc-950/5 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  Internal-ready scanner
                </div>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl"
              >
                <span className="block">AI Automation</span>
                <span className="block text-[color:rgb(var(--brand-600))]">Opportunity Scanner</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="max-w-xl text-base leading-7 text-[color:var(--muted)]">
                Paste a workflow description and get prioritized automation opportunities, with
                recommended implementation approaches and tools.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--muted)]">
                <span className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1">
                  Structured suggestions
                </span>
                <span className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1">
                  Scoring & prioritization
                </span>
                <span className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1">
                  Exportable reports
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="p-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="prompt"
                    className="text-sm font-medium text-[color:var(--foreground)]"
                  >
                    Workflow description
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") void runScan();
                    }}
                    placeholder="Include systems, steps, handoffs, volume, SLAs, and where time is spent..."
                    disabled={isLoading}
                    rows={7}
                    className="w-full resize-y rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:rgb(var(--brand-600))]/50 focus:ring-4 focus:ring-[color:rgb(var(--brand-600))]/15"
                  />
                  <div className="text-xs text-zinc-500">
                    Tip: press Ctrl/⌘ + Enter to scan.
                  </div>
                </div>

                  <div className="flex flex-wrap items-center gap-3">
                  <motion.button
                    type="submit"
                    disabled={isLoading || prompt.trim().length === 0}
                    whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 450, damping: 28 }}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:rgb(var(--brand-600))] px-5 text-sm font-semibold text-white shadow-sm shadow-violet-500/20 transition-colors hover:bg-[color:rgb(var(--brand-700))] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "Scanning..." : "Scan workflow"}
                  </motion.button>
                  {isLoading ? (
                    <div className="inline-flex items-center gap-2 text-sm text-[color:var(--muted)]">
                      <motion.span
                        aria-hidden="true"
                        className="h-4 w-4 rounded-full border-2 border-zinc-300 border-t-zinc-800"
                        animate={reduceMotion ? undefined : { rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      />
                      <motion.span
                        animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                      >
                        Analyzing workflow…
                      </motion.span>
                    </div>
                  ) : null}
                </div>

                {error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {error}
                  </div>
                ) : null}
              </form>
              </Card>
            </motion.div>
          </div>
        </Section>

        <Section
          id="examples"
          title="Examples"
          subtitle="Start with a template and customize it for your team."
          className="border-t border-[color:var(--border)]"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {examples.map((example) => (
              <motion.button
                key={example}
                type="button"
                disabled={isLoading}
                onClick={() => setPrompt(example)}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className="group rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 text-left text-sm text-zinc-800 shadow-sm shadow-zinc-950/5 transition-shadow hover:shadow-md hover:shadow-zinc-950/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[color:var(--foreground)]">{example}</div>
                  <span className="rounded-full bg-[color:rgb(var(--brand-50))] px-2 py-0.5 text-xs font-medium text-[color:rgb(var(--brand-700))] transition-colors group-hover:bg-[color:rgb(var(--brand-50))]">
                    Use
                  </span>
                </div>
                <div className="mt-2 text-xs text-zinc-500">Click to autofill the workflow input.</div>
              </motion.button>
            ))}
          </motion.div>
        </Section>

        <Section
          id="results"
          title="Results"
          subtitle="Sorted by priority score (highest first). Export to share with leadership or engineering."
          className="border-t border-[color:var(--border)]"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-[color:var(--muted)]">
                {hasSuggestions ? `${sorted.length} suggestions` : "No suggestions yet"}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!hasSuggestions || isLoading}
                  onClick={() => copyToClipboard(suggestionsAsJson())}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--border)] bg-white px-3 text-xs font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Copy JSON
                </button>
                <button
                  type="button"
                  disabled={!hasSuggestions || isLoading}
                  onClick={() =>
                    downloadText(
                      "automation-suggestions.json",
                      suggestionsAsJson(),
                      "application/json",
                    )
                  }
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--border)] bg-white px-3 text-xs font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Download JSON
                </button>
                <button
                  type="button"
                  disabled={!hasSuggestions || isLoading}
                  onClick={() =>
                    downloadText(
                      "automation-report.md",
                      suggestionsAsMarkdown(),
                      "text/markdown;charset=utf-8",
                    )
                  }
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--border)] bg-white px-3 text-xs font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Download report
                </button>
                {copyStatus ? (
                  <span className="text-xs text-[color:var(--muted)]">{copyStatus}</span>
                ) : null}
              </div>
            </div>

            <div className="mt-6">
            <AnimatePresence
              mode="wait"
              onExitComplete={() => {
                if (isLoading) setResult([]);
              }}
            >
              {showResults && hasSuggestions ? (
                <motion.div
                  key={`results-${resultsKey}`}
                  initial={reduceMotion ? false : "hidden"}
                  animate={reduceMotion ? undefined : "show"}
                  exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.06 } },
                  }}
                  className="space-y-4"
                >
                  {sorted.map((s, i) => (
                    <motion.div
                      key={`${s.title}-${i}`}
                      variants={fadeUp}
                      whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.995 }}
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    >
                      <SuggestionCard suggestion={s} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key={isLoading ? "loading" : "empty"}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Card>
                    <div className="text-sm text-[color:var(--muted)]">
                      {isLoading
                        ? "Analyzing workflow…"
                        : "Run a scan to see structured automation suggestions here."}
                    </div>
                    {isLoading ? (
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                        <motion.div
                          className="h-full w-1/3 rounded-full bg-[color:rgb(var(--brand-600))]/60"
                          initial={reduceMotion ? false : { x: "-120%" }}
                          animate={reduceMotion ? undefined : { x: "320%" }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                        />
                      </div>
                    ) : null}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </motion.div>
        </Section>

        <Section
          id="docs"
          title="Docs"
          subtitle="Internal notes for integrating the scanner in your workflows."
          className="border-t border-[color:var(--border)]"
        >
          <Card>
            <div className="space-y-2 text-sm text-zinc-700">
              <div>
                API endpoint: <span className="font-mono">POST /api/scan</span>
              </div>
              <div>
                Request body: <span className="font-mono">{`{ "prompt": "..." }`}</span>
              </div>
              <div>
                Response: <span className="font-mono">{`{ result: Suggestion[], error?: string, requestId?: string }`}</span>
              </div>
            </div>
          </Card>
        </Section>

        <Section
          id="about"
          title="About"
          subtitle="Designed for internal teams to identify and prioritize automation investments."
          className="border-t border-[color:var(--border)]"
        >
          <Card>
            <div className="text-sm leading-6 text-zinc-700">
              Use this scanner as a starting point. Validate assumptions with system owners and measure ROI with real volumes and cycle-time baselines.
            </div>
          </Card>
        </Section>
      </Container>
    </div>
  );
}
