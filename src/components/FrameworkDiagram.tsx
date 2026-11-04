import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { FRAMEWORKS, MODULE_BY_ID } from '../lib/content-loader.ts';
import { OsintFramework } from '../lib/types.ts';

interface FrameworkDiagramProps {
  onSelectModule: (moduleId: string) => void;
  initialSlug?: string;
}

function SvgVisualForFramework({ framework }: { framework: OsintFramework }) {
  if (framework.slug === 'diamond-model') {
    return (
      <svg viewBox="0 0 600 280" className="h-auto w-full select-none">
        <defs>
          <linearGradient id="dmLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <polygon
          points="300,32 510,140 300,248 90,140"
          fill="none"
          stroke="url(#dmLine)"
          strokeWidth="2"
        />
        <line x1="300" y1="32" x2="300" y2="248" stroke="#334155" strokeDasharray="5 5" />
        <line x1="90" y1="140" x2="510" y2="140" stroke="#334155" strokeDasharray="5 5" />

        <g transform="translate(230, 8)">
          <rect width="140" height="36" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="70" y="23" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="600">
            Adversary
          </text>
        </g>
        <g transform="translate(450, 122)">
          <rect width="136" height="36" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="68" y="23" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="600">
            Capability
          </text>
        </g>
        <g transform="translate(230, 236)">
          <rect width="140" height="36" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="70" y="23" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="600">
            Victim
          </text>
        </g>
        <g transform="translate(14, 122)">
          <rect width="136" height="36" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="68" y="23" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="600">
            Infrastructure
          </text>
        </g>
        <text x="300" y="135" textAnchor="middle" fill="#94a3b8" fontSize="11">
          Timestamp · Phase · Social-Political Meta
        </text>
      </svg>
    );
  }

  if (framework.slug === 'admiralty-code') {
    return (
      <svg viewBox="0 0 640 240" className="h-auto w-full select-none">
        <rect x="20" y="24" width="285" height="192" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
        <text x="40" y="52" fill="#38bdf8" fontSize="12" fontWeight="700">
          SOURCE RELIABILITY (A – F)
        </text>
        {[
          'A · Completely reliable (proven history)',
          'B · Usually reliable',
          'C · Fairly reliable',
          'D · Not usually reliable',
          'E · Unreliable · F · Cannot be judged',
        ].map((line, i) => (
          <text key={line} x="40" y={82 + i * 26} fill="#e2e8f0" fontSize="11.5">
            {line}
          </text>
        ))}

        <rect x="335" y="24" width="285" height="192" rx="8" fill="#0f172a" stroke="#818cf8" strokeWidth="1.2" />
        <text x="355" y="52" fill="#818cf8" fontSize="12" fontWeight="700">
          INFORMATION CREDIBILITY (1 – 6)
        </text>
        {[
          '1 · Confirmed by independent sources',
          '2 · Probably true (logical, consistent)',
          '3 · Possibly true',
          '4 · Doubtful',
          '5 · Improbable · 6 · Truth cannot be judged',
        ].map((line, i) => (
          <text key={line} x="355" y={82 + i * 26} fill="#e2e8f0" fontSize="11.5">
            {line}
          </text>
        ))}
      </svg>
    );
  }

  // Horizontal pipeline / cycle SVG for OSINT Cycle, Intelligence Cycle, MITRE Recon, Kill Chain
  const nodes = framework.steps.slice(0, 6);
  const boxWidth = 92;
  const gap = 12;
  const startX = 16;

  return (
    <svg viewBox="0 0 660 165" className="h-auto w-full select-none">
      {nodes.map((s, idx) => {
        const x = startX + idx * (boxWidth + gap);
        return (
          <g key={s.step}>
            <rect
              x={x}
              y={32}
              width={boxWidth}
              height={92}
              rx={7}
              fill="#0f172a"
              stroke={framework.stage === 'A' ? '#38bdf8' : '#818cf8'}
              strokeWidth="1.4"
            />
            <text
              x={x + boxWidth / 2}
              y={56}
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="10.5"
              fontFamily="IBM Plex Mono, monospace"
            >
              {s.step}
            </text>
            <foreignObject x={x + 6} y={64} width={boxWidth - 12} height={54}>
              <div className="text-center text-[10px] font-medium leading-tight text-slate-100">
                {s.title}
              </div>
            </foreignObject>
            {idx < nodes.length - 1 && (
              <line
                x1={x + boxWidth}
                y1={78}
                x2={x + boxWidth + gap}
                y2={78}
                stroke="#64748b"
                strokeWidth="1.5"
              />
            )}
          </g>
        );
      })}
      {(framework.slug === 'osint-cycle' || framework.slug === 'intelligence-cycle') && (
        <path
          d="M 610 124 Q 330 162 55 124"
          fill="none"
          stroke="#475569"
          strokeWidth="1.3"
          strokeDasharray="4 4"
        />
      )}
    </svg>
  );
}

export function FrameworkDiagram({ onSelectModule, initialSlug }: FrameworkDiagramProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialSlug || FRAMEWORKS[0]?.slug || 'osint-cycle'
  );

  const activeFramework =
    FRAMEWORKS.find((f) => f.slug === selectedSlug) || FRAMEWORKS[0];

  if (!activeFramework) return null;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          OSINT & Intelligence Frameworks
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          Structured analytic models prevent unstructured data hoarding. Inspect each framework
          below to see its visual architecture and exact Stage A / Stage B module mappings.
        </p>
      </div>

      {/* Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {FRAMEWORKS.map((fw) => {
          const isSelected = fw.slug === activeFramework.slug;
          return (
            <button
              key={fw.slug}
              type="button"
              onClick={() => setSelectedSlug(fw.slug)}
              className={`shrink-0 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                isSelected
                  ? 'border-sky-500 bg-sky-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Stage {fw.stage} · {fw.shortName}
            </button>
          );
        })}
      </div>

      {/* Main Framework Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="text-xs font-medium text-sky-600 dark:text-sky-400">
              Stage {activeFramework.stage} Methodology · {activeFramework.steps.length} Components
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
              {activeFramework.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {activeFramework.tagline}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {activeFramework.overview}
        </p>

        {/* Visual SVG Architecture */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <SvgVisualForFramework framework={activeFramework} />
        </div>

        {/* Detailed Steps Breakdown */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeFramework.steps.map((s) => (
            <div
              key={s.step}
              className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50"
            >
              <div className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400">
                {s.step}
              </div>
              <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {s.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {s.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Curriculum Mapping */}
        <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
          <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Mapped Curriculum Modules
          </h3>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {activeFramework.mappedModules.map((modId) => {
              const ctx = MODULE_BY_ID[modId];
              if (!ctx) return null;
              return (
                <button
                  key={modId}
                  type="button"
                  onClick={() => onSelectModule(modId)}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-left text-xs hover:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-500"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                      Stage {ctx.stage.code} · Module {ctx.module.number}
                    </div>
                    <div className="truncate font-medium text-slate-900 dark:text-slate-100">
                      {ctx.module.title}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
