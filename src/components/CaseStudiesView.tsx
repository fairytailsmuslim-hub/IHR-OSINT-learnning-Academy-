import React, { useState } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { CASE_STUDIES } from '../lib/content-loader.ts';

export function CaseStudiesView() {
  const [selectedSlug, setSelectedSlug] = useState(CASE_STUDIES[0]?.slug || '');
  const active = CASE_STUDIES.find((c) => c.slug === selectedSlug) || CASE_STUDIES[0];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Real-World Ethical OSINT Case Studies ({CASE_STUDIES.length})
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          Documented public-interest investigations from Bellingcat, Citizen Lab, CISA, Mandiant,
          DFRLab, ProPublica, OCCRP, Amnesty Crisis Evidence Lab, Reuters, and Swiss NCSC.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-2.5 lg:col-span-4">
          {CASE_STUDIES.map((cs) => {
            const isSelected = cs.slug === active?.slug;
            return (
              <button
                key={cs.id}
                type="button"
                onClick={() => setSelectedSlug(cs.slug)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70'
                }`}
              >
                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  Stage {cs.stage} · {cs.category} · {cs.sourceOrg}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {cs.title}
                </div>
              </button>
            );
          })}
        </div>

        {active && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-8 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="font-mono text-xs text-sky-600 dark:text-sky-400">
              STAGE {active.stage} CASE STUDY · {active.category.toUpperCase()} ·{' '}
              {active.sourceOrg.toUpperCase()}
            </div>
            <h2 className="mt-1.5 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <BookOpenCheck className="h-5 w-5 text-sky-500" />
              <span>{active.title}</span>
            </h2>

            <div className="mt-5 space-y-5 text-sm">
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Investigative Context
                </h3>
                <p className="mt-1.5 leading-relaxed text-slate-700 dark:text-slate-300">
                  {active.context}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Step-by-Step Open-Source Methodology
                </h3>
                <ol className="mt-2 space-y-2">
                  {active.methodology.map((m, idx) => (
                    <li
                      key={m}
                      className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200"
                    >
                      <span className="font-mono font-bold text-sky-600 tabular-nums dark:text-sky-400">
                        {idx + 1}.
                      </span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Verified Tools & Public Sources Used
                </h3>
                <p className="mt-1.5 font-mono text-xs text-slate-700 dark:text-slate-300">
                  {active.toolsUsed.join(' · ')}
                </p>
              </div>

              <div className="rounded-lg border border-sky-500/30 bg-sky-50/60 p-4 dark:bg-sky-950/20">
                <h3 className="text-xs font-semibold text-sky-700 uppercase dark:text-sky-400">
                  Key Takeaway & Ethical Lesson
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {active.lessons}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
