import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  serverTimestamp,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  UserProfileData,
  TopicProgressRecord,
  LabProgressRecord,
  StudyNoteRecord,
  SpacedCardRecord,
  OsintTool,
  CareerGoal,
  SkillLevel,
} from './types.ts';

// Workspace OAuth Scopes configured via set_up_oauth
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/spreadsheets',
];

const app = initializeApp(firebaseConfig);
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || 'ai-studio-ihrosintopensour-b130c892-b266-47f4-b125-f8903d37fafa'
);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
for (const scope of WORKSPACE_SCOPES) {
  googleProvider.addScope(scope);
}

// In-memory cache for Google Workspace OAuth access token (NEVER stored in localStorage/sessionStorage)
let isSigningIn = false;
let cachedWorkspaceAccessToken: string | null = null;

export function getWorkspaceAccessToken(): string | null {
  return cachedWorkspaceAccessToken;
}

// Validate connection to Firestore on boot per firebase-integration-rpc skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function subscribeFirebaseAuth(
  onUserChange: (user: User | null, hasWorkspaceToken: boolean) => void
) {
  return onAuthStateChanged(auth, (user) => {
    if (!user && !isSigningIn) {
      cachedWorkspaceAccessToken = null;
    }
    onUserChange(user, Boolean(cachedWorkspaceAccessToken));
  });
}

export async function signInWithGooglePopup(): Promise<{
  user: User;
  accessToken: string | null;
}> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedWorkspaceAccessToken = credential?.accessToken ?? null;
    return { user: result.user, accessToken: cachedWorkspaceAccessToken };
  } finally {
    isSigningIn = false;
  }
}

export async function signOutFirebase(): Promise<void> {
  await auth.signOut();
  cachedWorkspaceAccessToken = null;
}

// Sanitization helpers matching firebase-blueprint.json constraints
function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128) || 'item';
}

export async function ensureFirestoreUserProfile(user: User): Promise<UserProfileData> {
  const uid = sanitizeId(user.uid);
  const userPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  let snap;
  try {
    snap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const isBootstrappedAdmin =
    user.emailVerified && user.email === 'fairytailsmuslim@gmail.com';

  if (!snap.exists()) {
    const initialDoc = {
      uid,
      displayName: (user.displayName || user.email?.split('@')[0] || 'OSINT Student').slice(0, 100),
      careerGoal: 'soc_analyst' as CareerGoal,
      skillLevel: 'beginner' as SkillLevel,
      onboarded: false,
      stageACertified: false,
      stageACertId: '',
      stageAScore: 0,
      stageBCertified: false,
      stageBCertId: '',
      stageBScore: 0,
      streakDays: 1,
      minutesStudied: 5,
      lastActiveDate: todayIso,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(userRef, initialDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }

    if (user.email) {
      const privPath = `users/${uid}/private/info`;
      try {
        await setDoc(doc(db, 'users', uid, 'private', 'info'), {
          uid,
          email: user.email.slice(0, 254),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, privPath);
      }
    }

    return {
      uid,
      email: user.email || undefined,
      role: isBootstrappedAdmin ? 'admin' : 'student',
      authMode: 'firebase',
      displayName: initialDoc.displayName,
      careerGoal: initialDoc.careerGoal,
      skillLevel: initialDoc.skillLevel,
      onboarded: false,
      stageACertified: false,
      stageACertId: '',
      stageAScore: 0,
      stageBCertified: false,
      stageBCertId: '',
      stageBScore: 0,
      streakDays: 1,
      minutesStudied: 5,
      lastActiveDate: todayIso,
    };
  }

  const data = snap.data();
  return {
    uid,
    email: user.email || undefined,
    role: isBootstrappedAdmin ? 'admin' : 'student',
    authMode: 'firebase',
    displayName: data.displayName || 'OSINT Student',
    careerGoal: data.careerGoal || 'soc_analyst',
    skillLevel: data.skillLevel || 'beginner',
    onboarded: Boolean(data.onboarded),
    stageACertified: Boolean(data.stageACertified),
    stageACertId: data.stageACertId || '',
    stageAScore: Number(data.stageAScore || 0),
    stageBCertified: Boolean(data.stageBCertified),
    stageBCertId: data.stageBCertId || '',
    stageBScore: Number(data.stageBScore || 0),
    streakDays: Number(data.streakDays || 1),
    minutesStudied: Number(data.minutesStudied || 0),
    lastActiveDate: data.lastActiveDate || todayIso,
  };
}

export async function updateFirestoreUserOnboarding(
  uid: string,
  updates: {
    displayName: string;
    careerGoal: CareerGoal;
    skillLevel: SkillLevel;
    onboarded: boolean;
    streakDays: number;
    minutesStudied: number;
    lastActiveDate: string;
  }
): Promise<void> {
  const safeUid = sanitizeId(uid);
  const path = `users/${safeUid}`;
  try {
    await updateDoc(doc(db, 'users', safeUid), {
      displayName: updates.displayName.trim().slice(0, 100) || 'OSINT Student',
      careerGoal: updates.careerGoal,
      skillLevel: updates.skillLevel,
      onboarded: updates.onboarded,
      streakDays: Math.max(0, Math.min(10000, Math.round(updates.streakDays))),
      minutesStudied: Math.max(0, Math.min(5000000, Math.round(updates.minutesStudied))),
      lastActiveDate: updates.lastActiveDate.slice(0, 16),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function issueFirestoreCertificate(
  uid: string,
  stage: 'A' | 'B',
  certId: string,
  score: number
): Promise<void> {
  const safeUid = sanitizeId(uid);
  const path = `users/${safeUid}`;
  try {
    if (stage === 'A') {
      await updateDoc(doc(db, 'users', safeUid), {
        stageACertified: true,
        stageACertId: certId.slice(0, 64),
        stageAScore: Math.max(70, Math.min(100, Math.round(score))),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'users', safeUid), {
        stageBCertified: true,
        stageBCertId: certId.slice(0, 64),
        stageBScore: Math.max(70, Math.min(100, Math.round(score))),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function loadFirestoreLearnerCollections(uid: string): Promise<{
  topics: Record<string, TopicProgressRecord>;
  labs: Record<string, LabProgressRecord>;
  notes: StudyNoteRecord[];
  spacedCards: SpacedCardRecord[];
}> {
  const safeUid = sanitizeId(uid);
  const topics: Record<string, TopicProgressRecord> = {};
  const labs: Record<string, LabProgressRecord> = {};
  const notes: StudyNoteRecord[] = [];
  const spacedCards: SpacedCardRecord[] = [];

  try {
    const tSnap = await getDocs(
      query(collection(db, 'users', safeUid, 'topicProgress'), where('uid', '==', safeUid))
    );
    tSnap.forEach((d) => {
      const data = d.data();
      topics[data.topicSlug] = {
        uid: data.uid,
        topicSlug: data.topicSlug,
        stage: data.stage,
        completed: Boolean(data.completed),
        quizScore: Number(data.quizScore || 0),
        quizTotal: Number(data.quizTotal || 5),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${safeUid}/topicProgress`);
  }

  try {
    const lSnap = await getDocs(
      query(collection(db, 'users', safeUid, 'labProgress'), where('uid', '==', safeUid))
    );
    lSnap.forEach((d) => {
      const data = d.data();
      labs[data.labSlug] = {
        uid: data.uid,
        labSlug: data.labSlug,
        completed: Boolean(data.completed),
        score: Number(data.score || 0),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${safeUid}/labProgress`);
  }

  try {
    const nSnap = await getDocs(
      query(collection(db, 'users', safeUid, 'notes'), where('uid', '==', safeUid))
    );
    nSnap.forEach((d) => {
      const data = d.data();
      notes.push({
        id: d.id,
        uid: data.uid,
        targetSlug: data.targetSlug,
        title: data.title,
        content: data.content,
        updatedAtIso: data.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${safeUid}/notes`);
  }

  try {
    const sSnap = await getDocs(
      query(collection(db, 'users', safeUid, 'spacedRepetition'), where('uid', '==', safeUid))
    );
    sSnap.forEach((d) => {
      const data = d.data();
      spacedCards.push({
        cardId: data.cardId,
        uid: data.uid,
        topicSlug: data.topicSlug,
        prompt: data.prompt,
        answer: data.answer,
        intervalDays: Number(data.intervalDays || 0),
        streak: Number(data.streak || 0),
        nextReviewEpochMs: Number(data.nextReviewEpochMs || Date.now()),
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${safeUid}/spacedRepetition`);
  }

  return { topics, labs, notes, spacedCards };
}

export async function saveFirestoreTopicProgress(record: TopicProgressRecord): Promise<void> {
  const safeUid = sanitizeId(record.uid);
  const safeSlug = sanitizeId(record.topicSlug);
  const path = `users/${safeUid}/topicProgress/${safeSlug}`;
  const docRef = doc(db, 'users', safeUid, 'topicProgress', safeSlug);

  let existing;
  try {
    existing = await getDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  const total = Math.max(1, Math.min(100, Math.round(record.quizTotal)));
  const score = Math.max(0, Math.min(total, Math.round(record.quizScore)));

  try {
    if (!existing.exists()) {
      await setDoc(docRef, {
        uid: safeUid,
        topicSlug: safeSlug,
        stage: record.stage,
        completed: Boolean(record.completed),
        quizScore: score,
        quizTotal: total,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        completed: Boolean(record.completed),
        quizScore: score,
        quizTotal: total,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveFirestoreLabProgress(record: LabProgressRecord): Promise<void> {
  const safeUid = sanitizeId(record.uid);
  const safeSlug = sanitizeId(record.labSlug);
  const path = `users/${safeUid}/labProgress/${safeSlug}`;
  const docRef = doc(db, 'users', safeUid, 'labProgress', safeSlug);

  let existing;
  try {
    existing = await getDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  const score = Math.max(0, Math.min(100, Math.round(record.score)));

  try {
    if (!existing.exists()) {
      await setDoc(docRef, {
        uid: safeUid,
        labSlug: safeSlug,
        completed: Boolean(record.completed),
        score,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        completed: Boolean(record.completed),
        score,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveFirestoreStudyNote(
  uid: string,
  noteId: string,
  targetSlug: string,
  title: string,
  content: string
): Promise<void> {
  const safeUid = sanitizeId(uid);
  const safeId = sanitizeId(noteId);
  const safeTarget = sanitizeId(targetSlug);
  const path = `users/${safeUid}/notes/${safeId}`;
  const docRef = doc(db, 'users', safeUid, 'notes', safeId);

  let existing;
  try {
    existing = await getDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  const cleanTitle = title.trim().slice(0, 200) || 'Investigation Note';
  const cleanContent = content.trim().slice(0, 10000) || 'Saved note.';

  try {
    if (!existing.exists()) {
      await setDoc(docRef, {
        uid: safeUid,
        targetSlug: safeTarget,
        title: cleanTitle,
        content: cleanContent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        title: cleanTitle,
        content: cleanContent,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFirestoreStudyNote(uid: string, noteId: string): Promise<void> {
  const safeUid = sanitizeId(uid);
  const safeId = sanitizeId(noteId);
  const path = `users/${safeUid}/notes/${safeId}`;
  try {
    await deleteDoc(doc(db, 'users', safeUid, 'notes', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveFirestoreSpacedCard(card: SpacedCardRecord): Promise<void> {
  const safeUid = sanitizeId(card.uid);
  const safeCardId = sanitizeId(card.cardId);
  const safeTopic = sanitizeId(card.topicSlug);
  const path = `users/${safeUid}/spacedRepetition/${safeCardId}`;
  const docRef = doc(db, 'users', safeUid, 'spacedRepetition', safeCardId);

  let existing;
  try {
    existing = await getDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  try {
    if (!existing.exists()) {
      await setDoc(docRef, {
        uid: safeUid,
        cardId: safeCardId,
        topicSlug: safeTopic,
        prompt: card.prompt.slice(0, 500),
        answer: card.answer.slice(0, 200),
        intervalDays: Math.max(0, Math.min(3650, Math.round(card.intervalDays))),
        streak: Math.max(0, Math.min(1000, Math.round(card.streak))),
        nextReviewEpochMs: Math.max(0, Math.round(card.nextReviewEpochMs)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        prompt: card.prompt.slice(0, 500),
        answer: card.answer.slice(0, 200),
        intervalDays: Math.max(0, Math.min(3650, Math.round(card.intervalDays))),
        streak: Math.max(0, Math.min(1000, Math.round(card.streak))),
        nextReviewEpochMs: Math.max(0, Math.round(card.nextReviewEpochMs)),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadFirestoreCustomTools(): Promise<OsintTool[]> {
  if (!auth.currentUser?.emailVerified) return [];
  const path = 'customTools';
  try {
    const snap = await getDocs(
      query(collection(db, 'customTools'), where('stage', 'in', ['A', 'B']))
    );
    const items: OsintTool[] = [];
    snap.forEach((d) => {
      const data = d.data();
      items.push({
        id: d.id,
        name: data.name,
        url: data.url,
        category: data.category,
        pricing: data.pricing,
        platform: data.platform,
        stage: data.stage,
        description: data.description,
        ethicalNote: data.ethicalNote,
        isCustom: true,
      });
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createFirestoreCustomTool(
  authorUid: string,
  tool: Omit<OsintTool, 'id' | 'isCustom'>
): Promise<void> {
  const safeUid = sanitizeId(authorUid);
  const toolId = sanitizeId(`custom-${Date.now()}`);
  const path = `customTools/${toolId}`;
  try {
    await setDoc(doc(db, 'customTools', toolId), {
      authorUid: safeUid,
      name: tool.name.trim().slice(0, 100),
      url: tool.url.trim().slice(0, 300),
      category: tool.category,
      pricing: tool.pricing,
      platform: tool.platform.trim().slice(0, 80),
      stage: tool.stage,
      description: tool.description.trim().slice(0, 600),
      ethicalNote: tool.ethicalNote.trim().slice(0, 399),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
