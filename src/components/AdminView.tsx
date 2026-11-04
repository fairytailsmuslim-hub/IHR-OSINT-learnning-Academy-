import React, { useEffect, useState } from 'react';
import { PlusCircle, ShieldAlert } from 'lucide-react';
import { ToolCategory } from '../lib/types.ts';
import { useAcademy } from '../context/AcademyContext.tsx';

interface AdminOverviewData {
  counts: {
    stages: number;
    phases: number;
    modules: number;
    topics: number;
    tools: number;
    labs: number;
    frameworks: number;
    caseStudies: number;
    glossaryTerms: number;
  };
  demoUsers: {
    email: string;
    displayName: string;
    role: string;
    careerGoal: string;
    completedTopics: number;
    completedLabs: number;
    stageACertified: boolean;
    stageBCertified: boolean;
  }[];
}

export function AdminView() {
  const { profile, addCustomTool } = useAcademy();
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('https://');
  const [category, setCategory] = useState<ToolCategory>('Domain/IP');
  const [pricing, setPricing] = useState<'Free' | 'Freemium' | 'Open Source' | 'Paid'>('Free');
  const [platform, setPlatform] = useState('Web');
  const [stage, setStage] = useState<'A' | 'B'>('A');
  const [description, setDescription] = useState('');
  const [ethicalNote, setEthicalNote] = useState(
    'Zero-touch passive lookup only; respect terms of service and privacy regulations.'
  );
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((r) => r.json())
      .then((d) => setOverview(d))
      .catch(() => null);
  }, []);

  if (profile?.role !== 'admin') {
    return (
      <div className="rounded-xl border border-rose-300 bg-white p-8 text-center dark:border-rose-900 dark:bg-slate-900">
        <ShieldAlert className="mx-auto h-7 w-7 text-rose-500" />
        <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
          Instructor Privileges Required
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Sign in as admin@ihr-osint.local or the Academy administrator account to manage content.
        </p>
      </div>
    );
  }

  const handleCreateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrMsg(null);
    try {
      await addCustomTool({
        name,
        url,
        category,
        pricing,
        platform,
        stage,
        description,
        ethicalNote,
      });
      setStatusMsg(`Added verified tool "${name}" to the live directory.`);
      setName('');
      setUrl('https://');
      setDescription('');
    } catch (err: any) {
      setErrMsg(err?.message || 'Failed to create tool.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="font-mono text-xs text-amber-600 dark:text-amber-400">
          ADMINISTRATION & CURRICULUM GOVERNANCE
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          IHR OSINT Instructor Console
        </h1>
      </div>

      {/* Content Seed Inventory */}
      {overview && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {[
            ['Stages', overview.counts.stages],
            ['Phases', overview.counts.phases],
            ['Modules', overview.counts.modules],
            ['Topics', overview.counts.topics],
            ['Tools', overview.counts.tools],
            ['Labs', overview.counts.labs],
            ['Frameworks', overview.counts.frameworks],
            ['Cases', overview.counts.caseStudies],
            ['Glossary', overview.counts.glossaryTerms],
          ].map(([label, val]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="font-mono text-xl font-bold text-slate-900 tabular-nums dark:text-white">
                {val}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Add Real OSINT Tool Form */}
        <form
          onSubmit={handleCreateTool}
          className="space-y-3.5 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6 dark:border-slate-800 dark:bg-slate-900/70"
        >
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <PlusCircle className="h-5 w-5 text-sky-500" />
            <span>Publish Verified OSINT Tool</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real official URLs (`https://`) only. Saved to Firestore `customTools` or self-hosted
            registry.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Tool Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., BGPView"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Official HTTPS URL
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ToolCategory)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="Domain/IP">Domain/IP</option>
              <option value="Search">Search</option>
              <option value="Social">Social</option>
              <option value="Email">Email</option>
              <option value="Image/Video">Image/Video</option>
              <option value="Geo">Geo</option>
              <option value="Threat Intel">Threat Intel</option>
              <option value="Corporate">Corporate</option>
              <option value="Verification">Verification</option>
              <option value="Note-taking/Graph">Note-taking/Graph</option>
            </select>
            <select
              value={pricing}
              onChange={(e) => setPricing(e.target.value as any)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="Free">Free</option>
              <option value="Open Source">Open Source</option>
              <option value="Freemium">Freemium</option>
              <option value="Paid">Paid</option>
            </select>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as 'A' | 'B')}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="A">Stage A</option>
              <option value="B">Stage B</option>
            </select>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="Web / CLI"
              className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Technical Description
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what public records or telemetry this tool queries..."
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Ethical & Legal Guardrail Note
            </label>
            <input
              type="text"
              required
              value={ethicalNote}
              onChange={(e) => setEthicalNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          {statusMsg && <p className="text-xs text-emerald-600 dark:text-emerald-400">{statusMsg}</p>}
          {errMsg && <p className="text-xs text-rose-600 dark:text-rose-400">{errMsg}</p>}

          <button
            type="submit"
            className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500"
          >
            Add Tool to Directory
          </button>
        </form>

        {/* Seeded Local Accounts Progress Roster */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6 dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Self-Hosted Account Roster
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Live learner progress across seeded and registered self-hosted accounts.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="pb-2 font-semibold">Learner</th>
                  <th className="pb-2 font-semibold">Role</th>
                  <th className="pb-2 font-semibold">Topics</th>
                  <th className="pb-2 font-semibold">Stage A / B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {overview?.demoUsers.map((u) => (
                  <tr key={u.email}>
                    <td className="py-2.5">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {u.displayName}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-2.5 font-mono text-slate-600 dark:text-slate-300">{u.role}</td>
                    <td className="py-2.5 font-mono tabular-nums">
                      {u.completedTopics}/60 · {u.completedLabs}/30 labs
                    </td>
                    <td className="py-2.5 font-mono text-[11px]">
                      A:{u.stageACertified ? 'PASS' : 'OPEN'} · B:
                      {u.stageBCertified ? 'PASS' : 'LOCKED'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
