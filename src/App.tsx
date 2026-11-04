/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Award,
  BookMarked,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  FlaskConical,
  GitBranch,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Wrench,
  X,
} from 'lucide-react';

import { CURRICULUM, MODULE_BY_ID, TOPIC_BY_SLUG } from './lib/content-loader.ts';
import { AcademyProvider, useAcademy } from './context/AcademyContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { LandingView } from './components/LandingView.tsx';
import { AuthView } from './components/AuthView.tsx';
import { OnboardingView } from './components/OnboardingView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { SkillGraph } from './components/SkillGraph.tsx';
import { FrameworkDiagram } from './components/FrameworkDiagram.tsx';
import { TopicView } from './components/TopicView.tsx';
import { CapstoneExamView } from './components/CapstoneExamView.tsx';
import { ToolsView } from './components/ToolsView.tsx';
import { LabsView } from './components/LabsView.tsx';
import { CaseStudiesView } from './components/CaseStudiesView.tsx';
import { GlossaryView } from './components/GlossaryView.tsx';
import { CareersView } from './components/CareersView.tsx';
import { CertificateView } from './components/CertificateView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { SearchHit, SearchModal } from './components/SearchModal.tsx';
import { StudyAssistantDrawer } from './components/StudyAssistantDrawer.tsx';
import { WorkspaceConfirmModal } from './components/WorkspaceConfirmModal.tsx';

type ActiveRoute =
  | { view: 'dashboard' }
  | { view: 'onboarding' }
  | { view: 'skill-graph' }
  | { view: 'frameworks'; slug?: string }
  | { view: 'topic'; topicSlug: string }
  | { view: 'capstone'; stage: 'A' | 'B' }
  | { view: 'tools' }
  | { view: 'labs'; labSlug?: string }
  | { view: 'case-studies' }
  | { view: 'glossary' }
  | { view: 'careers' }
  | { view: 'certificates' }
  | { view: 'admin' };

function AcademyShell() {
  const {
    isAuthReady,
    profile,
    completedTopicSlugs,
    theme,
    toggleTheme,
    logout,
  } = useAcademy();

  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [route, setRoute] = useState<ActiveRoute>({ view: 'dashboard' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantContext, setAssistantContext] = useState('');
  const [expandedStage, setExpandedStage] = useState<'A' | 'B'>('A');
  const [expandedModuleId, setExpandedModuleId] = useState<string>('mod-01');

  // Keyboard shortcut Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (profile) setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [profile]);

  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex items-center gap-3 text-sm font-medium">
          <ShieldCheck className="h-5 w-5 text-sky-400" />
          <span>Loading IHR OSINT Academy...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return showAuthScreen ? (
      <AuthView onBackToLanding={() => setShowAuthScreen(false)} />
    ) : (
      <LandingView onOpenAuth={() => setShowAuthScreen(true)} />
    );
  }

  if (!profile.onboarded || route.view === 'onboarding') {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <OnboardingView onComplete={() => setRoute({ view: 'dashboard' })} />
      </div>
    );
  }

  const navigateTopic = (topicSlug: string) => {
    const t = TOPIC_BY_SLUG[topicSlug];
    if (t) {
      setExpandedStage(t.stage);
      setExpandedModuleId(t.moduleId);
    }
    setRoute({ view: 'topic', topicSlug });
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchResult = (hit: SearchHit) => {
    if (hit.type === 'Topic') {
      navigateTopic(hit.slug);
    } else if (hit.type === 'Tool') {
      setRoute({ view: 'tools' });
    } else if (hit.type === 'Framework') {
      setRoute({ view: 'frameworks', slug: hit.slug });
    } else if (hit.type === 'Lab') {
      setRoute({ view: 'labs', labSlug: hit.slug });
    } else if (hit.type === 'Case Study') {
      setRoute({ view: 'case-studies' });
    } else {
      setRoute({ view: 'glossary' });
    }
  };

  const navItems: {
    id: ActiveRoute['view'];
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard & Queue',
      icon: LayoutDashboard,
      onClick: () => setRoute({ view: 'dashboard' }),
    },
    {
      id: 'skill-graph',
      label: 'Skill Graph',
      icon: GitBranch,
      onClick: () => setRoute({ view: 'skill-graph' }),
    },
    {
      id: 'frameworks',
      label: 'OSINT Frameworks',
      icon: Compass,
      onClick: () => setRoute({ view: 'frameworks' }),
    },
    {
      id: 'labs',
      label: 'Hands-On Labs (30)',
      icon: FlaskConical,
      onClick: () => setRoute({ view: 'labs' }),
    },
    {
      id: 'tools',
      label: 'Tools Directory (55+)',
      icon: Wrench,
      onClick: () => setRoute({ view: 'tools' }),
    },
    {
      id: 'case-studies',
      label: 'Case Studies (10)',
      icon: BookOpen,
      onClick: () => setRoute({ view: 'case-studies' }),
    },
    {
      id: 'glossary',
      label: 'Glossary (155+)',
      icon: BookMarked,
      onClick: () => setRoute({ view: 'glossary' }),
    },
    {
      id: 'careers',
      label: 'Career Paths',
      icon: Briefcase,
      onClick: () => setRoute({ view: 'careers' }),
    },
    {
      id: 'certificates',
      label: 'Certificates (PDF)',
      icon: Award,
      onClick: () => setRoute({ view: 'certificates' }),
    },
  ];

  if (profile.role === 'admin') {
    navItems.push({
      id: 'admin',
      label: 'Instructor Console',
      icon: Settings,
      onClick: () => setRoute({ view: 'admin' }),
    });
  }

  const stageBLocked = !profile.stageACertified && profile.role !== 'admin';

  const SidebarContent = (
    <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
      <div className="mb-4 flex items-center justify-between px-2">
        <button
          type="button"
          onClick={() => setRoute({ view: 'dashboard' })}
          className="flex items-center gap-2 text-left"
        >
          <ShieldCheck className="h-5 w-5 shrink-0 text-sky-500" />
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">IHR OSINT</div>
            <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
              STAGE A & B ACADEMY
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="rounded-lg p-1 text-slate-400 lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Primary Navigation */}
      <div className="space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = route.view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                item.onClick();
                setMobileMenuOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                active
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Two-Stage Curriculum Accordion */}
      <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="px-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Curriculum Syllabus
        </div>

        <div className="mt-2 space-y-2">
          {CURRICULUM.stages.map((st) => {
            const isExpanded = expandedStage === st.code;
            const locked = st.code === 'B' && stageBLocked;

            return (
              <div
                key={st.id}
                className="rounded-xl border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/50"
              >
                <button
                  type="button"
                  onClick={() => setExpandedStage(st.code)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                      {locked && <Lock className="h-3 w-3 text-amber-500" />}
                      <span>STAGE {st.code}</span>
                    </div>
                    <div className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                      {st.code === 'A' ? 'Passive OSINT (20 Mods)' : 'Threat Intel & SOC (10 Mods)'}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-2 border-t border-slate-200 px-2 py-2.5 dark:border-slate-800">
                    {st.phases.map((ph) => (
                      <div key={ph.id} className="space-y-1">
                        <div className="px-1.5 font-mono text-[10px] font-semibold text-slate-400">
                          P{ph.number} · {ph.title}
                        </div>
                        {ph.modules.map((mod) => {
                          const modOpen = expandedModuleId === mod.id;
                          const allDone = mod.topicSlugs.every((s) =>
                            completedTopicSlugs.has(s)
                          );
                          return (
                            <div key={mod.id}>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedModuleId(modOpen ? '' : mod.id)
                                }
                                className="flex w-full items-center justify-between gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] font-medium text-slate-700 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800/70"
                              >
                                <span className="truncate">
                                  M{mod.number}. {mod.title}
                                </span>
                                {allDone && (
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                )}
                              </button>
                              {modOpen && (
                                <div className="ml-2 space-y-0.5 border-l border-slate-200 pl-2 dark:border-slate-800">
                                  {mod.topicSlugs.map((tSlug) => {
                                    const t = TOPIC_BY_SLUG[tSlug];
                                    if (!t) return null;
                                    const activeTopic =
                                      route.view === 'topic' && route.topicSlug === tSlug;
                                    const done = completedTopicSlugs.has(tSlug);
                                    return (
                                      <button
                                        key={tSlug}
                                        type="button"
                                        onClick={() => navigateTopic(tSlug)}
                                        className={`flex w-full items-center justify-between gap-1.5 rounded px-2 py-1 text-left text-[11px] ${
                                          activeTopic
                                            ? 'bg-sky-500/15 font-semibold text-sky-600 dark:text-sky-400'
                                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                        }`}
                                      >
                                        <span className="truncate">{t.title}</span>
                                        {done && (
                                          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setRoute({ view: 'capstone', stage: st.code });
                        setMobileMenuOpen(false);
                      }}
                      className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-2 text-[11px] font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
                    >
                      <Award className="h-3.5 w-3.5" />
                      <span>Stage {st.code} Capstone Exam</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-72 bg-white dark:bg-slate-900">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Application Bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search topics, tools, labs...</span>
              <span className="sm:hidden">Search</span>
              <kbd className="hidden rounded border border-slate-300 px-1.5 py-0.5 font-mono text-[10px] sm:inline dark:border-slate-700">
                Ctrl K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (route.view === 'topic') {
                  const t = TOPIC_BY_SLUG[route.topicSlug];
                  setAssistantContext(t?.title || '');
                } else {
                  setAssistantContext('');
                }
                setAssistantOpen(true);
              }}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              <span className="hidden sm:inline">Study Assistant</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Active Route Viewport */}
        <main className="mx-auto w-full max-w-6xl flex-1 p-5 sm:p-8">
          {route.view === 'dashboard' && (
            <DashboardView
              onSelectTopic={navigateTopic}
              onOpenCapstone={(stage) => setRoute({ view: 'capstone', stage })}
              onOpenOnboarding={() => setRoute({ view: 'onboarding' })}
              onOpenCertificates={() => setRoute({ view: 'certificates' })}
            />
          )}

          {route.view === 'skill-graph' && (
            <SkillGraph
              onSelectTopic={navigateTopic}
              onOpenCapstone={(stage) => setRoute({ view: 'capstone', stage })}
            />
          )}

          {route.view === 'frameworks' && (
            <FrameworkDiagram
              initialSlug={route.slug}
              onSelectModule={(modId) => {
                const modCtx = MODULE_BY_ID[modId];
                const firstTopic = modCtx?.module.topicSlugs[0];
                if (firstTopic) navigateTopic(firstTopic);
              }}
            />
          )}

          {route.view === 'topic' && (
            <TopicView
              topicSlug={route.topicSlug}
              onSelectTopic={navigateTopic}
              onOpenLab={(labSlug) => setRoute({ view: 'labs', labSlug })}
              onOpenCapstone={(stage) => setRoute({ view: 'capstone', stage })}
              onAskAssistant={(topicTitle) => {
                setAssistantContext(topicTitle);
                setAssistantOpen(true);
              }}
            />
          )}

          {route.view === 'capstone' && (
            <CapstoneExamView
              stage={route.stage}
              onUnlockStageBExplore={() => {
                setExpandedStage('B');
                navigateTopic('cti-lifecycle-and-ioc-pyramid');
              }}
            />
          )}

          {route.view === 'tools' && <ToolsView />}

          {route.view === 'labs' && <LabsView initialLabSlug={route.labSlug} />}

          {route.view === 'case-studies' && <CaseStudiesView />}

          {route.view === 'glossary' && <GlossaryView />}

          {route.view === 'careers' && <CareersView onSelectTopic={navigateTopic} />}

          {route.view === 'certificates' && (
            <CertificateView onOpenCapstone={(stage) => setRoute({ view: 'capstone', stage })} />
          )}

          {route.view === 'admin' && <AdminView />}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={handleSearchResult}
      />
      <StudyAssistantDrawer
        open={assistantOpen}
        topicContextTitle={assistantContext}
        onClose={() => setAssistantOpen(false)}
      />
      <WorkspaceConfirmModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AcademyProvider>
        <AcademyShell />
      </AcademyProvider>
    </ErrorBoundary>
  );
}
