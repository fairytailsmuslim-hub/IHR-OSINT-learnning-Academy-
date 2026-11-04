import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Search, X } from 'lucide-react';

export interface SearchHit {
  type: 'Topic' | 'Tool' | 'Framework' | 'Lab' | 'Case Study' | 'Glossary';
  title: string;
  subtitle: string;
  stage?: string;
  slug: string;
  url?: string;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelectResult: (hit: SearchHit) => void;
}

export function SearchModal({ open, onClose, onSelectResult }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setResults(Array.isArray(data?.results) ? data.results : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/75 p-4 pt-16 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Full-text search across 60 topics, 55+ tools, 30 labs, 6 frameworks, glossary..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-3">
          {!query.trim() ? (
            <p className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Type a keyword such as <span className="font-mono">crt.sh</span>,{' '}
              <span className="font-mono">SunCalc</span>, <span className="font-mono">RDAP</span>,{' '}
              <span className="font-mono">Diamond Model</span>, or{' '}
              <span className="font-mono">Admiralty</span>.
            </p>
          ) : loading ? (
            <p className="py-8 text-center text-xs text-slate-500">Searching curriculum index...</p>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">
              No results matched "{query}".
            </p>
          ) : (
            <div className="space-y-1.5">
              {results.map((hit, i) => (
                <button
                  key={`${hit.type}-${hit.slug}-${i}`}
                  type="button"
                  onClick={() => {
                    onSelectResult(hit);
                    onClose();
                  }}
                  className="flex w-full items-start justify-between gap-3 rounded-xl border border-transparent px-3.5 py-2.5 text-left hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-800/60"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] text-sky-600 dark:text-sky-400">
                      {hit.type}
                      {hit.stage ? ` · Stage ${hit.stage}` : ''}
                    </div>
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {hit.title}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {hit.subtitle}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
