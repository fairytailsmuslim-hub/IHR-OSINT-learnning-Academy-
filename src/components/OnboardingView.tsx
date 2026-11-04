import React, { useState } from 'react';
import { ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { CareerGoal, SkillLevel } from '../lib/types.ts';
import { generateAdaptiveRoadmap } from '../lib/roadmap.ts';
import { useAcademy } from '../context/AcademyContext.tsx';

interface OnboardingViewProps {
  onComplete: () => void;
}

const GOALS: { value: CareerGoal; title: string; subtitle: string }[] = [
  {
    value: 'soc_analyst',
    title: 'SOC Analyst (Tier 1 / Tier 2)',
    subtitle: 'Alert enrichment, DNS/IP triage, phishing infrastructure, and CISA KEV tracking.',
  },
  {
    value: 'threat_intel',
    title: 'Cyber Threat Intelligence (CTI) Analyst',
    subtitle: 'Diamond Model, MITRE ATT&CK TA0043, STIX/TAXII, ACH, and Admiralty briefs.',
  },
  {
    value: 'journalist',
    title: 'Investigative Journalist & Fact-Checker',
    subtitle: 'Visual verification, SunCalc chronolocation, archives, and source corroboration.',
  },
  {
    value: 'fraud_analyst',
    title: 'Corporate Due Diligence & Fraud Investigator',
    subtitle: 'GLEIF LEI ownership trees, company registries, sanctions, and domain spoofing.',
  },
  {
    value: 'general',
    title: 'Full-Spectrum OSINT Practitioner',
    subtitle: 'Balanced mastery across search, infrastructure, geospatial, and structured CTI.',
  },
];

const LEVELS: { value: SkillLevel; label: string; detail: string }[] = [
  {
    value: 'beginner',
    label: 'Beginner (Zero IT / Cyber Background)',
    detail: 'Starts from DNS/IP basics, browser mechanics, and step-by-step passive safety.',
  },
  {
    value: 'intermediate',
    label: 'Intermediate (IT / Networking Student)',
    detail: 'Comfortable with CLI basics; focuses on precision pivoting and verification.',
  },
  {
    value: 'pro',
    label: 'Experienced Analyst',
    detail: 'Fast-tracks through Stage A exam prep to unlock Stage B CTI & SOC operations.',
  },
];

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const { profile, saveOnboarding } = useAcademy();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [goal, setGoal] = useState<CareerGoal>(profile?.careerGoal || 'soc_analyst');
  const [skill, setSkill] = useState<SkillLevel>(profile?.skillLevel || 'beginner');
  const [saving, setSaving] = useState(false);

  const previewRoadmap = generateAdaptiveRoadmap(goal, skill);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveOnboarding({
        displayName: displayName.trim() || profile?.displayName || 'OSINT Learner',
        careerGoal: goal,
        skillLevel: skill,
      });
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl py-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 uppercase dark:text-sky-400">
            <Compass className="h-4 w-4" />
            <span>Adaptive Learning Path Calibration</span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
            Personalize Your OSINT Roadmap
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Every student completes Stage A (Modules 1–20 + Passive OSINT Certificate) first before
            Stage B unlocks. Your answers prioritize career-aligned modules and study pacing.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Name Displayed on Your Verifiable PDF Certificates
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your full name..."
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            1 · Primary Career or Investigation Goal
          </label>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            {GOALS.map((g) => {
              const selected = goal === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGoal(g.value)}
                  className={`rounded-xl border p-3.5 text-left transition ${
                    selected
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/50'
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {g.title}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {g.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            2 · Current Technical Experience
          </label>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
            {LEVELS.map((l) => {
              const selected = skill === l.value;
              return (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setSkill(l.value)}
                  className={`rounded-xl border p-3.5 text-left transition ${
                    selected
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/50'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {l.label}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                    {l.detail}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Roadmap Preview */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>
              Recommended Pacing: {previewRoadmap.weeklyHoursSuggested} hrs/week ·{' '}
              {previewRoadmap.priorityModuleIds.length} Priority Modules Flagged
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {previewRoadmap.goalSummary}
          </p>
          <p className="mt-1.5 text-xs font-medium text-sky-700 dark:text-sky-400">
            {previewRoadmap.careerPairingAdvice}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
          >
            <span>{saving ? 'Saving Roadmap...' : 'Save Adaptive Path & Enter Dashboard'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
