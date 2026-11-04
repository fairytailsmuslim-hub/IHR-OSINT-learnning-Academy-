import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { GLOSSARY } from '../lib/content-loader.ts';

export function GlossaryView() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const set = new Set<string>(GLOSSARY.map((g) => g.category));
    return ['All', ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [query, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          OSINT & Threat Intelligence Glossary
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-mono font-semibold tabular-nums">{GLOSSARY.length}</span> searchable
          definitions covering passive recon, DNS/TLS protocols, geospatial verification, CTI models,
          and legal standards.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter 155+ terms (e.g., RDAP, pDNS, Admiralty, CISA KEV, SunCalc)..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All Categories' : c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g) => (
          <div
            key={g.term}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="font-mono text-[11px] text-sky-600 dark:text-sky-400">{g.category}</div>
            <h2 className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{g.term}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {g.definition}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
