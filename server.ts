import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

import {
  ALL_TOPICS,
  TOOLS,
  FRAMEWORKS,
  LABS,
  CASE_STUDIES,
  GLOSSARY,
  ALL_MODULES,
} from './src/lib/content-loader.ts';
import {
  UserProfileData,
  TopicProgressRecord,
  LabProgressRecord,
  StudyNoteRecord,
  SpacedCardRecord,
  OsintTool,
} from './src/lib/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSION_SECRET = process.env.SESSION_SECRET || 'ihr-osint-local-selfhosted-secret-2026';

// Password hashing using Node built-in scrypt (zero native binary compilation issues in Docker/Cloud Run)
function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): string {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

interface DemoAccountRecord {
  uid: string;
  email: string;
  passwordHash: string;
  profile: UserProfileData;
  topics: Record<string, TopicProgressRecord>;
  labs: Record<string, LabProgressRecord>;
  notes: StudyNoteRecord[];
  spacedCards: SpacedCardRecord[];
}

const demoAccounts = new Map<string, DemoAccountRecord>();
const demoCustomTools: OsintTool[] = [];

function seedDemoUsers() {
  const today = new Date().toISOString().slice(0, 10);

  const studentUid = 'demo-student-01';
  demoAccounts.set('student@ihr-osint.local', {
    uid: studentUid,
    email: 'student@ihr-osint.local',
    passwordHash: hashPassword('Student@12345'),
    profile: {
      uid: studentUid,
      email: 'student@ihr-osint.local',
      role: 'student',
      authMode: 'demo',
      displayName: 'Amina Tariq (Demo Student)',
      careerGoal: 'soc_analyst',
      skillLevel: 'beginner',
      onboarded: true,
      stageACertified: false,
      stageACertId: '',
      stageAScore: 0,
      stageBCertified: false,
      stageBCertId: '',
      stageBScore: 0,
      streakDays: 4,
      minutesStudied: 95,
      lastActiveDate: today,
    },
    topics: {
      'osint-disciplines-overview': {
        uid: studentUid,
        topicSlug: 'osint-disciplines-overview',
        stage: 'A',
        completed: true,
        quizScore: 5,
        quizTotal: 5,
      },
      'intelligence-cycle-basics': {
        uid: studentUid,
        topicSlug: 'intelligence-cycle-basics',
        stage: 'A',
        completed: true,
        quizScore: 5,
        quizTotal: 5,
      },
      'passive-active-boundary': {
        uid: studentUid,
        topicSlug: 'passive-active-boundary',
        stage: 'A',
        completed: true,
        quizScore: 4,
        quizTotal: 5,
      },
      'authorization-and-roe': {
        uid: studentUid,
        topicSlug: 'authorization-and-roe',
        stage: 'A',
        completed: true,
        quizScore: 5,
        quizTotal: 5,
      },
    },
    labs: {
      'lab-01-osint-cycle-mapping': {
        uid: studentUid,
        labSlug: 'lab-01-osint-cycle-mapping',
        completed: true,
        score: 100,
      },
    },
    notes: [
      {
        id: 'note-seed-1',
        uid: studentUid,
        targetSlug: 'passive-active-boundary',
        title: 'Zero-Touch Passive Rule Summary',
        content:
          'Stage A rule: Query public intermediaries (crt.sh, ICANN RDAP, Wayback CDX, Shodan search DB) so 0 packets touch target infrastructure. Triggering "Save Page Now" or clicking unarchived target links sends HTTP traffic.',
        updatedAtIso: new Date().toISOString(),
      },
    ],
    spacedCards: [
      {
        cardId: 'sr-t03-4',
        uid: studentUid,
        topicSlug: 'passive-active-boundary',
        prompt:
          "When you click 'Save Page Now' on an archive service, does the archive server send an HTTP request to the live target? (Answer yes or no)",
        answer: 'yes',
        intervalDays: 0,
        streak: 0,
        nextReviewEpochMs: Date.now() - 60_000,
      },
      {
        cardId: 'sr-t13-1',
        uid: studentUid,
        topicSlug: 'magic-bytes-and-file-hashes',
        prompt: 'What four-character hex magic signature identifies the start of a JPEG image?',
        answer: 'FFD8',
        intervalDays: 1,
        streak: 1,
        nextReviewEpochMs: Date.now() - 30_000,
      },
    ],
  });

  const adminUid = 'demo-admin-01';
  demoAccounts.set('admin@ihr-osint.local', {
    uid: adminUid,
    email: 'admin@ihr-osint.local',
    passwordHash: hashPassword('Admin@12345'),
    profile: {
      uid: adminUid,
      email: 'admin@ihr-osint.local',
      role: 'admin',
      authMode: 'demo',
      displayName: 'IHR OSINT Lead Instructor',
      careerGoal: 'threat_intel',
      skillLevel: 'pro',
      onboarded: true,
      stageACertified: true,
      stageACertId: 'IHR-STGA-2026-DEMOADM-8842',
      stageAScore: 96,
      stageBCertified: true,
      stageBCertId: 'IHR-STGB-2026-DEMOADM-9914',
      stageBScore: 94,
      streakDays: 21,
      minutesStudied: 840,
      lastActiveDate: today,
    },
    topics: Object.fromEntries(
      ALL_TOPICS.slice(0, 42).map((t) => [
        t.slug,
        {
          uid: adminUid,
          topicSlug: t.slug,
          stage: t.stage,
          completed: true,
          quizScore: 5,
          quizTotal: 5,
        },
      ])
    ),
    labs: Object.fromEntries(
      LABS.slice(0, 20).map((l) => [
        l.slug,
        {
          uid: adminUid,
          labSlug: l.slug,
          completed: true,
          score: 100,
        },
      ])
    ),
    notes: [
      {
        id: 'note-admin-1',
        uid: adminUid,
        targetSlug: 'admiralty-code-and-bluf-reporting',
        title: 'Curriculum QA & Instructor Note',
        content:
          'All Stage A labs verified zero-touch passive against RFC 2606 / RFC 5737 / public registries. Stage B gate tested and active.',
        updatedAtIso: new Date().toISOString(),
      },
    ],
    spacedCards: [],
  });
}

seedDemoUsers();

function signSessionToken(email: string): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token?: string | null): string | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (sig !== expected) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!parsed.email || Date.now() > Number(parsed.exp)) return null;
    return String(parsed.email).toLowerCase();
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = decodeURIComponent(part.slice(idx + 1).trim());
      out[k] = v;
    }
  }
  return out;
}

function getDemoEmailFromReq(req: Request): string | null {
  const headerToken = req.headers['x-demo-session'];
  if (typeof headerToken === 'string') {
    const e = verifySessionToken(headerToken);
    if (e) return e;
  }
  const cookies = parseCookies(req.headers.cookie);
  return verifySessionToken(cookies['ihr_session']);
}

function setSessionCookie(res: Response, token: string) {
  const isProdHttps = process.env.APP_URL?.startsWith('https://') || process.env.NODE_ENV === 'production';
  const attrs = isProdHttps
    ? 'Path=/; HttpOnly; SameSite=None; Secure; Max-Age=604800'
    : 'Path=/; HttpOnly; SameSite=Lax; Max-Age=604800';
  res.setHeader('Set-Cookie', `ihr_session=${encodeURIComponent(token)}; ${attrs}`);
}

function retrieveCurriculumRagSnippets(queryText: string): string {
  const terms = queryText
    .toLowerCase()
    .split(/[^a-z0-9.+-]+/)
    .filter((w) => w.length >= 2);

  if (terms.length === 0) return '';

  const scored: { score: number; block: string }[] = [];

  for (const t of ALL_TOPICS) {
    const hay = `${t.title} ${t.concept} ${t.framework} ${t.legalNotes}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (t.title.toLowerCase().includes(term)) score += 4;
      if (hay.includes(term)) score += 2;
    }
    if (score > 0) {
      scored.push({
        score,
        block: `[Topic Stage ${t.stage}: ${t.title}] ${t.concept} | Legal: ${t.legalNotes}`,
      });
    }
  }

  for (const tool of TOOLS) {
    const hay = `${tool.name} ${tool.category} ${tool.description} ${tool.ethicalNote}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (tool.name.toLowerCase().includes(term)) score += 5;
      if (hay.includes(term)) score += 2;
    }
    if (score > 0) {
      scored.push({
        score,
        block: `[Tool: ${tool.name} (${tool.url})] ${tool.description} | Ethics: ${tool.ethicalNote}`,
      });
    }
  }

  for (const g of GLOSSARY) {
    const hay = `${g.term} ${g.definition}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (g.term.toLowerCase().includes(term)) score += 4;
      if (hay.includes(term)) score += 1;
    }
    if (score > 0) {
      scored.push({
        score,
        block: `[Glossary: ${g.term}] ${g.definition}`,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored
    .slice(0, 6)
    .map((s) => s.block)
    .join('\n\n');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // 1. Self-Hosted Demo Auth Endpoints
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    const account = demoAccounts.get(email);
    if (!account || !verifyPassword(password, account.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const sessionToken = signSessionToken(email);
    setSessionCookie(res, sessionToken);
    res.json({
      sessionToken,
      profile: account.profile,
      topics: account.topics,
      labs: account.labs,
      notes: account.notes,
      spacedCards: account.spacedCards,
    });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const displayName = String(req.body?.displayName || '').trim().slice(0, 80) || 'OSINT Learner';

    if (!email.includes('@') || password.length < 8) {
      res.status(400).json({ error: 'Provide a valid email and a password of at least 8 characters.' });
      return;
    }
    if (demoAccounts.has(email)) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const uid = `local-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);
    const record: DemoAccountRecord = {
      uid,
      email,
      passwordHash: hashPassword(password),
      profile: {
        uid,
        email,
        role: 'student',
        authMode: 'demo',
        displayName,
        careerGoal: 'soc_analyst',
        skillLevel: 'beginner',
        onboarded: false,
        stageACertified: false,
        stageACertId: '',
        stageAScore: 0,
        stageBCertified: false,
        stageBCertId: '',
        stageBScore: 0,
        streakDays: 1,
        minutesStudied: 5,
        lastActiveDate: today,
      },
      topics: {},
      labs: {},
      notes: [],
      spacedCards: [],
    };
    demoAccounts.set(email, record);

    const sessionToken = signSessionToken(email);
    setSessionCookie(res, sessionToken);
    res.json({
      sessionToken,
      profile: record.profile,
      topics: record.topics,
      labs: record.labs,
      notes: record.notes,
      spacedCards: record.spacedCards,
    });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const email = getDemoEmailFromReq(req);
    if (!email) {
      res.json({ authenticated: false });
      return;
    }
    const account = demoAccounts.get(email);
    if (!account) {
      res.json({ authenticated: false });
      return;
    }
    res.json({
      authenticated: true,
      profile: account.profile,
      topics: account.topics,
      labs: account.labs,
      notes: account.notes,
      spacedCards: account.spacedCards,
      customTools: demoCustomTools,
    });
  });

  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    res.setHeader('Set-Cookie', 'ihr_session=; Path=/; HttpOnly; Max-Age=0');
    res.json({ ok: true });
  });

  // Sync self-hosted demo state
  app.post('/api/demo/sync', (req: Request, res: Response) => {
    const email = getDemoEmailFromReq(req);
    if (!email) {
      res.status(401).json({ error: 'Not signed in.' });
      return;
    }
    const account = demoAccounts.get(email);
    if (!account) {
      res.status(404).json({ error: 'Account not found.' });
      return;
    }

    if (req.body?.profile) {
      const p = req.body.profile;
      account.profile = {
        ...account.profile,
        displayName: String(p.displayName || account.profile.displayName).slice(0, 100),
        careerGoal: p.careerGoal || account.profile.careerGoal,
        skillLevel: p.skillLevel || account.profile.skillLevel,
        onboarded: Boolean(p.onboarded),
        stageACertified: account.profile.stageACertified || Boolean(p.stageACertified),
        stageACertId: p.stageACertId || account.profile.stageACertId,
        stageAScore: Math.max(account.profile.stageAScore, Number(p.stageAScore || 0)),
        stageBCertified: account.profile.stageBCertified || Boolean(p.stageBCertified),
        stageBCertId: p.stageBCertId || account.profile.stageBCertId,
        stageBScore: Math.max(account.profile.stageBScore, Number(p.stageBScore || 0)),
        streakDays: Number(p.streakDays || account.profile.streakDays),
        minutesStudied: Number(p.minutesStudied || account.profile.minutesStudied),
        lastActiveDate: String(p.lastActiveDate || account.profile.lastActiveDate),
      };
    }
    if (req.body?.topics) account.topics = req.body.topics;
    if (req.body?.labs) account.labs = req.body.labs;
    if (req.body?.notes) account.notes = req.body.notes;
    if (req.body?.spacedCards) account.spacedCards = req.body.spacedCards;

    res.json({ ok: true, profile: account.profile });
  });

  app.post('/api/admin/custom-tool', (req: Request, res: Response) => {
    const email = getDemoEmailFromReq(req);
    const account = email ? demoAccounts.get(email) : null;
    if (!account || account.profile.role !== 'admin') {
      res.status(403).json({ error: 'Admin privileges required.' });
      return;
    }
    const t = req.body;
    if (!t?.name || !t?.url?.startsWith('https://')) {
      res.status(400).json({ error: 'Valid name and official https:// URL required.' });
      return;
    }
    const created: OsintTool = {
      id: `demo-tool-${Date.now()}`,
      name: String(t.name).slice(0, 100),
      url: String(t.url).slice(0, 300),
      category: t.category || 'Search',
      pricing: t.pricing || 'Free',
      platform: String(t.platform || 'Web').slice(0, 80),
      stage: t.stage === 'B' ? 'B' : 'A',
      description: String(t.description || '').slice(0, 600),
      ethicalNote: String(t.ethicalNote || 'Passive & authorized use only.').slice(0, 399),
      isCustom: true,
    };
    demoCustomTools.push(created);
    res.json({ tool: created });
  });

  app.get('/api/admin/overview', (_req: Request, res: Response) => {
    const usersSummary = Array.from(demoAccounts.values()).map((a) => ({
      email: a.email,
      displayName: a.profile.displayName,
      role: a.profile.role,
      careerGoal: a.profile.careerGoal,
      completedTopics: Object.values(a.topics).filter((t) => t.completed).length,
      completedLabs: Object.values(a.labs).filter((l) => l.completed).length,
      stageACertified: a.profile.stageACertified,
      stageBCertified: a.profile.stageBCertified,
    }));

    res.json({
      counts: {
        stages: 2,
        phases: 8,
        modules: ALL_MODULES.length,
        topics: ALL_TOPICS.length,
        tools: TOOLS.length + demoCustomTools.length,
        labs: LABS.length,
        frameworks: FRAMEWORKS.length,
        caseStudies: CASE_STUDIES.length,
        glossaryTerms: GLOSSARY.length,
      },
      demoUsers: usersSummary,
      customTools: demoCustomTools,
    });
  });

  // 2. Full-Text Search Endpoint across Topics, Tools, Frameworks, Labs, Case Studies & Glossary
  app.get('/api/search', (req: Request, res: Response) => {
    const q = String(req.query.q || '').trim().toLowerCase();
    if (!q) {
      res.json({ results: [] });
      return;
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    const results: {
      type: 'Topic' | 'Tool' | 'Framework' | 'Lab' | 'Case Study' | 'Glossary';
      title: string;
      subtitle: string;
      stage?: string;
      slug: string;
      url?: string;
      score: number;
    }[] = [];

    const scoreText = (title: string, body: string) => {
      const tl = title.toLowerCase();
      const bl = body.toLowerCase();
      let s = 0;
      if (tl === q) s += 30;
      else if (tl.includes(q)) s += 15;
      if (bl.includes(q)) s += 6;
      for (const tok of tokens) {
        if (tl.includes(tok)) s += 5;
        if (bl.includes(tok)) s += 2;
      }
      return s;
    };

    for (const topic of ALL_TOPICS) {
      const s = scoreText(topic.title, `${topic.concept} ${topic.tools.join(' ')}`);
      if (s > 0) {
        results.push({
          type: 'Topic',
          title: topic.title,
          subtitle: topic.concept.slice(0, 140) + '...',
          stage: topic.stage,
          slug: topic.slug,
          score: s,
        });
      }
    }

    for (const tool of [...TOOLS, ...demoCustomTools]) {
      const s = scoreText(tool.name, `${tool.category} ${tool.description}`);
      if (s > 0) {
        results.push({
          type: 'Tool',
          title: tool.name,
          subtitle: `${tool.category} · ${tool.description}`,
          stage: tool.stage,
          slug: tool.id,
          url: tool.url,
          score: s,
        });
      }
    }

    for (const fw of FRAMEWORKS) {
      const s = scoreText(fw.name, `${fw.tagline} ${fw.overview}`);
      if (s > 0) {
        results.push({
          type: 'Framework',
          title: fw.name,
          subtitle: fw.tagline,
          stage: fw.stage,
          slug: fw.slug,
          score: s,
        });
      }
    }

    for (const lab of LABS) {
      const s = scoreText(lab.title, lab.objective);
      if (s > 0) {
        results.push({
          type: 'Lab',
          title: lab.title,
          subtitle: lab.objective,
          stage: lab.stage,
          slug: lab.slug,
          score: s,
        });
      }
    }

    for (const cs of CASE_STUDIES) {
      const s = scoreText(cs.title, `${cs.category} ${cs.context} ${cs.lessons}`);
      if (s > 0) {
        results.push({
          type: 'Case Study',
          title: cs.title,
          subtitle: cs.context,
          stage: cs.stage,
          slug: cs.slug,
          score: s,
        });
      }
    }

    for (const g of GLOSSARY) {
      const s = scoreText(g.term, g.definition);
      if (s > 0) {
        results.push({
          type: 'Glossary',
          title: g.term,
          subtitle: g.definition,
          slug: g.term,
          score: s,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    res.json({ results: results.slice(0, 25) });
  });

  // 3. Server-Side AI Study Assistant with Google Search Grounding (gemini-3.8-flash) + Optional Ollama Fallback
  app.post('/api/ai/study-assistant', async (req: Request, res: Response) => {
    const question = String(req.body?.question || '').trim().slice(0, 1200);
    const currentTopicTitle = String(req.body?.topicTitle || '').trim();

    if (!question) {
      res.status(400).json({ error: 'Question is required.' });
      return;
    }

    const ragContext = retrieveCurriculumRagSnippets(`${currentTopicTitle} ${question}`);
    const systemPrompt = [
      'You are the IHR OSINT Academy Study Assistant — an expert, ethical Open Source Intelligence & Cyber Threat Intelligence instructor.',
      'Rules:',
      '1. Enforce strict legal and ethical boundaries: Stage A teaches zero-touch passive OSINT only; never provide unauthorized hacking, credential stuffing, doxxing, or dark-web access instructions.',
      '2. Cite real standards, RFCs, MITRE ATT&CK IDs (e.g. TA0043), CISA KEV, and genuine OSINT tools only—never invent fake tools or CVEs.',
      '3. Keep explanations clear, structured, and beginner-friendly.',
      ragContext ? `\nRelevant IHR OSINT Curriculum Context:\n${ragContext}` : '',
    ].join('\n');

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: question,
          config: {
            systemInstruction: systemPrompt,
            tools: [{ googleSearch: {} }],
          },
        });

        const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: { title: string; uri: string }[] = [];
        const seenUris = new Set<string>();
        for (const chunk of rawChunks) {
          const uri = chunk?.web?.uri;
          const title = chunk?.web?.title || uri;
          if (uri && !seenUris.has(uri)) {
            seenUris.add(uri);
            sources.push({ title: String(title), uri: String(uri) });
          }
        }

        res.json({
          answer: response.text || 'No response generated.',
          sources,
          provider: 'gemini-search-grounded',
        });
        return;
      } catch (error: any) {
        console.error('Gemini study assistant error:', error);
        res.status(502).json({
          error:
            error?.message ||
            'AI Study Assistant encountered an error. Check your API key in Settings > Secrets.',
        });
        return;
      }
    }

    // Optional Self-Hosted Ollama Fallback
    const ollamaUrl = process.env.OLLAMA_BASE_URL;
    if (ollamaUrl) {
      try {
        const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';
        const ollamaRes = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            system: systemPrompt,
            prompt: question,
            stream: false,
          }),
        });
        const ollamaJson: any = await ollamaRes.json();
        res.json({
          answer: ollamaJson.response || 'No response from Ollama.',
          sources: [],
          provider: 'ollama-rag',
        });
        return;
      } catch (err: any) {
        console.error('Ollama fallback error:', err);
      }
    }

    // Offline Curriculum RAG Response if neither Gemini nor Ollama is configured
    res.json({
      answer: ragContext
        ? `Based on the IHR OSINT Academy curriculum:\n\n${ragContext}`
        : 'No matching curriculum topic found for that query. Try searching the Glossary or Tools Directory.',
      sources: [],
      provider: 'curriculum-rag',
    });
  });

  // 4. Google Workspace Integration Routes (Client passes OAuth Bearer token)
  app.post('/api/workspace/export-doc', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Sign in with Google first to export to Google Docs.' });
      return;
    }

    const docTitle = String(req.body?.title || 'IHR OSINT Investigation Report').slice(0, 180);
    const bodyText = String(req.body?.content || '').slice(0, 45000);

    try {
      const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: docTitle }),
      });

      const created: any = await createRes.json();
      if (!createRes.ok || !created.documentId) {
        res.status(createRes.status || 500).json({
          error: created?.error?.message || 'Failed to create Google Doc.',
        });
        return;
      }

      if (bodyText.trim().length > 0) {
        const updateRes = await fetch(
          `https://docs.googleapis.com/v1/documents/${created.documentId}:batchUpdate`,
          {
            method: 'POST',
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requests: [
                {
                  insertText: {
                    location: { index: 1 },
                    text: bodyText,
                  },
                },
              ],
            }),
          }
        );
        if (!updateRes.ok) {
          const updateErr: any = await updateRes.json();
          res.status(updateRes.status).json({
            error: updateErr?.error?.message || 'Created document, but failed to write content.',
          });
          return;
        }
      }

      res.json({
        documentId: created.documentId,
        url: `https://docs.google.com/document/d/${created.documentId}/edit`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Google Docs API request failed.' });
    }
  });

  app.post('/api/workspace/export-sheet', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Sign in with Google first to export to Google Sheets.' });
      return;
    }

    const sheetTitle = String(req.body?.title || 'IHR OSINT Academy Tracker').slice(0, 150);
    const rows: string[][] = Array.isArray(req.body?.rows) ? req.body.rows : [];

    try {
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: { title: sheetTitle },
        }),
      });

      const created: any = await createRes.json();
      if (!createRes.ok || !created.spreadsheetId) {
        res.status(createRes.status || 500).json({
          error: created?.error?.message || 'Failed to create Google Sheet.',
        });
        return;
      }

      // Dynamically inspect created sheet tab metadata rather than hardcoding "Sheet1"
      const tabName: string = created.sheets?.[0]?.properties?.title || 'Sheet1';

      if (rows.length > 0) {
        const range = `${tabName}!A1`;
        const valRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${created.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              range,
              majorDimension: 'ROWS',
              values: rows,
            }),
          }
        );

        if (!valRes.ok) {
          const valErr: any = await valRes.json();
          res.status(valRes.status).json({
            error: valErr?.error?.message || 'Created spreadsheet, but failed to populate rows.',
          });
          return;
        }
      }

      res.json({
        spreadsheetId: created.spreadsheetId,
        url:
          created.spreadsheetUrl ||
          `https://docs.google.com/spreadsheets/d/${created.spreadsheetId}/edit`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Google Sheets API request failed.' });
    }
  });

  // Mount Vite dev middleware or serve production static bundle
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IHR OSINT Academy running at http://0.0.0.0:${PORT}`);
  });
}

void startServer();
