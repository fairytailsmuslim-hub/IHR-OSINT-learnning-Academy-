import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, RotateCcw, XCircle } from 'lucide-react';
import { FillBlankQuestion } from '../lib/types.ts';
import { checkFillBlankAnswer } from '../lib/content-loader.ts';
import { useAcademy } from '../context/AcademyContext.tsx';

interface FillBlankQuizProps {
  questions: FillBlankQuestion[];
  topicSlug: string;
  title?: string;
  onComplete?: (score: number, total: number) => void;
}

interface QuestionAttemptState {
  input: string;
  submitted: boolean;
  isCorrect: boolean;
  hintShown: boolean;
}

export function FillBlankQuiz({
  questions,
  topicSlug,
  title = 'Fill-in-the-Blank Knowledge Check',
  onComplete,
}: FillBlankQuizProps) {
  const { recordSpacedAttempt } = useAcademy();

  const [states, setStates] = useState<Record<string, QuestionAttemptState>>(() =>
    Object.fromEntries(
      questions.map((q) => [
        q.id,
        { input: '', submitted: false, isCorrect: false, hintShown: false },
      ])
    )
  );
  const [finalized, setFinalized] = useState(false);

  const handleInputChange = (id: string, val: string) => {
    setStates((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { submitted: false, isCorrect: false, hintShown: false }), input: val },
    }));
  };

  const handleRevealHint = (id: string) => {
    setStates((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { input: '', submitted: false, isCorrect: false }),
        hintShown: true,
      },
    }));
  };

  const handleSubmitOne = async (q: FillBlankQuestion) => {
    const st = states[q.id];
    if (!st || !st.input.trim()) return;

    const correct = checkFillBlankAnswer(st.input, q.acceptedAnswers);
    const nextMap: Record<string, QuestionAttemptState> = {
      ...states,
      [q.id]: {
        ...st,
        submitted: true,
        isCorrect: correct,
      },
    };
    setStates(nextMap);

    // Queue or update Spaced Repetition card if incorrect or hint was needed
    await recordSpacedAttempt({
      cardId: `sr-${q.id}`,
      topicSlug,
      prompt: q.prompt,
      answer: q.acceptedAnswers[0] || '',
      wasCorrectWithoutHint: correct && !st.hintShown,
    });

    // Check if all questions have now been answered
    const allAnswered = questions.every((item) => nextMap[item.id]?.submitted);
    if (allAnswered && !finalized) {
      setFinalized(true);
      const totalCorrect = questions.filter((item) => nextMap[item.id]?.isCorrect).length;
      onComplete?.(totalCorrect, questions.length);
    }
  };

  const handleRetryOne = (id: string) => {
    setStates((prev) => ({
      ...prev,
      [id]: {
        input: '',
        submitted: false,
        isCorrect: false,
        hintShown: prev[id]?.hintShown || false,
      },
    }));
    setFinalized(false);
  };

  const answeredCount = questions.filter((q) => states[q.id]?.submitted).length;
  const correctCount = questions.filter((q) => states[q.id]?.isCorrect).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Case-insensitive trimmed grading · Missed or hinted items automatically enter Spaced Repetition
          </p>
        </div>
        <div className="font-mono text-xs text-slate-600 tabular-nums dark:text-slate-300">
          {correctCount}/{questions.length} correct · {answeredCount}/{questions.length} answered
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {questions.map((q, idx) => {
          const st = states[q.id] || {
            input: '',
            submitted: false,
            isCorrect: false,
            hintShown: false,
          };

          return (
            <div
              key={q.id}
              className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100">
                  <span className="mr-2 font-mono text-xs text-sky-600 tabular-nums dark:text-sky-400">
                    Q{idx + 1}.
                  </span>
                  {q.prompt}
                </p>
                {!st.hintShown && !st.submitted && (
                  <button
                    type="button"
                    onClick={() => handleRevealHint(q.id)}
                    className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Hint</span>
                  </button>
                )}
              </div>

              {st.hintShown && (
                <div className="mt-2.5 rounded-md border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                  <span className="font-semibold">Hint: </span>
                  {q.hint}
                </div>
              )}

              <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={st.input}
                  disabled={st.submitted}
                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !st.submitted) {
                      e.preventDefault();
                      void handleSubmitOne(q);
                    }
                  }}
                  placeholder="Type exact term, command, or value..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none disabled:opacity-75 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                {!st.submitted ? (
                  <button
                    type="button"
                    onClick={() => void handleSubmitOne(q)}
                    disabled={!st.input.trim()}
                    className="shrink-0 whitespace-nowrap rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-45"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRetryOne(q.id)}
                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Retry</span>
                  </button>
                )}
              </div>

              {st.submitted && (
                <div
                  className={`mt-3 rounded-lg border p-3 text-xs leading-relaxed ${
                    st.isCorrect
                      ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200'
                      : 'border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {st.isCorrect ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                        <span>
                          Not quite — Accepted answer:{' '}
                          <code className="rounded bg-slate-900/10 px-1.5 py-0.5 font-mono dark:bg-white/10">
                            {q.acceptedAnswers[0]}
                          </code>
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-1.5 text-slate-700 dark:text-slate-300">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
