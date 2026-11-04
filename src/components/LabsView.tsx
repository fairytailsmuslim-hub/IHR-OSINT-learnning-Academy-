import React, { useState } from 'react';
import { CheckCircle2, FlaskConical, Lock } from 'lucide-react';
import { LABS, MODULE_BY_ID } from '../lib/content-loader.ts';
import { useAcademy } from '../context/AcademyContext.tsx';
import { FillBlankQuiz } from './FillBlankQuiz.tsx';

interface LabsViewProps {
  initialLabSlug?: string;
}

export function LabsView({ initialLabSlug }: LabsViewProps) {
  const { profile, completedLabSlugs, completeLab } = useAcademy();
  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialLabSlug || LABS[0]?.slug || ''
  );
  const [stageFilter, setStageFilter] = useState<'All' | 'A' | 'B'>('All');

  const stageACertified = Boolean(profile?.stageACertified);
  const isAdmin = profile?.role === 'admin';

  const visibleLabs = LABS.filter((l) =>
    stageFilter === 'All' ? true : l.stage === stageFilter
  );

  const activeLab = LABS.find((l) => l.slug === selectedSlug) || visibleLabs[0] || LABS[0];
  const activeLocked = activeLab?.stage === 'B' && !stageACertified && !isAdmin;
  const modCtx = activeLab ? MODULE_BY_ID[activeLab.moduleId] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Lab-Safe Hands-On Exercises ({LABS.length} Labs)
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Every exercise operates strictly against RFC 2606 reserved domains, RFC 5737 test blocks,
            or authorized public transparency registries—zero unauthorized probing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['All', 'A', 'B'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStageFilter(st)}
              className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                stageFilter === st
                  ? 'border-sky-500 bg-sky-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {st === 'All' ? 'All 30 Labs' : `Stage ${st} Labs`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Lab List Sidebar */}
        <div className="max-h-[680px] space-y-2 overflow-y-auto pr-1 lg:col-span-4">
          {visibleLabs.map((lab) => {
            const isSelected = lab.slug === activeLab?.slug;
            const isDone = completedLabSlugs.has(lab.slug);
            const locked = lab.stage === 'B' && !stageACertified && !isAdmin;

            return (
              <button
                key={lab.slug}
                type="button"
                onClick={() => setSelectedSlug(lab.slug)}
                className={`w-full rounded-xl border p-3.5 text-left transition ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                  <span>
                    Stage {lab.stage} · {lab.difficulty} · {lab.durationMinutes}m
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : locked ? (
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                  ) : null}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {lab.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Lab Workbench */}
        <div className="lg:col-span-8">
          {activeLab && activeLocked ? (
            <div className="rounded-xl border border-amber-500/40 bg-white p-8 text-center dark:bg-slate-900">
              <Lock className="mx-auto h-7 w-7 text-amber-500" />
              <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                Stage B Lab Locked
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Complete Stage A and earn your Passive OSINT Certificate to unlock Stage B CTI & SOC
                labs.
              </p>
            </div>
          ) : activeLab ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="font-mono text-xs text-sky-600 tabular-nums dark:text-sky-400">
                  STAGE {activeLab.stage} · MODULE {modCtx?.module.number || ''} ·{' '}
                  {activeLab.difficulty.toUpperCase()} · {activeLab.durationMinutes} MIN
                </div>
                <h2 className="mt-1.5 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                  <FlaskConical className="h-5 w-5 text-sky-500" />
                  <span>{activeLab.title}</span>
                </h2>

                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">
                      Objective
                    </h3>
                    <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">
                      {activeLab.objective}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">
                      Prerequisites & Safe Setup
                    </h3>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-600 dark:text-slate-400">
                      {activeLab.prerequisites.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">
                      Step-by-Step Procedure
                    </h3>
                    <ol className="mt-2 space-y-2.5">
                      {activeLab.steps.map((step, i) => (
                        <li
                          key={step}
                          className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200"
                        >
                          <span className="font-mono font-bold text-sky-600 tabular-nums dark:text-sky-400">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 p-3.5 text-xs text-slate-700 dark:bg-emerald-950/20 dark:text-slate-300">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Expected Deliverable:{' '}
                    </span>
                    {activeLab.expectedOutcome}
                  </div>
                </div>
              </div>

              <FillBlankQuiz
                key={activeLab.slug}
                questions={activeLab.selfCheck}
                topicSlug={modCtx?.module.topicSlugs[0] || 'osint-disciplines-overview'}
                title="Lab Self-Check Verification"
                onComplete={(score, total) => {
                  const pct = Math.round((score / Math.max(1, total)) * 100);
                  void completeLab(activeLab.slug, pct, activeLab.durationMinutes);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
