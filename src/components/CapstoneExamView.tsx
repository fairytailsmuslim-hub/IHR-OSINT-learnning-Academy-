import React, { useState } from 'react';
import { Award, CheckCircle2, Download, FileText, Lock, XCircle } from 'lucide-react';
import { CAPSTONES, CURRICULUM, checkFillBlankAnswer } from '../lib/content-loader.ts';
import { StageCode } from '../lib/types.ts';
import { useAcademy } from '../context/AcademyContext.tsx';
import { downloadCertificatePdf } from '../lib/certificate.ts';

interface CapstoneExamViewProps {
  stage: StageCode;
  onUnlockStageBExplore: () => void;
}

export function CapstoneExamView({ stage, onUnlockStageBExplore }: CapstoneExamViewProps) {
  const { profile, issueStageCertificate, requestWorkspaceExport } = useAcademy();

  const exam = stage === 'A' ? CAPSTONES.stageA : CAPSTONES.stageB;
  const stageMeta = CURRICULUM.stages.find((s) => s.code === stage) || CURRICULUM.stages[0];

  const isLocked =
    stage === 'B' && !profile?.stageACertified && profile?.role !== 'admin';

  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [fibAnswers, setFibAnswers] = useState<Record<string, string>>({});
  const [scenarioReport, setScenarioReport] = useState('');
  const [submittedResult, setSubmittedResult] = useState<{
    percentage: number;
    passed: boolean;
    mcqCorrect: number;
    fibCorrect: number;
    reportAccepted: boolean;
    certId: string;
  } | null>(null);

  if (isLocked) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-amber-500/40 bg-white p-8 text-center dark:bg-slate-900">
        <Lock className="mx-auto h-8 w-8 text-amber-500" />
        <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">
          Stage B Capstone Locked
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          You must first pass the Stage A Final Exam (70%+) and earn the Passive OSINT Certificate
          before accessing the Stage B Advanced Investigation Capstone.
        </p>
      </div>
    );
  }

  const wordCount = scenarioReport
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const handleGradeExam = async (e: React.FormEvent) => {
    e.preventDefault();
    let mcqCorrect = 0;
    for (const m of exam.mcqs) {
      if (mcqAnswers[m.id] === m.correctIndex) mcqCorrect++;
    }

    let fibCorrect = 0;
    for (const f of exam.fillBlanks) {
      if (checkFillBlankAnswer(fibAnswers[f.id] || '', f.acceptedAnswers)) {
        fibCorrect++;
      }
    }

    const reportAccepted = wordCount >= 50;
    const reportPoints = reportAccepted ? 5 : Math.min(4, Math.floor(wordCount / 12));
    const totalPoints = exam.mcqs.length + exam.fillBlanks.length + 5; // 40 + 10 + 5 = 55
    const earnedPoints = mcqCorrect + fibCorrect + reportPoints;
    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    const passed = percentage >= exam.passPercentage && reportAccepted;

    let certId = '';
    if (passed) {
      certId = await issueStageCertificate(stage, percentage);
    }

    setSubmittedResult({
      percentage,
      passed,
      mcqCorrect,
      fibCorrect,
      reportAccepted,
      certId,
    });
  };

  const handleExportScenarioDoc = () => {
    requestWorkspaceExport({
      kind: 'doc',
      title: `IHR OSINT Stage ${stage} Capstone Report — ${profile?.displayName || 'Analyst'}`,
      summary: `Exports your Stage ${stage} Capstone Scenario Investigation Report to Google Docs for portfolio archiving.`,
      docContent: [
        `IHR OSINT ACADEMY — STAGE ${stage} CAPSTONE INVESTIGATION REPORT`,
        `Analyst: ${profile?.displayName || 'OSINT Learner'}`,
        `Exam: ${exam.title}`,
        `Date (UTC): ${new Date().toISOString().slice(0, 10)}`,
        ``,
        `SCENARIO BRIEF`,
        exam.scenarioPrompt,
        ``,
        `SUBMITTED INVESTIGATION REPORT`,
        scenarioReport.trim() || '(Draft empty)',
      ].join('\n'),
    });
  };

  const alreadyCertified =
    stage === 'A' ? profile?.stageACertified : profile?.stageBCertified;
  const existingCertId =
    stage === 'A' ? profile?.stageACertId || '' : profile?.stageBCertId || '';
  const existingScore =
    stage === 'A' ? profile?.stageAScore || 85 : profile?.stageBScore || 85;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="font-mono text-xs text-sky-600 dark:text-sky-400">
          STAGE {stage} FINAL EXAMINATION · {exam.mcqs.length} MCQS · {exam.fillBlanks.length}{' '}
          FILL-IN-THE-BLANK · 1 SCENARIO REPORT
        </div>
        <h1 className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-slate-100">
          {exam.title}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Minimum passing score: <span className="font-mono font-semibold tabular-nums">70%</span>{' '}
          plus a structured scenario report (minimum 50 words). Passing awards the downloadable{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {exam.certificateName}
          </span>{' '}
          PDF.
        </p>

        {alreadyCertified && existingCertId && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/40 bg-emerald-50/60 p-4 dark:bg-emerald-950/25">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {exam.certificateName} Earned ({existingScore}%)
                </div>
                <div className="font-mono text-xs text-slate-600 dark:text-slate-400">
                  Verification ID: {existingCertId}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                downloadCertificatePdf({
                  certificateId: existingCertId,
                  studentName: profile?.displayName || 'OSINT Scholar',
                  stage,
                  certificateTitle: exam.certificateName,
                  examScore: existingScore,
                  issuedDateIso: new Date().toISOString(),
                  outcomes: stageMeta.outcomes,
                })
              }
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              <Download className="h-4 w-4" />
              <span>Download Certificate PDF</span>
            </button>
          </div>
        )}
      </div>

      {submittedResult && (
        <div
          className={`rounded-xl border p-6 ${
            submittedResult.passed
              ? 'border-emerald-500/50 bg-emerald-50/70 dark:bg-emerald-950/30'
              : 'border-rose-500/50 bg-rose-50/70 dark:bg-rose-950/30'
          }`}
        >
          <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900 dark:text-slate-100">
            {submittedResult.passed ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <span>Examination Passed — {submittedResult.percentage}%</span>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-rose-500" />
                <span>Score: {submittedResult.percentage}% (70% & complete report required)</span>
              </>
            )}
          </div>
          <p className="mt-2 font-mono text-xs text-slate-700 tabular-nums dark:text-slate-300">
            MCQs: {submittedResult.mcqCorrect}/{exam.mcqs.length} · Fill-in-the-Blank:{' '}
            {submittedResult.fibCorrect}/{exam.fillBlanks.length} · Scenario Report:{' '}
            {submittedResult.reportAccepted ? 'Accepted' : 'Needs at least 50 words'}
          </p>

          {submittedResult.passed && (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  downloadCertificatePdf({
                    certificateId: submittedResult.certId,
                    studentName: profile?.displayName || 'OSINT Scholar',
                    stage,
                    certificateTitle: exam.certificateName,
                    examScore: submittedResult.percentage,
                    issuedDateIso: new Date().toISOString(),
                    outcomes: stageMeta.outcomes,
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <Download className="h-4 w-4" />
                <span>Download {exam.certificateName} (PDF)</span>
              </button>
              {stage === 'A' && (
                <button
                  type="button"
                  onClick={onUnlockStageBExplore}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500"
                >
                  <span>Enter Unlocked Stage B Curriculum →</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleGradeExam} className="space-y-6">
        {/* Part 1: 40 MCQs */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Part 1 — Multiple-Choice Assessment (40 Questions)
          </h2>
          <div className="mt-5 space-y-5">
            {exam.mcqs.map((m, idx) => (
              <div
                key={m.id}
                className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/50"
              >
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  <span className="mr-2 font-mono text-xs text-sky-600 tabular-nums dark:text-sky-400">
                    {idx + 1}.
                  </span>
                  {m.q}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {m.options.map((opt, optIdx) => {
                    const chosen = mcqAnswers[m.id] === optIdx;
                    return (
                      <label
                        key={opt}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-xs transition ${
                          chosen
                            ? 'border-sky-500 bg-sky-50 text-sky-950 dark:bg-sky-950/40 dark:text-sky-100'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={m.id}
                          checked={chosen}
                          onChange={() =>
                            setMcqAnswers((prev) => ({ ...prev, [m.id]: optIdx }))
                          }
                          className="accent-sky-600"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Part 2: 10 Fill-in-the-Blank */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Part 2 — Precision Fill-in-the-Blank (10 Questions)
          </h2>
          <div className="mt-5 space-y-4">
            {exam.fillBlanks.map((fb, idx) => (
              <div
                key={fb.id}
                className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/50"
              >
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  <span className="mr-2 font-mono text-xs text-sky-600 tabular-nums dark:text-sky-400">
                    FB-{idx + 1}.
                  </span>
                  {fb.prompt}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Hint: {fb.hint}</p>
                <input
                  type="text"
                  value={fibAnswers[fb.id] || ''}
                  onChange={(e) =>
                    setFibAnswers((prev) => ({ ...prev, [fb.id]: e.target.value }))
                  }
                  placeholder="Type answer..."
                  className="mt-2.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Part 3: Capstone Scenario Investigation Report */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Part 3 — Capstone Scenario Investigation Report
            </h2>
            <button
              type="button"
              onClick={handleExportScenarioDoc}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FileText className="h-3.5 w-3.5 text-sky-500" />
              <span>Export Report to Google Docs</span>
            </button>
          </div>
          <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
            {exam.scenarioPrompt}
          </p>
          <textarea
            rows={7}
            value={scenarioReport}
            onChange={(e) => setScenarioReport(e.target.value)}
            placeholder="Write your structured report here: 1. BLUF Executive Summary, 2. Passive Sources & Artifacts Corroborated, 3. Admiralty Grading & Confidence, 4. OPSEC & Legal Boundaries Maintained..."
            className="mt-3 w-full rounded-lg border border-slate-300 bg-white p-3.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono tabular-nums">
              Word count: {wordCount} / 50 minimum required
            </span>
            <span>Submit below when all 3 parts are complete</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="shrink-0 whitespace-nowrap rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-500"
          >
            Submit Stage {stage} Final Exam & Evaluate Certificate
          </button>
        </div>
      </form>
    </div>
  );
}
