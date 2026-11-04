import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  CareerGoal,
  LabProgressRecord,
  OsintTool,
  SkillLevel,
  SpacedCardRecord,
  StageCode,
  StudyNoteRecord,
  TopicProgressRecord,
  UserProfileData,
} from '../lib/types.ts';
import {
  createFirestoreCustomTool,
  deleteFirestoreStudyNote,
  ensureFirestoreUserProfile,
  getWorkspaceAccessToken,
  issueFirestoreCertificate,
  loadFirestoreCustomTools,
  loadFirestoreLearnerCollections,
  saveFirestoreLabProgress,
  saveFirestoreSpacedCard,
  saveFirestoreStudyNote,
  saveFirestoreTopicProgress,
  signInWithGooglePopup,
  signOutFirebase,
  subscribeFirebaseAuth,
  updateFirestoreUserOnboarding,
} from '../lib/firebase.ts';
import { TOOLS } from '../lib/content-loader.ts';
import { computeNextSpacedCardState } from '../lib/roadmap.ts';
import { generateVerificationCode } from '../lib/certificate.ts';

export interface WorkspaceExportRequest {
  kind: 'doc' | 'sheet';
  title: string;
  summary: string;
  docContent?: string;
  sheetRows?: string[][];
}

export interface WorkspaceExportResult {
  kind: 'doc' | 'sheet';
  title: string;
  url: string;
}

interface AcademyContextValue {
  isAuthReady: boolean;
  profile: UserProfileData | null;
  topics: Record<string, TopicProgressRecord>;
  labs: Record<string, LabProgressRecord>;
  notes: StudyNoteRecord[];
  spacedCards: SpacedCardRecord[];
  allTools: OsintTool[];
  customTools: OsintTool[];
  completedTopicSlugs: Set<string>;
  completedLabSlugs: Set<string>;
  hasWorkspaceToken: boolean;
  demoSessionToken: string | null;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  signInGoogle: () => Promise<void>;
  loginDemo: (email: string, password: string) => Promise<void>;
  registerDemo: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  saveOnboarding: (data: {
    displayName: string;
    careerGoal: CareerGoal;
    skillLevel: SkillLevel;
  }) => Promise<void>;
  completeTopicQuiz: (
    topicSlug: string,
    stage: StageCode,
    quizScore: number,
    quizTotal: number,
    minutesAdded: number
  ) => Promise<void>;
  completeLab: (labSlug: string, score: number, minutesAdded: number) => Promise<void>;
  saveNote: (
    targetSlug: string,
    title: string,
    content: string,
    existingId?: string
  ) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  recordSpacedAttempt: (params: {
    cardId: string;
    topicSlug: string;
    prompt: string;
    answer: string;
    wasCorrectWithoutHint: boolean;
  }) => Promise<void>;
  issueStageCertificate: (stage: StageCode, score: number) => Promise<string>;
  addCustomTool: (tool: Omit<OsintTool, 'id' | 'isCustom'>) => Promise<void>;
  pendingWorkspaceExport: WorkspaceExportRequest | null;
  workspaceExportResult: WorkspaceExportResult | null;
  workspaceExportLoading: boolean;
  workspaceExportError: string | null;
  requestWorkspaceExport: (req: WorkspaceExportRequest) => void;
  cancelWorkspaceExport: () => void;
  confirmWorkspaceExport: () => Promise<void>;
}

const AcademyContext = createContext<AcademyContextValue | null>(null);

export function AcademyProvider({ children }: { children: React.ReactNode }) {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [topics, setTopics] = useState<Record<string, TopicProgressRecord>>({});
  const [labs, setLabs] = useState<Record<string, LabProgressRecord>>({});
  const [notes, setNotes] = useState<StudyNoteRecord[]>([]);
  const [spacedCards, setSpacedCards] = useState<SpacedCardRecord[]>([]);
  const [customTools, setCustomTools] = useState<OsintTool[]>([]);
  const [hasWorkspaceToken, setHasWorkspaceToken] = useState(false);
  const [demoSessionToken, setDemoSessionToken] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [pendingWorkspaceExport, setPendingWorkspaceExport] =
    useState<WorkspaceExportRequest | null>(null);
  const [workspaceExportResult, setWorkspaceExportResult] =
    useState<WorkspaceExportResult | null>(null);
  const [workspaceExportLoading, setWorkspaceExportLoading] = useState(false);
  const [workspaceExportError, setWorkspaceExportError] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const syncDemoBackend = useCallback(
    async (
      token: string | null,
      payload: {
        profile?: UserProfileData;
        topics?: Record<string, TopicProgressRecord>;
        labs?: Record<string, LabProgressRecord>;
        notes?: StudyNoteRecord[];
        spacedCards?: SpacedCardRecord[];
      }
    ) => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['x-demo-session'] = token;
      await fetch('/api/demo/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    },
    []
  );

  // Check Firebase Auth & fallback Demo Cookie Session on startup
  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeFirebaseAuth(async (firebaseUser, tokenPresent) => {
      if (!active) return;
      setHasWorkspaceToken(tokenPresent);

      if (firebaseUser) {
        try {
          const userProf = await ensureFirestoreUserProfile(firebaseUser);
          const collections = await loadFirestoreLearnerCollections(firebaseUser.uid);
          const extraTools = await loadFirestoreCustomTools();
          if (!active) return;
          setDemoSessionToken(null);
          setProfile(userProf);
          setTopics(collections.topics);
          setLabs(collections.labs);
          setNotes(collections.notes);
          setSpacedCards(collections.spacedCards);
          setCustomTools(extraTools);
        } catch (err) {
          console.error('Error hydrating Firestore profile:', err);
        } finally {
          if (active) setIsAuthReady(true);
        }
      } else {
        // Check if an existing self-hosted demo cookie session exists
        try {
          const res = await fetch('/api/auth/me');
          const data = await res.json();
          if (active && data?.authenticated && data?.profile) {
            setProfile(data.profile);
            setTopics(data.topics || {});
            setLabs(data.labs || {});
            setNotes(data.notes || []);
            setSpacedCards(data.spacedCards || []);
            setCustomTools(data.customTools || []);
          }
        } catch {
          // Ignore network probe failure on boot
        } finally {
          if (active) setIsAuthReady(true);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signInGoogle = useCallback(async () => {
    const { user, accessToken } = await signInWithGooglePopup();
    setHasWorkspaceToken(Boolean(accessToken));
    const userProf = await ensureFirestoreUserProfile(user);
    const collections = await loadFirestoreLearnerCollections(user.uid);
    const extraTools = await loadFirestoreCustomTools();
    setDemoSessionToken(null);
    setProfile(userProf);
    setTopics(collections.topics);
    setLabs(collections.labs);
    setNotes(collections.notes);
    setSpacedCards(collections.spacedCards);
    setCustomTools(extraTools);
  }, []);

  const loginDemo = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || 'Demo sign-in failed.');
    }
    setDemoSessionToken(data.sessionToken || null);
    setProfile(data.profile);
    setTopics(data.topics || {});
    setLabs(data.labs || {});
    setNotes(data.notes || []);
    setSpacedCards(data.spacedCards || []);
  }, []);

  const registerDemo = useCallback(
    async (email: string, password: string, displayName: string) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Registration failed.');
      }
      setDemoSessionToken(data.sessionToken || null);
      setProfile(data.profile);
      setTopics(data.topics || {});
      setLabs(data.labs || {});
      setNotes(data.notes || []);
      setSpacedCards(data.spacedCards || []);
    },
    []
  );

  const logout = useCallback(async () => {
    if (profile?.authMode === 'firebase') {
      await signOutFirebase();
    } else {
      await fetch('/api/auth/logout', { method: 'POST' });
    }
    setDemoSessionToken(null);
    setHasWorkspaceToken(false);
    setProfile(null);
    setTopics({});
    setLabs({});
    setNotes([]);
    setSpacedCards([]);
  }, [profile]);

  const saveOnboarding = useCallback(
    async (data: { displayName: string; careerGoal: CareerGoal; skillLevel: SkillLevel }) => {
      if (!profile) return;
      const todayIso = new Date().toISOString().slice(0, 10);
      const updatedProfile: UserProfileData = {
        ...profile,
        displayName: data.displayName.trim().slice(0, 100) || profile.displayName,
        careerGoal: data.careerGoal,
        skillLevel: data.skillLevel,
        onboarded: true,
        lastActiveDate: todayIso,
      };
      setProfile(updatedProfile);

      if (profile.authMode === 'firebase') {
        await updateFirestoreUserOnboarding(profile.uid, {
          displayName: updatedProfile.displayName,
          careerGoal: updatedProfile.careerGoal,
          skillLevel: updatedProfile.skillLevel,
          onboarded: true,
          streakDays: updatedProfile.streakDays,
          minutesStudied: updatedProfile.minutesStudied,
          lastActiveDate: todayIso,
        });
      } else {
        await syncDemoBackend(demoSessionToken, { profile: updatedProfile });
      }
    },
    [profile, demoSessionToken, syncDemoBackend]
  );

  const completeTopicQuiz = useCallback(
    async (
      topicSlug: string,
      stage: StageCode,
      quizScore: number,
      quizTotal: number,
      minutesAdded: number
    ) => {
      if (!profile) return;
      const todayIso = new Date().toISOString().slice(0, 10);
      const prevRecord = topics[topicSlug];
      const bestScore = Math.max(prevRecord?.quizScore || 0, quizScore);
      const completed = Boolean(prevRecord?.completed) || bestScore >= Math.ceil(quizTotal * 0.6);

      const newRecord: TopicProgressRecord = {
        uid: profile.uid,
        topicSlug,
        stage,
        completed,
        quizScore: bestScore,
        quizTotal,
      };

      const nextTopics = { ...topics, [topicSlug]: newRecord };
      const nextMinutes = profile.minutesStudied + (prevRecord?.completed ? 2 : minutesAdded);
      const nextStreak =
        profile.lastActiveDate !== todayIso ? profile.streakDays + 1 : profile.streakDays;

      const nextProfile: UserProfileData = {
        ...profile,
        minutesStudied: nextMinutes,
        streakDays: nextStreak,
        lastActiveDate: todayIso,
      };

      setTopics(nextTopics);
      setProfile(nextProfile);

      if (profile.authMode === 'firebase') {
        await saveFirestoreTopicProgress(newRecord);
        await updateFirestoreUserOnboarding(profile.uid, {
          displayName: nextProfile.displayName,
          careerGoal: nextProfile.careerGoal,
          skillLevel: nextProfile.skillLevel,
          onboarded: nextProfile.onboarded,
          streakDays: nextProfile.streakDays,
          minutesStudied: nextProfile.minutesStudied,
          lastActiveDate: todayIso,
        });
      } else {
        await syncDemoBackend(demoSessionToken, {
          profile: nextProfile,
          topics: nextTopics,
        });
      }
    },
    [profile, topics, demoSessionToken, syncDemoBackend]
  );

  const completeLab = useCallback(
    async (labSlug: string, score: number, minutesAdded: number) => {
      if (!profile) return;
      const todayIso = new Date().toISOString().slice(0, 10);
      const prev = labs[labSlug];
      const best = Math.max(prev?.score || 0, score);
      const newRecord: LabProgressRecord = {
        uid: profile.uid,
        labSlug,
        completed: true,
        score: best,
      };
      const nextLabs = { ...labs, [labSlug]: newRecord };
      const nextProfile: UserProfileData = {
        ...profile,
        minutesStudied: profile.minutesStudied + (prev?.completed ? 3 : minutesAdded),
        lastActiveDate: todayIso,
      };
      setLabs(nextLabs);
      setProfile(nextProfile);

      if (profile.authMode === 'firebase') {
        await saveFirestoreLabProgress(newRecord);
        await updateFirestoreUserOnboarding(profile.uid, {
          displayName: nextProfile.displayName,
          careerGoal: nextProfile.careerGoal,
          skillLevel: nextProfile.skillLevel,
          onboarded: nextProfile.onboarded,
          streakDays: nextProfile.streakDays,
          minutesStudied: nextProfile.minutesStudied,
          lastActiveDate: todayIso,
        });
      } else {
        await syncDemoBackend(demoSessionToken, {
          profile: nextProfile,
          labs: nextLabs,
        });
      }
    },
    [profile, labs, demoSessionToken, syncDemoBackend]
  );

  const saveNote = useCallback(
    async (targetSlug: string, title: string, content: string, existingId?: string) => {
      if (!profile) return;
      const noteId = existingId || `note-${Date.now()}`;
      const record: StudyNoteRecord = {
        id: noteId,
        uid: profile.uid,
        targetSlug,
        title: title.trim() || 'Investigation Note',
        content: content.trim(),
        updatedAtIso: new Date().toISOString(),
      };
      const nextNotes = existingId
        ? notes.map((n) => (n.id === existingId ? record : n))
        : [record, ...notes];
      setNotes(nextNotes);

      if (profile.authMode === 'firebase') {
        await saveFirestoreStudyNote(profile.uid, noteId, targetSlug, record.title, record.content);
      } else {
        await syncDemoBackend(demoSessionToken, { notes: nextNotes });
      }
    },
    [profile, notes, demoSessionToken, syncDemoBackend]
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      if (!profile) return;
      const nextNotes = notes.filter((n) => n.id !== noteId);
      setNotes(nextNotes);
      if (profile.authMode === 'firebase') {
        await deleteFirestoreStudyNote(profile.uid, noteId);
      } else {
        await syncDemoBackend(demoSessionToken, { notes: nextNotes });
      }
    },
    [profile, notes, demoSessionToken, syncDemoBackend]
  );

  const recordSpacedAttempt = useCallback(
    async (params: {
      cardId: string;
      topicSlug: string;
      prompt: string;
      answer: string;
      wasCorrectWithoutHint: boolean;
    }) => {
      if (!profile) return;
      const existing = spacedCards.find((c) => c.cardId === params.cardId) || null;
      // Only create a brand-new spaced card if the learner got it wrong/used a hint, OR if it's already in their deck
      if (!existing && params.wasCorrectWithoutHint) return;

      const schedule = computeNextSpacedCardState(existing, params.wasCorrectWithoutHint);
      const updatedCard: SpacedCardRecord = {
        cardId: params.cardId,
        uid: profile.uid,
        topicSlug: params.topicSlug,
        prompt: params.prompt,
        answer: params.answer,
        intervalDays: schedule.intervalDays,
        streak: schedule.streak,
        nextReviewEpochMs: schedule.nextReviewEpochMs,
      };

      const nextCards = existing
        ? spacedCards.map((c) => (c.cardId === params.cardId ? updatedCard : c))
        : [...spacedCards, updatedCard];
      setSpacedCards(nextCards);

      if (profile.authMode === 'firebase') {
        await saveFirestoreSpacedCard(updatedCard);
      } else {
        await syncDemoBackend(demoSessionToken, { spacedCards: nextCards });
      }
    },
    [profile, spacedCards, demoSessionToken, syncDemoBackend]
  );

  const issueStageCertificate = useCallback(
    async (stage: StageCode, score: number): Promise<string> => {
      if (!profile) return '';
      const existingId = stage === 'A' ? profile.stageACertId : profile.stageBCertId;
      const certId = existingId || generateVerificationCode(profile.uid, stage, score);

      const nextProfile: UserProfileData =
        stage === 'A'
          ? {
              ...profile,
              stageACertified: true,
              stageACertId: certId,
              stageAScore: Math.max(profile.stageAScore, score),
            }
          : {
              ...profile,
              stageBCertified: true,
              stageBCertId: certId,
              stageBScore: Math.max(profile.stageBScore, score),
            };

      setProfile(nextProfile);

      if (profile.authMode === 'firebase') {
        await issueFirestoreCertificate(profile.uid, stage, certId, score);
      } else {
        await syncDemoBackend(demoSessionToken, { profile: nextProfile });
      }
      return certId;
    },
    [profile, demoSessionToken, syncDemoBackend]
  );

  const addCustomTool = useCallback(
    async (tool: Omit<OsintTool, 'id' | 'isCustom'>) => {
      if (!profile || profile.role !== 'admin') {
        throw new Error('Admin privileges required.');
      }
      if (profile.authMode === 'firebase') {
        await createFirestoreCustomTool(profile.uid, tool);
        const refreshed = await loadFirestoreCustomTools();
        setCustomTools(refreshed);
      } else {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (demoSessionToken) headers['x-demo-session'] = demoSessionToken;
        const res = await fetch('/api/admin/custom-tool', {
          method: 'POST',
          headers,
          body: JSON.stringify(tool),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to add custom tool.');
        setCustomTools((prev) => [...prev, data.tool]);
      }
    },
    [profile, demoSessionToken]
  );

  const requestWorkspaceExport = useCallback((req: WorkspaceExportRequest) => {
    setWorkspaceExportError(null);
    setWorkspaceExportResult(null);
    setPendingWorkspaceExport(req);
  }, []);

  const cancelWorkspaceExport = useCallback(() => {
    setPendingWorkspaceExport(null);
    setWorkspaceExportError(null);
    setWorkspaceExportResult(null);
    setWorkspaceExportLoading(false);
  }, []);

  const confirmWorkspaceExport = useCallback(async () => {
    if (!pendingWorkspaceExport) return;
    setWorkspaceExportLoading(true);
    setWorkspaceExportError(null);

    try {
      let token = getWorkspaceAccessToken();
      if (!token) {
        const popupResult = await signInWithGooglePopup();
        token = popupResult.accessToken;
        setHasWorkspaceToken(Boolean(token));
      }

      if (!token) {
        throw new Error(
          'Google Workspace OAuth access token was not granted. Please sign in with Google and approve Google Docs / Sheets permissions.'
        );
      }

      if (pendingWorkspaceExport.kind === 'doc') {
        const res = await fetch('/api/workspace/export-doc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: pendingWorkspaceExport.title,
            content: pendingWorkspaceExport.docContent || '',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to create Google Doc.');
        setWorkspaceExportResult({
          kind: 'doc',
          title: pendingWorkspaceExport.title,
          url: data.url,
        });
      } else {
        const res = await fetch('/api/workspace/export-sheet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: pendingWorkspaceExport.title,
            rows: pendingWorkspaceExport.sheetRows || [],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to create Google Sheet.');
        setWorkspaceExportResult({
          kind: 'sheet',
          title: pendingWorkspaceExport.title,
          url: data.url,
        });
      }
    } catch (err: any) {
      setWorkspaceExportError(err?.message || 'Workspace export failed.');
    } finally {
      setWorkspaceExportLoading(false);
    }
  }, [pendingWorkspaceExport]);

  const completedTopicSlugs = useMemo(
    () =>
      new Set(
        Object.values(topics)
          .filter((t) => t.completed)
          .map((t) => t.topicSlug)
      ),
    [topics]
  );

  const completedLabSlugs = useMemo(
    () =>
      new Set(
        Object.values(labs)
          .filter((l) => l.completed)
          .map((l) => l.labSlug)
      ),
    [labs]
  );

  const allTools = useMemo(() => [...TOOLS, ...customTools], [customTools]);

  const value: AcademyContextValue = {
    isAuthReady,
    profile,
    topics,
    labs,
    notes,
    spacedCards,
    allTools,
    customTools,
    completedTopicSlugs,
    completedLabSlugs,
    hasWorkspaceToken,
    demoSessionToken,
    theme,
    toggleTheme,
    signInGoogle,
    loginDemo,
    registerDemo,
    logout,
    saveOnboarding,
    completeTopicQuiz,
    completeLab,
    saveNote,
    deleteNote,
    recordSpacedAttempt,
    issueStageCertificate,
    addCustomTool,
    pendingWorkspaceExport,
    workspaceExportResult,
    workspaceExportLoading,
    workspaceExportError,
    requestWorkspaceExport,
    cancelWorkspaceExport,
    confirmWorkspaceExport,
  };

  return <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>;
}

export function useAcademy(): AcademyContextValue {
  const ctx = useContext(AcademyContext);
  if (!ctx) {
    throw new Error('useAcademy must be used inside AcademyProvider');
  }
  return ctx;
}
