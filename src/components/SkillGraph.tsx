import React from 'react';
import { Award, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { CURRICULUM, isModuleUnlocked } from '../lib/content-loader.ts';
import { useAcademy } from '../context/AcademyContext.tsx';
import { generateAdaptiveRoadmap } from '../lib/roadmap.ts';

interface SkillGraphProps {
  onSelectTopic: (topicSlug: string) => void;
  onOpenCapstone: (stage: 'A' | 'B') => void;
}

export function SkillGraph({ onSelectTopic, onOpenCapstone }: SkillGraphProps) {
  const { profile, completedTopicSlugs } = useAcademy();
  const isAdmin = profile?.role === 'admin';
  const stageACertified = Boolean(profile?.stageACertified);
  const stageBCertified = Boolean(profile?.stageBCertified);

  const roadmap = generateAdaptiveRoadmap(
    profile?.careerGoal || 'soc_analyst',
    profile?.skillLevel || 'beginner'
  );
  const prioritySet = new Set(roadmap.priorityModuleIds);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Interactive Prerequisite Skill Graph
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          Visual dependency map across all 8 Phases and 30 Modules. Highlighted nodes align with your
          adaptive career track ({roadmap.goalLabel}), while Stage B remains gated behind the
          Passive OSINT Certificate.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Completed Module
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
          Unlocked & Ready
        </span>
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Priority for Career Goal
        </span>
        <span className="inline-flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-slate-400" />
          Prerequisite / Certificate Locked
        </span>
      </div>

      {CURRICULUM.stages.map((stage) => {
        const isStageB = stage.code === 'B';
        const stageLocked = isStageB && !stageACertified && !isAdmin;

        return (
          <div
            key={stage.id}
            className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <div className="font-mono text-xs text-sky-600 dark:text-sky-400">
                  STAGE {stage.code} · {stage.phases.length} PHASES
                </div>
                <h2 className="mt-0.5 text-lg font-bold text-slate-900 dark:text-slate-100">
                  {stage.title}
                </h2>
              </div>
              {stageLocked && (
                <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <Lock className="h-4 w-4" />
                  <span>Requires Stage A Passive OSINT Certificate</span>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-6">
              {stage.phases.map((phase) => (
                <div key={phase.id} className="relative">
                  <div className="mb-3 flex items-baseline justify-between">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Phase {phase.number} — {phase.title}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {phase.summary}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {phase.modules.map((mod) => {
                      const doneCount = mod.topicSlugs.filter((s) =>
                        completedTopicSlugs.has(s)
                      ).length;
                      const isModuleComplete =
                        doneCount === mod.topicSlugs.length && mod.topicSlugs.length > 0;
                      const access = isModuleUnlocked(
                        mod.id,
                        completedTopicSlugs,
                        stageACertified,
                        Boolean(isAdmin)
                      );
                      const isPriority = prioritySet.has(mod.id);
                      const firstTopic = mod.topicSlugs[0];

                      return (
                        <button
                          key={mod.id}
                          type="button"
                          disabled={!access.unlocked}
                          onClick={() => firstTopic && onSelectTopic(firstTopic)}
                          title={access.reason || mod.summary}
                          className={`group flex flex-col justify-between rounded-lg border p-3.5 text-left transition ${
                            isModuleComplete
                              ? 'border-emerald-500/50 bg-emerald-50/40 dark:border-emerald-500/40 dark:bg-emerald-950/20'
                              : access.unlocked
                                ? 'border-slate-200 bg-slate-50/60 hover:border-sky-500 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-sky-500'
                                : 'cursor-not-allowed border-slate-200/70 bg-slate-100/50 opacity-60 dark:border-slate-800/70 dark:bg-slate-950/30'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                                M{String(mod.number).padStart(2, '0')} · {doneCount}/{mod.topicSlugs.length} topics
                              </span>
                              <div className="flex items-center gap-1.5">
                                {isPriority && (
                                  <Sparkles
                                    className="h-3.5 w-3.5 text-amber-500"
                                    aria-label="Priority module"
                                  />
                                )}
                                {isModuleComplete ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : !access.unlocked ? (
                                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                                ) : null}
                              </div>
                            </div>
                            <div className="mt-1.5 text-sm font-semibold text-slate-900 group-hover:text-sky-600 dark:text-slate-100 dark:group-hover:text-sky-400">
                              {mod.title}
                            </div>
                          </div>

                          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                            {mod.prerequisites.length > 0
                              ? `Prereq: ${mod.prerequisites.join(', ').toUpperCase()}`
                              : 'Entry Foundation'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Stage Capstone Gate Node */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-sky-500/30 bg-sky-50/50 p-4 dark:border-sky-500/30 dark:bg-sky-950/20">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 shrink-0 text-sky-600 dark:text-sky-400" />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Stage {stage.code} Capstone & Final Exam — {stage.certificateTitle}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    40 MCQs · 10 Fill-in-the-Blank · 1 Structured Scenario Report · 70% Pass Mark
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={stageLocked}
                onClick={() => onOpenCapstone(stage.code)}
                className="shrink-0 whitespace-nowrap rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {(stage.code === 'A' && stageACertified) || (stage.code === 'B' && stageBCertified)
                  ? 'Certified · Review Exam'
                  : `Open Stage ${stage.code} Capstone`}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
