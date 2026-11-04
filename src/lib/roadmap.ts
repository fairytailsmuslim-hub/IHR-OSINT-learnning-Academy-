import { CareerGoal, SkillLevel, SpacedCardRecord } from './types.ts';
import { ALL_MODULES } from './content-loader.ts';

export interface RoadmapRecommendation {
  goalLabel: string;
  goalSummary: string;
  mandatoryRule: string;
  priorityModuleIds: string[];
  weeklyHoursSuggested: number;
  careerPairingAdvice: string;
}

const GOAL_META: Record<
  CareerGoal,
  {
    label: string;
    summary: string;
    focusModules: string[];
    pairing: string;
  }
> = {
  journalist: {
    label: 'Investigative Journalist & Fact-Checker',
    summary:
      'Prioritizes visual verification, SunCalc chronolocation, Overpass geospatial queries, archival preservation, corporate registries, and source corroboration.',
    focusModules: [
      'mod-01', 'mod-03', 'mod-04', 'mod-09', 'mod-10',
      'mod-15', 'mod-17', 'mod-18', 'mod-19', 'mod-20',
      'mod-27', 'mod-28', 'mod-30'
    ],
    pairing:
      'Combine OSINT with data journalism (CSV/Sheets cleaning), media law literacy, and C2PA provenance verification.',
  },
  soc_analyst: {
    label: 'SOC Analyst (Tier 1 / Tier 2)',
    summary:
      'Prioritizes DNS/HTTP/TLS foundations, Linux CLI pivoting, passive DNS, Shodan/Censys exposure, SIEM alert enrichment, phishing kit tracing, and CISA KEV triage.',
    focusModules: [
      'mod-02', 'mod-05', 'mod-07', 'mod-08', 'mod-12',
      'mod-13', 'mod-14', 'mod-16', 'mod-21', 'mod-23',
      'mod-24', 'mod-25', 'mod-26'
    ],
    pairing:
      'Job-market reality: pair OSINT enrichment with SIEM querying (Splunk/Sentinel/Wazuh), TCP/IP packet basics, and Python automation.',
  },
  threat_intel: {
    label: 'Cyber Threat Intelligence (CTI) Analyst',
    summary:
      'Prioritizes Certificate Transparency, passive DNS/ASN pivoting, Diamond Model, MITRE ATT&CK TA0043, STIX/TAXII/TLP 2.0, ACH bias mitigation, and Admiralty BLUF briefs.',
    focusModules: [
      'mod-01', 'mod-03', 'mod-11', 'mod-12', 'mod-13',
      'mod-14', 'mod-21', 'mod-22', 'mod-23', 'mod-25',
      'mod-29', 'mod-30'
    ],
    pairing:
      'Pair with MISP/OpenCTI administration, STIX 2.1 JSON modeling, Python API scripting, and malware family fundamentals.',
  },
  fraud_analyst: {
    label: 'Corporate Due Diligence & Fraud Investigator',
    summary:
      'Prioritizes RDAP domain age checks, email SPF/DMARC spoofing checks, handle corroboration, GLEIF LEI hierarchies, SEC/Companies House filings, and OpenSanctions.',
    focusModules: [
      'mod-01', 'mod-04', 'mod-09', 'mod-10', 'mod-11',
      'mod-15', 'mod-16', 'mod-18', 'mod-27', 'mod-28',
      'mod-30'
    ],
    pairing:
      'Pair with AML/KYC regulatory frameworks, financial statement reading, and graph link analysis.',
  },
  general: {
    label: 'Full-Spectrum OSINT Practitioner',
    summary:
      'Balanced mastery across passive infrastructure, precision search, visual/geospatial verification, defensive CTI, and structured analytic reporting.',
    focusModules: ALL_MODULES.filter((_, idx) => idx % 2 === 0).map((m) => m.module.id),
    pairing:
      'Pair with Linux CLI fluency, structured note-taking, and Python data parsing for broad investigative versatility.',
  },
};

export function generateAdaptiveRoadmap(
  goal: CareerGoal,
  skillLevel: SkillLevel
): RoadmapRecommendation {
  const meta = GOAL_META[goal] || GOAL_META.general;
  const weeklyHoursSuggested =
    skillLevel === 'beginner' ? 6 : skillLevel === 'intermediate' ? 8 : 10;

  return {
    goalLabel: meta.label,
    goalSummary: meta.summary,
    mandatoryRule:
      'Stage A (Modules 1–20 + Passive OSINT Certificate) is mandatory for every learner before Stage B unlocks.',
    priorityModuleIds: meta.focusModules,
    weeklyHoursSuggested,
    careerPairingAdvice: meta.pairing,
  };
}

/**
 * SM-2 inspired spaced repetition scheduling for TryHackMe-style fill-in-the-blank items.
 */
export function computeNextSpacedCardState(
  existing: Pick<SpacedCardRecord, 'intervalDays' | 'streak'> | null,
  wasCorrectWithoutHint: boolean
): { intervalDays: number; streak: number; nextReviewEpochMs: number } {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  if (!wasCorrectWithoutHint) {
    // Re-queue for short-term reinforcement (in 10 minutes / 0 days interval)
    return {
      intervalDays: 0,
      streak: 0,
      nextReviewEpochMs: now + 10 * 60 * 1000,
    };
  }

  const prevStreak = existing?.streak ?? 0;
  const prevInterval = existing?.intervalDays ?? 0;
  const newStreak = prevStreak + 1;

  let nextInterval = 1;
  if (newStreak === 1) nextInterval = 1;
  else if (newStreak === 2) nextInterval = 3;
  else if (newStreak === 3) nextInterval = 7;
  else nextInterval = Math.min(180, Math.round(Math.max(7, prevInterval) * 2.2));

  return {
    intervalDays: nextInterval,
    streak: newStreak,
    nextReviewEpochMs: now + nextInterval * DAY_MS,
  };
}
