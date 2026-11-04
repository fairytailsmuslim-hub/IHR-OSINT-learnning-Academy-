import React from 'react';
import { Award, CheckCircle2, Download, Lock } from 'lucide-react';
import { CURRICULUM } from '../lib/content-loader.ts';
import { useAcademy } from '../context/AcademyContext.tsx';
import { downloadCertificatePdf } from '../lib/certificate.ts';

interface CertificateViewProps {
  onOpenCapstone: (stage: 'A' | 'B') => void;
}

export function CertificateView({ onOpenCapstone }: CertificateViewProps) {
  const { profile } = useAcademy();
  if (!profile) return null;

  const stageA = CURRICULUM.stages[0];
  const stageB = CURRICULUM.stages[1];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Verifiable Academic Certificates
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Pass the Stage A Capstone Exam (70%+) to earn your Passive OSINT Certificate PDF and
          unlock Stage B. Pass Stage B to earn your Advanced OSINT & Threat Intel Certificate.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stage A Certificate Card */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-sky-600 dark:text-sky-400">
                STAGE A CREDENTIAL · FOUNDATION GATE
              </span>
              {profile.stageACertified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Earned ({profile.stageAScore}%)</span>
                </span>
              ) : (
                <span className="text-xs text-slate-500">Not yet earned</span>
              )}
            </div>

            <h2 className="mt-2 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <Award className="h-6 w-6 text-sky-500" />
              <span>Passive OSINT Certificate</span>
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Certifies mastery of Phases 1–5 (Modules 1–20): zero-touch reconnaissance, OPSEC
              isolation, DNS/TLS mechanics, search operators, Wayback CDX archives, RDAP, crt.sh,
              passive DNS, and visual/geospatial verification.
            </p>

            {profile.stageACertified && profile.stageACertId && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                Verification ID: {profile.stageACertId}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4">
            {profile.stageACertified && stageA ? (
              <button
                type="button"
                onClick={() =>
                  downloadCertificatePdf({
                    certificateId: profile.stageACertId,
                    studentName: profile.displayName,
                    stage: 'A',
                    certificateTitle: 'Passive OSINT Certificate',
                    examScore: profile.stageAScore || 85,
                    issuedDateIso: new Date().toISOString(),
                    outcomes: stageA.outcomes,
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <Download className="h-4 w-4" />
                <span>Download Passive OSINT Certificate (PDF)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenCapstone('A')}
                className="rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-500"
              >
                Take Stage A Capstone Final Exam →
              </button>
            )}
          </div>
        </div>

        {/* Stage B Certificate Card */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/70">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                STAGE B CREDENTIAL · PRO LEVEL
              </span>
              {profile.stageBCertified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Earned ({profile.stageBScore}%)</span>
                </span>
              ) : !profile.stageACertified && profile.role !== 'admin' ? (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Requires Stage A Certificate</span>
                </span>
              ) : (
                <span className="text-xs text-slate-500">Unlocked · Exam Available</span>
              )}
            </div>

            <h2 className="mt-2 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <Award className="h-6 w-6 text-indigo-500" />
              <span>Advanced OSINT & Threat Intel Certificate</span>
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Certifies mastery of Phases 6–8 (Modules 21–30): Diamond Model, MITRE ATT&CK TA0043,
              STIX/TAXII & TLP 2.0, SOC alert enrichment, phishing & CISA KEV triage, corporate due
              diligence, ACH bias mitigation, and Admiralty BLUF reporting.
            </p>

            {profile.stageBCertified && profile.stageBCertId && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                Verification ID: {profile.stageBCertId}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4">
            {profile.stageBCertified && stageB ? (
              <button
                type="button"
                onClick={() =>
                  downloadCertificatePdf({
                    certificateId: profile.stageBCertId,
                    studentName: profile.displayName,
                    stage: 'B',
                    certificateTitle: 'Advanced OSINT & Threat Intel Certificate',
                    examScore: profile.stageBScore || 88,
                    issuedDateIso: new Date().toISOString(),
                    outcomes: stageB.outcomes,
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <Download className="h-4 w-4" />
                <span>Download Stage B Pro Certificate (PDF)</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!profile.stageACertified && profile.role !== 'admin'}
                onClick={() => onOpenCapstone('B')}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {profile.stageACertified || profile.role === 'admin'
                  ? 'Take Stage B Capstone Final Exam →'
                  : 'Locked Until Stage A Certificate Earned'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
