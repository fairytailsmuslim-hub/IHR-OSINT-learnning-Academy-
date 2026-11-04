import React, { useState } from 'react';
import { ExternalLink, Globe, Send, Sparkles, X } from 'lucide-react';

interface StudyAssistantDrawerProps {
  open: boolean;
  topicContextTitle: string;
  onClose: () => void;
}

interface AssistantTurn {
  question: string;
  answer: string;
  sources: { title: string; uri: string }[];
  provider: string;
}

export function StudyAssistantDrawer({
  open,
  topicContextTitle,
  onClose,
}: StudyAssistantDrawerProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AssistantTurn[]>([]);

  if (!open) return null;

  const handleAsk = async (questionText: string) => {
    const clean = questionText.trim();
    if (!clean || loading) return;
    setLoading(true);
    setError(null);
    setInput('');

    try {
      const res = await fetch('/api/ai/study-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: clean,
          topicTitle: topicContextTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Study Assistant request failed.');
      }
      setHistory((prev) => [
        ...prev,
        {
          question: clean,
          answer: data.answer,
          sources: Array.isArray(data.sources) ? data.sources : [],
          provider: data.provider || 'curriculum-rag',
        },
      ]);
    } catch (err: any) {
      setError(err?.message || 'Unable to reach Study Assistant.');
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Why does triggering Wayback Save Page Now violate zero-touch passive OSINT?',
    'How does Certificate Transparency (crt.sh) relate to MITRE ATT&CK TA0043?',
    'Explain Admiralty Code B2 vs C3 in a SOC alert enrichment note.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-sky-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                OSINT Curriculum Study Assistant
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Curriculum RAG + Live Google Search Grounding
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close Study Assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {topicContextTitle && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
              Active lesson context:{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {topicContextTitle}
              </span>
            </div>
          )}

          {history.length === 0 && (
            <div className="space-y-3">
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Ask about passive vs active boundaries, RFC standards, CISA KEV advisories, DNS/RDAP
                records, or analytic frameworks. Responses enforce ethical OSINT guardrails and cite
                live web sources when grounded.
              </p>
              <div className="space-y-2">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => void handleAsk(p)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-left text-xs text-slate-700 hover:border-sky-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.map((turn, i) => (
            <div key={i} className="space-y-2.5">
              <div className="ml-8 rounded-xl bg-sky-600 px-3.5 py-2.5 text-xs text-white">
                {turn.question}
              </div>
              <div className="mr-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200">
                <div className="whitespace-pre-wrap">{turn.answer}</div>

                {turn.sources.length > 0 && (
                  <div className="mt-3 border-t border-slate-200 pt-2.5 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <Globe className="h-3.5 w-3.5 text-sky-500" />
                      <span>Grounded Web Citations</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {turn.sources.map((src) => (
                        <a
                          key={src.uri}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex max-w-full items-center gap-1 truncate rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-sky-600 hover:underline dark:border-slate-700 dark:bg-slate-900 dark:text-sky-400"
                        >
                          <span className="truncate">{src.title}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Synthesizing grounded OSINT explanation...
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleAsk(input);
          }}
          className="border-t border-slate-200 p-4 dark:border-slate-800"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask an ethical OSINT or CTI question..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-45"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Ask</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
