import React from 'react';
import { Briefcase, Compass, Scale } from 'lucide-react';
import { MODULE_BY_ID } from '../lib/content-loader.ts';

interface CareersViewProps {
  onSelectTopic: (topicSlug: string) => void;
}

const CAREER_TRACKS = [
  {
    role: 'SOC Analyst (Tier 1 / Tier 2)',
    stageFocus: 'Stage A Infrastructure + Stage B Phase 7 (SOC & Phishing)',
    dayToDay:
      'Triage SIEM alerts, enrich suspicious IPs/domains via RDAP, passive DNS, crt.sh, Shodan/Censys, and CISA KEV without tipping off adversaries, and write clear escalation notes.',
    mustPairWith:
      'SIEM query languages (Splunk SPL, Microsoft Sentinel KQL, Wazuh), TCP/IP packet fundamentals, Windows/Linux event logs, and basic Python scripting.',
    portfolioDeliverable:
      'Publish 3 sanitized phishing infrastructure & SIEM alert enrichment write-ups using RFC 5737 / defanged indicators and Admiralty confidence ratings.',
    keyModules: ['mod-05', 'mod-08', 'mod-12', 'mod-13', 'mod-14', 'mod-24', 'mod-25', 'mod-26'],
  },
  {
    role: 'Cyber Threat Intelligence (CTI) Analyst',
    stageFocus: 'Stage A Recon + Stage B Phases 6 & 8 (CTI, Diamond Model & ACH)',
    dayToDay:
      'Cluster adversary infrastructure across Certificate Transparency and passive DNS, map campaigns to MITRE ATT&CK TA0043, manage STIX 2.1 / MISP feeds under TLP 2.0, and author BLUF executive advisories.',
    mustPairWith:
      'OpenCTI / MISP administration, STIX 2.1 JSON schemas, malware family triage basics, and structured analytic techniques (ACH).',
    portfolioDeliverable:
      'Build a Diamond Model + MITRE ATT&CK campaign brief tracking a documented public advisory (e.g., CISA or Citizen Lab report) with full source grading.',
    keyModules: ['mod-01', 'mod-12', 'mod-13', 'mod-21', 'mod-22', 'mod-23', 'mod-29', 'mod-30'],
  },
  {
    role: 'Investigative Journalist & Open-Source Fact-Checker',
    stageFocus: 'Stage A Phases 3 & 5 + Stage B Phase 8 (Corporate & Verification)',
    dayToDay:
      'Verify user-generated conflict or civic footage via reverse image search, EXIF/C2PA inspection, Overpass Turbo geospatial queries, and SunCalc shadow chronolocation; trace public procurement and company filings.',
    mustPairWith:
      'Media law & defamation literacy, archival preservation (Perma.cc / Wayback CDX), spreadsheet data cleaning, and trauma-aware verification hygiene.',
    portfolioDeliverable:
      'Produce a reproducible geolocation + chronolocation verification walkthrough using public Creative Commons imagery and Overpass queries.',
    keyModules: ['mod-04', 'mod-09', 'mod-10', 'mod-17', 'mod-18', 'mod-19', 'mod-20', 'mod-30'],
  },
  {
    role: 'Corporate Due Diligence, AML & Fraud Investigator',
    stageFocus: 'Stage A Public Records + Stage B Phase 8 (GLEIF, Filings & Sanctions)',
    dayToDay:
      'Map parent-subsidiary structures via GLEIF LEI, OpenCorporates, SEC EDGAR, and UK Companies House; screen entities against OpenSanctions; detect lookalike vendor BEC domains.',
    mustPairWith:
      'AML/KYC regulatory compliance standards, financial statement literacy, and entity-relationship graph mapping.',
    portfolioDeliverable:
      'Author a corporate beneficial-ownership & domain-risk due diligence dossier on a publicly traded multinational company.',
    keyModules: ['mod-04', 'mod-11', 'mod-15', 'mod-16', 'mod-27', 'mod-28', 'mod-29', 'mod-30'],
  },
];

export function CareersView({ onSelectTopic }: CareersViewProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          OSINT Career Paths & Honest Hiring Reality
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          How Stage A and Stage B translate into real investigative, SOC, and Threat Intelligence
          roles—and the exact complementary skills employers expect alongside OSINT.
        </p>
      </div>

      {/* Honest Market Reality Callout (including regional/Pakistan & global MSSP context) */}
      <div className="rounded-xl border border-sky-500/30 bg-white p-6 dark:bg-slate-900/80">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-sky-600 uppercase dark:text-sky-400">
          <Scale className="h-4 w-4" />
          <span>Honest Employability Guidance — Read Before Job Hunting</span>
        </div>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          In both global remote hiring and regional cybersecurity markets (such as banks, telecom
          CERTs, and MSSP SOCs in Pakistan, MENA, Europe, and North America), standalone "OSINT-only"
          entry roles are rare. Hiring managers recruit{' '}
          <span className="font-semibold">SOC Tier-1 Analysts, Junior CTI Analysts, Fraud/AML Investigators,</span>{' '}
          or <span className="font-semibold">Digital Fact-Checkers</span> who combine disciplined
          passive OSINT with core operational tooling.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          For example, a candidate applying to a bank or MSSP SOC in Karachi, Islamabad, Lahore,
          Dubai, or London stands out immediately when they pair their{' '}
          <span className="font-medium text-slate-900 dark:text-slate-200">
            IHR OSINT Stage A + Stage B Certificates
          </span>{' '}
          with hands-on Wazuh/Splunk/Sentinel log triage, Linux CLI fluency, and Python API
          enrichment scripts.
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {CAREER_TRACKS.map((track) => (
          <div
            key={track.role}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="space-y-3">
              <div className="font-mono text-xs text-sky-600 dark:text-sky-400">
                {track.stageFocus}
              </div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <Briefcase className="h-5 w-5 text-sky-500" />
                <span>{track.role}</span>
              </h2>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {track.dayToDay}
              </p>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950/60">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Essential Skills to Pair With OSINT:
                </div>
                <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-400">
                  {track.mustPairWith}
                </p>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Recommended Portfolio Proof:{' '}
                </span>
                {track.portfolioDeliverable}
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase dark:text-slate-400">
                <Compass className="h-3.5 w-3.5" />
                <span>Core Academy Modules</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {track.keyModules.map((modId) => {
                  const ctx = MODULE_BY_ID[modId];
                  if (!ctx) return null;
                  const slug = ctx.module.topicSlugs[0];
                  return (
                    <button
                      key={modId}
                      type="button"
                      onClick={() => slug && onSelectTopic(slug)}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-700 hover:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    >
                      M{String(ctx.module.number).padStart(2, '0')} · {ctx.module.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
