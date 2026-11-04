import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Flame,
  Lock,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ALL_MODULES,
  ALL_TOPICS,
  LABS,
  MODULE_BY_ID,
  checkFillBlankAnswer,
  isModuleUnlocked,
} from '../lib/content-loader.ts';
import { generateAdaptiveRoadmap } from '../lib/roadmap.ts';
import { useAcademy } from '../context/AcademyContext.tsx';

interface DashboardViewProps {
  onSelectTopic: (slug: string) => void;
  onOpenCapstone: (stage: 'A' | 'B') => void;
  onOpenOnboarding: () => void;
  onOpenCertificates: () => void;
}

export function DashboardView({
  onSelectTopic,
  onOpenCapstone,
  onOpenOnboarding,
  onOpenCertificates,
}: DashboardViewProps) {
  const {
    profile,
    topics,
    completedTopicSlugs,
    completedLabSlugs,
    spacedCards,
    recordSpacedAttempt,
    requestWorkspaceExport,
  } = useAcademy();

  const [reviewInput, setReviewInput] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState<{
    correct: boolean;
    expected: string;
  } | null>(null);

  if (!profile) return null;

  const stageATopics = ALL_TOPICS.filter((t) => t.stage === 'A');
  const stageBTopics = ALL_TOPICS.filter((t) => t.stage === 'B');

  const stageADone = stageATopics.filter((t) => completedTopicSlugs.has(t.slug)).length;
  const stageBDone = stageBTopics.filter((t) => completedTopicSlugs.has(t.slug)).length;

  const stageAPct = Math.round((stageADone / Math.max(1, stageATopics.length)) * 100);
  const stageBPct = Math.round((stageBDone / Math.max(1, stageBTopics.length)) * 100);

  const scoredTopics = Object.values(topics);
  const avgQuizPct =
    scoredTopics.length > 0
      ? Math.round(
          (scoredTopics.reduce((acc, r) => acc + r.quizScore / Math.max(1, r.quizTotal), 0) /
            scoredTopics.length) *
            100
        )
      : 0;

  const roadmap = generateAdaptiveRoadmap(profile.careerGoal, profile.skillLevel);

  // Next uncompleted unlocked topic
  const nextRecommendedTopic =
    ALL_TOPICS.find((t) => {
      if (completedTopicSlugs.has(t.slug)) return false;
      const unlock = isModuleUnlocked(
        t.moduleId,
        completedTopicSlugs,
        profile.stageACertified,
        profile.role === 'admin'
      );
      return unlock.unlocked;
    }) || ALL_TOPICS[0];

  // Spaced Repetition cards due right now
  const now = Date.now();
  const dueCards = spacedCards
    .filter((c) => c.nextReviewEpochMs <= now)
    .sort((a, b) => a.nextReviewEpochMs - b.nextReviewEpochMs);
  const currentCard = dueCards[0] || null;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCard || !reviewInput.trim()) return;
    const isRight = checkFillBlankAnswer(reviewInput, [currentCard.answer]);
    setReviewFeedback({ correct: isRight, expected: currentCard.answer });
    await recordSpacedAttempt({
      cardId: currentCard.cardId,
      topicSlug: currentCard.topicSlug,
      prompt: currentCard.prompt,
      answer: currentCard.answer,
      wasCorrectWithoutHint: isRight,
    });
    setReviewInput('');
    setTimeout(() => setReviewFeedback(null), 2600);
  };

  const handleExportProgressSheet = () => {
    const rows: string[][] = [
      [
        'Module #',
        'Stage',
        'Module Title',
        'Topic Slug',
        'Topic Title',
        'Completed',
        'Quiz Score',
      ],
      ...ALL_TOPICS.map((t) => {
        const mod = MODULE_BY_ID[t.moduleId];
        const rec = topics[t.slug];
        return [
          String(mod?.module.number || ''),
          t.stage,
          mod?.module.title || '',
          t.slug,
          t.title,
          rec?.completed ? 'Yes' : 'No',
          rec ? `${rec.quizScore}/${rec.quizTotal}` : '0/5',
        ];
      }),
    ];

    requestWorkspaceExport({
      kind: 'sheet',
      title: `IHR OSINT Progress Tracker — ${profile.displayName}`,
      summary: `Creates a Google Sheet with all 60 Stage A & Stage B topics, completion states, and fill-in-the-blank quiz scores.`,
      sheetRows: rows,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="font-mono text-xs text-sky-600 dark:text-sky-400">
            LEARNER ANALYTICS · {roadmap.goalLabel.toUpperCase()}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {profile.displayName}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {roadmap.mandatoryRule}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Recalibrate Track</span>
          </button>
          <button
            type="button"
            onClick={handleExportProgressSheet}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
            <span>Export Tracker to Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Key Learner Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Topics Mastered
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
            {completedTopicSlugs.size} / {ALL_TOPICS.length}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
            {completedLabSlugs.size}/{LABS.length} hands-on labs completed
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Quiz Accuracy
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
            {avgQuizPct}%
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
            Across {scoredTopics.length} graded fill-in-the-blank sets
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Study Time & Streak</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
            {profile.streakDays}d · {profile.minutesStudied}m
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Target: {roadmap.weeklyHoursSuggested}h / week</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Certification Status</span>
            <Award className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-base font-bold text-slate-900 dark:text-white">
            {profile.stageBCertified
              ? 'Stage A & B Certified'
              : profile.stageACertified
                ? 'Stage A Certified (Stage B Open)'
                : 'Stage A In Progress'}
          </div>
          <button
            type="button"
            onClick={onOpenCertificates}
            className="mt-1.5 text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400"
          >
            View Credentials & PDFs →
          </button>
        </div>
      </div>

      {/* Stage A & Stage B Progress Bars + Next Step */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Two-Stage Curriculum Progression
          </h2>

          {/* Stage A Bar */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-900 dark:text-slate-100">
                Stage A — Passive OSINT Framework (Modules 1–20)
              </span>
              <span className="font-mono text-sky-600 tabular-nums dark:text-sky-400">
                {stageADone}/{stageATopics.length} ({stageAPct}%)
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-sky-500 transition-all"
                style={{ width: `${stageAPct}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {profile.stageACertified
                  ? `Passive OSINT Certificate Earned (${profile.stageAScore}%)`
                  : 'Pass Stage A Capstone Exam (70%+) to unlock Stage B'}
              </span>
              <button
                type="button"
                onClick={() => onOpenCapstone('A')}
                className="font-semibold text-sky-600 hover:underline dark:text-sky-400"
              >
                {profile.stageACertified ? 'Review Stage A Exam' : 'Take Stage A Final Exam →'}
              </button>
            </div>
          </div>

          {/* Stage B Bar */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                {!profile.stageACertified && profile.role !== 'admin' && (
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                )}
                <span>Stage B — Advanced Investigation: CTI & SOC (Modules 21–30)</span>
              </span>
              <span className="font-mono text-slate-600 tabular-nums dark:text-slate-400">
                {stageBDone}/{stageBTopics.length} ({stageBPct}%)
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${stageBPct}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {profile.stageACertified || profile.role === 'admin'
                  ? 'Unlocked — Complete Phases 6–8 and pass Stage B Capstone'
                  : 'Locked until Stage A Passive OSINT Certificate is earned'}
              </span>
              {(profile.stageACertified || profile.role === 'admin') && (
                <button
                  type="button"
                  onClick={() => onOpenCapstone('B')}
                  className="font-semibold text-sky-600 hover:underline dark:text-sky-400"
                >
                  Open Stage B Final Exam →
                </button>
              )}
            </div>
          </div>

          {nextRecommendedTopic && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sky-500/30 bg-sky-50/60 p-4 dark:bg-sky-950/20">
              <div>
                <div className="font-mono text-[11px] font-semibold text-sky-600 uppercase dark:text-sky-400">
                  Continue Next Lesson
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                  {nextRecommendedTopic.title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectTopic(nextRecommendedTopic.slug)}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500"
              >
                <span>Resume Study</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Spaced Repetition Active Deck */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Spaced Repetition Queue
              </h2>
              <span className="font-mono text-xs text-sky-600 tabular-nums dark:text-sky-400">
                {dueCards.length} due · {spacedCards.length} tracked
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Questions missed or hinted in topic quizzes resurface here at expanding intervals (1d
              → 3d → 7d → 16d).
            </p>

            {currentCard ? (
              <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                  <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    Streak: {currentCard.streak} · Interval: {currentCard.intervalDays}d
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {currentCard.prompt}
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reviewInput}
                    onChange={(e) => setReviewInput(e.target.value)}
                    placeholder="Recall exact answer..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={!reviewInput.trim()}
                    className="shrink-0 whitespace-nowrap rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-45"
                  >
                    Check
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  All due spaced repetition cards cleared!
                </p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Any future quiz item where you need a hint or miss an attempt will appear here.
                </p>
              </div>
            )}

            {reviewFeedback && (
              <div
                className={`mt-3 rounded-lg border p-2.5 text-xs ${
                  reviewFeedback.correct
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
                }`}
              >
                {reviewFeedback.correct
                  ? 'Correct! Interval expanded.'
                  : `Re-queued for 10m reinforcement. Answer: ${reviewFeedback.expected}`}
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-slate-200 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Career pairing tip: {roadmap.careerPairingAdvice}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Priority Career Modules Grid */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Priority Modules for {roadmap.goalLabel}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roadmap.priorityModuleIds.map((modId) => {
            const ctx = ALL_MODULES.find((m) => m.module.id === modId);
            if (!ctx) return null;
            const access = isModuleUnlocked(
              ctx.module.id,
              completedTopicSlugs,
              profile.stageACertified,
              profile.role === 'admin'
            );
            const doneTopics = ctx.module.topicSlugs.filter((s) =>
              completedTopicSlugs.has(s)
            ).length;
            return (
              <button
                key={modId}
                type="button"
                disabled={!access.unlocked}
                onClick={() => ctx.module.topicSlugs[0] && onSelectTopic(ctx.module.topicSlugs[0])}
                className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 text-left hover:border-sky-500 disabled:cursor-not-allowed disabled:opacity-55 dark:border-slate-800 dark:bg-slate-950/50"
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                    <span>
                      Stage {ctx.stage.code} · Module {ctx.module.number}
                    </span>
                    <span>
                      {doneTopics}/{ctx.module.topicSlugs.length}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {ctx.module.title}
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                  {ctx.module.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
