import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  ExternalLink,
  FileText,
  FlaskConical,
  Lock,
  Scale,
  ShieldAlert,
  Sparkles,
  Trash2,
  Wrench,
} from 'lucide-react';
import { getTopicContext } from '../lib/content-loader.ts';
import { useAcademy } from '../context/AcademyContext.tsx';
import { FillBlankQuiz } from './FillBlankQuiz.tsx';

interface TopicViewProps {
  topicSlug: string;
  onSelectTopic: (slug: string) => void;
  onOpenLab: (labSlug: string) => void;
  onOpenCapstone: (stage: 'A' | 'B') => void;
  onAskAssistant: (topicTitle: string) => void;
}

export function TopicView({
  topicSlug,
  onSelectTopic,
  onOpenLab,
  onOpenCapstone,
  onAskAssistant,
}: TopicViewProps) {
  const {
    profile,
    topics,
    notes,
    allTools,
    completeTopicQuiz,
    saveNote,
    deleteNote,
    requestWorkspaceExport,
  } = useAcademy();

  const ctx = getTopicContext(topicSlug);
  const existingNote = notes.find((n) => n.targetSlug === topicSlug);

  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteSavedBanner, setNoteSavedBanner] = useState(false);

  useEffect(() => {
    if (existingNote) {
      setNoteTitle(existingNote.title);
      setNoteBody(existingNote.content);
    } else if (ctx) {
      setNoteTitle(`Study Notes — ${ctx.topic.title}`);
      setNoteBody('');
    }
    setNoteSavedBanner(false);
  }, [topicSlug, existingNote?.id]);

  if (!ctx) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-600 dark:text-slate-400">Topic not found.</p>
      </div>
    );
  }

  const { topic, stage, phase, module, prevTopic, nextTopic } = ctx;
  const isStageBLocked =
    stage.code === 'B' && !profile?.stageACertified && profile?.role !== 'admin';

  if (isStageBLocked) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-amber-500/40 bg-white p-8 text-center dark:bg-slate-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-500">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">
          Stage B Locked — Earn Your Passive OSINT Certificate First
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Stage B (Advanced Investigation, Threat Intelligence & SOC Enrichment) builds directly on
          verified zero-touch passive discipline. Complete Stage A and pass the Stage A Final Exam
          (70%+) to unlock Modules 21–30.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => onSelectTopic('osint-disciplines-overview')}
            className="shrink-0 whitespace-nowrap rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Return to Stage A
          </button>
          <button
            type="button"
            onClick={() => onOpenCapstone('A')}
            className="shrink-0 whitespace-nowrap rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
          >
            Take Stage A Capstone Exam
          </button>
        </div>
      </div>
    );
  }

  const progress = topics[topic.slug];
  const matchedTools = topic.tools.map((toolName) => {
    const found = allTools.find(
      (t) =>
        t.name.toLowerCase() === toolName.toLowerCase() ||
        toolName.toLowerCase().includes(t.name.toLowerCase()) ||
        t.name.toLowerCase().includes(toolName.toLowerCase())
    );
    return { label: toolName, tool: found || null };
  });

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim()) return;
    await saveNote(topic.slug, noteTitle, noteBody, existingNote?.id);
    setNoteSavedBanner(true);
    setTimeout(() => setNoteSavedBanner(false), 2500);
  };

  const handleExportNoteToDoc = () => {
    const contentLines = [
      `IHR OSINT ACADEMY — INVESTIGATION & STUDY BRIEF`,
      `Topic: ${topic.title}`,
      `Curriculum Location: Stage ${stage.code} · Phase ${phase.number} · Module ${module.number} (${module.title})`,
      `Date: ${new Date().toISOString().slice(0, 10)}`,
      ``,
      `1. CORE CONCEPT SUMMARY`,
      topic.concept,
      ``,
      `2. FRAMEWORK MAPPING`,
      topic.framework,
      ``,
      `3. LEGAL & ETHICAL BOUNDARIES`,
      topic.legalNotes,
      ``,
      `4. ANALYST PERSONAL NOTES`,
      noteBody.trim() || '(No personal notes recorded yet)',
    ].join('\n');

    requestWorkspaceExport({
      kind: 'doc',
      title: noteTitle.trim() || `IHR OSINT — ${topic.title}`,
      summary: `Creates a structured Google Doc containing the Stage ${stage.code} topic summary, legal boundaries, and your personal investigation notes.`,
      docContent: contentLines,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header Metadata */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="font-mono">
            Stage {stage.code} · Phase {phase.number} · Module {module.number} ·{' '}
            <span className="tabular-nums">{topic.estimatedMinutes} min study</span>
          </div>
          {progress?.completed && (
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="tabular-nums">
                Completed ({progress.quizScore}/{progress.quizTotal})
              </span>
            </span>
          )}
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {topic.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Module {module.number}: {module.title}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenLab(module.labSlug)}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FlaskConical className="h-4 w-4 text-sky-500" />
            <span>Open Module {module.number} Lab</span>
          </button>
          <button
            type="button"
            onClick={() => onAskAssistant(topic.title)}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Sparkles className="h-4 w-4 text-sky-500" />
            <span>Ask Grounded Study Assistant</span>
          </button>
        </div>
      </div>

      {/* Section 1: Concept Explanation */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-sky-600 uppercase dark:text-sky-400">
          <BookOpen className="h-4 w-4" />
          <span>1 · Concept Explanation</span>
        </div>
        <p className="mt-3 text-[15px] leading-7 text-slate-700 dark:text-slate-200">
          {topic.concept}
        </p>
      </section>

      {/* Section 2 & Section 3 Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-sky-600 uppercase dark:text-sky-400">
            <Compass className="h-4 w-4" />
            <span>2 · Framework Mapping</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {topic.framework}
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-sky-600 uppercase dark:text-sky-400">
            <FileText className="h-4 w-4" />
            <span>3 · Real-World Ethical Case Study</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {topic.caseStudy}
          </p>
        </section>
      </div>

      {/* Section 4: Real Tools Used */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-sky-600 uppercase dark:text-sky-400">
          <Wrench className="h-4 w-4" />
          <span>4 · Real OSINT Tools & Official Sources</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {matchedTools.map(({ label, tool }) => (
            <div
              key={label}
              className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/50"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {tool ? tool.name : label}
                  </span>
                  {tool && (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-sky-600 hover:underline dark:text-sky-400"
                    >
                      <span>Official URL</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {tool
                    ? `${tool.category} · ${tool.pricing} · ${tool.description}`
                    : 'Standard CLI / OSINT reference utility covered in module lab.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Hands-on Lab Safe Exercise */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-sky-600 uppercase dark:text-sky-400">
            <FlaskConical className="h-4 w-4" />
            <span>5 · Lab-Safe Practical Walkthrough</span>
          </div>
          <button
            type="button"
            onClick={() => onOpenLab(module.labSlug)}
            className="text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400"
          >
            Launch Full Interactive Lab →
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {topic.lab}
        </p>
      </section>

      {/* Section 6 & Section 7: Common Mistakes + Legal & Ethical Notes */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
            <AlertOctagon className="h-4 w-4" />
            <span>6 · Common Analyst Mistakes</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {topic.commonMistakes}
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
            <Scale className="h-4 w-4" />
            <span>7 · Legal & Ethical Guardrails</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {topic.legalNotes}
          </p>
        </section>
      </div>

      {/* Section 8: TryHackMe-Style Fill-in-the-Blank Quiz */}
      <section>
        <FillBlankQuiz
          key={topic.slug}
          questions={topic.quiz}
          topicSlug={topic.slug}
          title={`8 · Topic Quiz — ${topic.title} (5 Fill-in-the-Blank Questions)`}
          onComplete={(score, total) => {
            void completeTopicQuiz(topic.slug, stage.code, score, total, topic.estimatedMinutes);
          }}
        />
      </section>

      {/* Section 9: Personal Investigation Notes + Google Docs Export */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-sky-600 uppercase dark:text-sky-400">
              <ShieldAlert className="h-4 w-4" />
              <span>9 · Personal Investigation Notes</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Prompt: {topic.notesPrompt}
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportNoteToDoc}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FileText className="h-3.5 w-3.5 text-sky-500" />
            <span>Export Brief to Google Docs</span>
          </button>
        </div>

        <form onSubmit={handleSaveNote} className="mt-4 space-y-3">
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <textarea
            rows={4}
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Record key pivots, CLI commands, and ethical boundaries for your notebook..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-emerald-600 dark:text-emerald-400">
              {noteSavedBanner ? 'Saved to your learner notebook.' : ''}
            </div>
            <div className="flex items-center gap-2">
              {existingNote && (
                <button
                  type="button"
                  onClick={() => {
                    void deleteNote(existingNote.id);
                    setNoteBody('');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Note</span>
                </button>
              )}
              <button
                type="submit"
                disabled={!noteBody.trim()}
                className="shrink-0 whitespace-nowrap rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-45"
              >
                Save Note
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Bottom Prev / Next Topic Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        {prevTopic ? (
          <button
            type="button"
            onClick={() => onSelectTopic(prevTopic.slug)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous: {prevTopic.title}</span>
          </button>
        ) : (
          <div />
        )}

        {nextTopic ? (
          <button
            type="button"
            onClick={() => onSelectTopic(nextTopic.slug)}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-500"
          >
            <span>Next: {nextTopic.title}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onOpenCapstone(stage.code)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            <span>Proceed to Stage {stage.code} Capstone Exam</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
