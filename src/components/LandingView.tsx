import React from 'react';
import { ArrowRight, Award, Lock, Moon, Scale, ShieldCheck, Sun } from 'lucide-react';
import heroImg from '../assets/images/osint_hero_mapping_1793786841217.jpg';
import stageAImg from '../assets/images/stage_a_passive_recon_1793786842539.jpg';
import stageBImg from '../assets/images/stage_b_threat_intel_1793786842905.jpg';
import { useAcademy } from '../context/AcademyContext.tsx';

interface LandingViewProps {
  onOpenAuth: () => void;
}

export function LandingView({ onOpenAuth }: LandingViewProps) {
  const { theme, toggleTheme } = useAcademy();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* 3-Zone Top Bar Contract: Brand Wordmark | 4 Single-Line Links | 1 Primary CTA */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
          <div className="flex shrink-0 items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <span className="text-base font-bold tracking-tight whitespace-nowrap">
              IHR OSINT Academy
            </span>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
            <a href="#stages" className="whitespace-nowrap hover:text-sky-600 dark:hover:text-sky-400">
              Two-Stage Curriculum
            </a>
            <a href="#pedagogy" className="whitespace-nowrap hover:text-sky-600 dark:hover:text-sky-400">
              Labs & Pedagogy
            </a>
            <a href="#ethics" className="whitespace-nowrap hover:text-sky-600 dark:hover:text-sky-400">
              Ethical Charter
            </a>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 whitespace-nowrap text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </nav>

          <button
            type="button"
            onClick={onOpenAuth}
            className="shrink-0 whitespace-nowrap rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
          >
            Start Academy
          </button>
        </div>
      </header>

      {/* Hero Section — Balanced Viewport Budget */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-6">
            <div className="font-mono text-xs font-medium tracking-wider text-sky-600 uppercase dark:text-sky-400">
              Open Source Intelligence · Zero to Pro Curriculum
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Master Passive OSINT Before Advancing to Threat Intelligence.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Structured two-stage investigator training built on verifiable public records,
              zero-touch reconnaissance discipline, TryHackMe-style fill-in-the-blank assessments,
              and Admiralty-graded reporting.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-500"
              >
                <span>Enter Learning Platform</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#stages"
                className="shrink-0 whitespace-nowrap rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Inspect 30-Module Syllabus
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 border-t border-slate-200 pt-6 dark:border-slate-800">
              <div>
                <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
                  30
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Structured Modules · 60 Topics
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
                  55+
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Real OSINT Tools & Registries
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
                  2
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Gated Verifiable Certificates
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-2xl dark:border-slate-800">
              <img
                src={heroImg}
                alt="Global passive OSINT network and geospatial verification"
                referrerPolicy="no-referrer"
                className="aspect-video w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Two-Stage Gated Architecture */}
      <section id="stages" className="border-t border-slate-200 py-16 dark:border-slate-800/80">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Two-Stage Certificate Architecture
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Every practitioner begins with Stage A zero-touch passive reconnaissance. Stage B
              unlocks only after passing the Stage A Capstone Examination (70%+) and earning the
              Passive OSINT Certificate.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {/* Stage A Card */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70">
              <div className="aspect-16/9 w-full overflow-hidden bg-slate-900">
                <img
                  src={stageAImg}
                  alt="Stage A Passive OSINT Framework"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="font-mono text-xs text-sky-600 dark:text-sky-400">
                    STAGE A · PHASES 1–5 · MODULES 1–20 · OPEN TO ALL LEARNERS
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                    Passive OSINT Framework (Certificate Level)
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    Learn OPSEC sock-puppet isolation, DNS/HTTP/TLS mechanics, search dorking,
                    Wayback CDX archives, ICANN RDAP, crt.sh Certificate Transparency, passive DNS,
                    Shodan/Censys historical datasets, reverse image verification, and SunCalc
                    chronolocation without sending a single packet to a target.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                    <Award className="h-4 w-4" />
                    Awards: Passive OSINT Certificate (PDF)
                  </span>
                  <span className="font-mono tabular-nums">40 MCQs + 10 FIB + Report</span>
                </div>
              </div>
            </div>

            {/* Stage B Card */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70">
              <div className="aspect-16/9 w-full overflow-hidden bg-slate-900">
                <img
                  src={stageBImg}
                  alt="Stage B Threat Intelligence and SOC Enrichment"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 font-mono text-xs text-amber-600 dark:text-amber-400">
                    <Lock className="h-3.5 w-3.5" />
                    <span>STAGE B · PHASES 6–8 · MODULES 21–30 · GATED BY STAGE A CERTIFICATE</span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                    Advanced Investigation (Threat Intel & SOC)
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    Operationalize passive collection inside Cyber Threat Intelligence and SOC
                    workflows: Diamond Model, MITRE ATT&CK TA0043 mapping, STIX 2.1 & TLP 2.0, SIEM
                    alert enrichment, phishing kit & CISA KEV triage, GLEIF/OpenCorporates due
                    diligence, ACH bias mitigation, and Admiralty BLUF briefs.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5 font-medium text-sky-600 dark:text-sky-400">
                    <Award className="h-4 w-4" />
                    Awards: Advanced OSINT & Threat Intel Certificate
                  </span>
                  <span className="font-mono tabular-nums">40 MCQs + 10 FIB + Report</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pedagogy & Ethical Charter */}
      <section
        id="pedagogy"
        className="border-t border-slate-200 bg-white py-16 dark:border-slate-800/80 dark:bg-slate-900/40"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-3">
          <div className="space-y-2">
            <div className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400">
              01 · ACTIVE RECALL PEDAGOGY
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              TryHackMe-Style Fill-in-the-Blank + Spaced Repetition
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Every topic includes 9 structured sections, lab-safe exercises against RFC 2606 /
              public registries, and precision fill-in-the-blank checks that automatically schedule
              missed concepts for spaced review.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400">
              02 · REAL TOOLS & WORKSPACE EXPORT
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              55+ Authentic Registries & Google Docs / Sheets Export
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Zero fictional tools or invented CVEs. Export your investigation notes and capstone
              reports directly to Google Docs or sync your study tracker to Google Sheets.
            </p>
          </div>

          <div id="ethics" className="space-y-2">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Scale className="h-3.5 w-3.5" />
              <span>03 · ETHICAL CHARTER</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hunt Patterns, Not Private People
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Zero tracking, zero analytics, and strict prohibition against harassment, doxxing,
              credential stuffing, or unauthorized active probing. Self-hostable anywhere via Docker
              Compose.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
