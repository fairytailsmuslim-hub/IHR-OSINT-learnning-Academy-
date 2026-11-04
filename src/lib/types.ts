export type StageCode = 'A' | 'B';

export type CareerGoal =
  | 'journalist'
  | 'soc_analyst'
  | 'threat_intel'
  | 'fraud_analyst'
  | 'general';

export type SkillLevel = 'beginner' | 'intermediate' | 'pro';

export interface FillBlankQuestion {
  id: string;
  prompt: string;
  acceptedAnswers: string[];
  hint: string;
  explanation: string;
}

export interface Topic {
  slug: string;
  moduleId: string;
  stage: StageCode;
  title: string;
  estimatedMinutes: number;
  concept: string;
  framework: string;
  caseStudy: string;
  tools: string[];
  lab: string;
  commonMistakes: string;
  legalNotes: string;
  notesPrompt: string;
  quiz: FillBlankQuestion[];
}

export interface CurriculumModule {
  id: string;
  number: number;
  slug: string;
  title: string;
  summary: string;
  careerRelevance: string[];
  prerequisites: string[];
  labSlug: string;
  topicSlugs: string[];
}

export interface CurriculumPhase {
  id: string;
  number: number;
  slug: string;
  title: string;
  summary: string;
  modules: CurriculumModule[];
}

export interface CurriculumStage {
  id: string;
  code: StageCode;
  slug: string;
  title: string;
  subtitle: string;
  certificateTitle: string;
  lockedByDefault: boolean;
  summary: string;
  outcomes: string[];
  phases: CurriculumPhase[];
}

export interface CurriculumData {
  stages: CurriculumStage[];
}

export interface FrameworkStep {
  step: string;
  title: string;
  detail: string;
}

export interface OsintFramework {
  slug: string;
  name: string;
  shortName: string;
  stage: StageCode;
  tagline: string;
  overview: string;
  steps: FrameworkStep[];
  mappedModules: string[];
}

export type ToolCategory =
  | 'Search'
  | 'Social'
  | 'Domain/IP'
  | 'Email'
  | 'Image/Video'
  | 'Geo'
  | 'Threat Intel'
  | 'Corporate'
  | 'Verification'
  | 'Note-taking/Graph';

export interface OsintTool {
  id: string;
  name: string;
  url: string;
  category: ToolCategory;
  pricing: 'Free' | 'Freemium' | 'Open Source' | 'Paid';
  platform: string;
  stage: StageCode;
  description: string;
  ethicalNote: string;
  isCustom?: boolean;
}

export interface OsintLab {
  slug: string;
  moduleId: string;
  stage: StageCode;
  title: string;
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  objective: string;
  prerequisites: string[];
  steps: string[];
  expectedOutcome: string;
  selfCheck: FillBlankQuestion[];
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  stage: StageCode;
  category: string;
  sourceOrg: string;
  context: string;
  methodology: string[];
  toolsUsed: string[];
  lessons: string;
}

export interface GlossaryItem {
  term: string;
  category: string;
  definition: string;
}

export interface CapstoneMcq {
  id: string;
  q: string;
  options: string[];
  correctIndex: number;
}

export interface CapstoneExam {
  id: string;
  stage: StageCode;
  title: string;
  certificateName: string;
  passPercentage: number;
  scenarioPrompt: string;
  mcqs: CapstoneMcq[];
  fillBlanks: FillBlankQuestion[];
}

export interface UserProfileData {
  uid: string;
  email?: string;
  role: 'student' | 'admin';
  authMode: 'firebase' | 'demo';
  displayName: string;
  careerGoal: CareerGoal;
  skillLevel: SkillLevel;
  onboarded: boolean;
  stageACertified: boolean;
  stageACertId: string;
  stageAScore: number;
  stageBCertified: boolean;
  stageBCertId: string;
  stageBScore: number;
  streakDays: number;
  minutesStudied: number;
  lastActiveDate: string;
}

export interface TopicProgressRecord {
  uid: string;
  topicSlug: string;
  stage: StageCode;
  completed: boolean;
  quizScore: number;
  quizTotal: number;
}

export interface LabProgressRecord {
  uid: string;
  labSlug: string;
  completed: boolean;
  score: number;
}

export interface StudyNoteRecord {
  id: string;
  uid: string;
  targetSlug: string;
  title: string;
  content: string;
  updatedAtIso: string;
}

export interface SpacedCardRecord {
  cardId: string;
  uid: string;
  topicSlug: string;
  prompt: string;
  answer: string;
  intervalDays: number;
  streak: number;
  nextReviewEpochMs: number;
}
