import React, { useMemo, useState } from 'react';
import { ExternalLink, FileSpreadsheet, Search } from 'lucide-react';
import { ToolCategory } from '../lib/types.ts';
import { useAcademy } from '../context/AcademyContext.tsx';

const CATEGORIES: ('All' | ToolCategory)[] = [
  'All',
  'Search',
  'Social',
  'Domain/IP',
  'Email',
  'Image/Video',
  'Geo',
  'Threat Intel',
  'Corporate',
  'Verification',
  'Note-taking/Graph',
];

export function ToolsView() {
  const { allTools, requestWorkspaceExport } = useAcademy();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | ToolCategory>('All');
  const [pricing, setPricing] = useState<string>('All');
  const [stageFilter, setStageFilter] = useState<'All' | 'A' | 'B'>('All');

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTools.filter((t) => {
      if (category !== 'All' && t.category !== category) return false;
      if (pricing !== 'All' && t.pricing !== pricing) return false;
      if (stageFilter !== 'All' && t.stage !== stageFilter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.platform.toLowerCase().includes(q)
      );
    });
  }, [allTools, query, category, pricing, stageFilter]);

  const handleExportToolsSheet = () => {
    const rows: string[][] = [
      ['Tool Name', 'Official URL', 'Category', 'Pricing', 'Platform', 'Stage', 'Ethical Guardrail'],
      ...filteredTools.map((t) => [
        t.name,
        t.url,
        t.category,
        t.pricing,
        t.platform,
        `Stage ${t.stage}`,
        t.ethicalNote,
      ]),
    ];

    requestWorkspaceExport({
      kind: 'sheet',
      title: `IHR OSINT Tools Reference (${filteredTools.length} tools)`,
      summary: `Creates a Google Sheet containing ${filteredTools.length} verified OSINT tools, official URLs, pricing tiers, and ethical notes.`,
      sheetRows: rows,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Verified OSINT Tools Directory
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            <span className="font-mono font-semibold tabular-nums">{allTools.length}</span> real,
            production OSINT utilities and public registries with official URLs and ethical
            boundaries.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportToolsSheet}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
          <span>Export Directory to Google Sheets</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, domains, registries..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <select
          value={pricing}
          onChange={(e) => setPricing(e.target.value)}
          className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          <option value="All">All Pricing Tiers</option>
          <option value="Free">Free</option>
          <option value="Open Source">Open Source</option>
          <option value="Freemium">Freemium</option>
          <option value="Paid">Paid</option>
        </select>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as 'All' | 'A' | 'B')}
          className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          <option value="All">Stage A & Stage B</option>
          <option value="A">Stage A — Passive Only</option>
          <option value="B">Stage B — CTI / SOC</option>
        </select>
      </div>

      {/* Category Strip */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              category === cat
                ? 'border-sky-500 bg-sky-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tools Grid (Zero Pill Badges — Clean Inline Metadata separated by ·) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div>
              <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Stage {tool.stage} · {tool.category} · {tool.pricing} · {tool.platform}
              </div>
              <div className="mt-1.5 flex items-start justify-between gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {tool.name}
                </h2>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 font-mono text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400"
                >
                  <span>Visit</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {tool.description}
              </p>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Ethical guardrail:{' '}
              </span>
              {tool.ethicalNote}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
