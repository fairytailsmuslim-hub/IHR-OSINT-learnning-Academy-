import curriculumRaw from '../../content/curriculum.json';
import stageAPart1Raw from '../../content/topics/stage-a-part1.json';
import stageAPart2Raw from '../../content/topics/stage-a-part2.json';
import stageBRaw from '../../content/topics/stage-b.json';
import frameworksRaw from '../../content/frameworks/frameworks.json';
import toolsRaw from '../../content/tools/tools.json';
import labsRaw from '../../content/labs/labs.json';
import caseStudiesRaw from '../../content/case-studies/case-studies.json';
import glossaryRaw from '../../content/glossary.json';
import capstonesRaw from '../../content/exams/capstones.json';

import {
  CurriculumData,
  CurriculumModule,
  CurriculumPhase,
  CurriculumStage,
  Topic,
  OsintFramework,
  OsintTool,
  OsintLab,
  CaseStudy,
  GlossaryItem,
  CapstoneExam,
} from './types.ts';

export const CURRICULUM: CurriculumData = curriculumRaw as CurriculumData;

export const ALL_TOPICS: Topic[] = [
  ...(stageAPart1Raw as Topic[]),
  ...(stageAPart2Raw as Topic[]),
  ...(stageBRaw as Topic[]),
];

export const TOPIC_BY_SLUG: Record<string, Topic> = Object.fromEntries(
  ALL_TOPICS.map((t) => [t.slug, t])
);

export const FRAMEWORKS: OsintFramework[] = frameworksRaw as OsintFramework[];
export const TOOLS: OsintTool[] = toolsRaw as OsintTool[];
export const LABS: OsintLab[] = labsRaw as OsintLab[];
export const LAB_BY_SLUG: Record<string, OsintLab> = Object.fromEntries(
  LABS.map((l) => [l.slug, l])
);
export const CASE_STUDIES: CaseStudy[] = caseStudiesRaw as CaseStudy[];
export const GLOSSARY: GlossaryItem[] = glossaryRaw as GlossaryItem[];

export const CAPSTONES: { stageA: CapstoneExam; stageB: CapstoneExam } =
  capstonesRaw as { stageA: CapstoneExam; stageB: CapstoneExam };

export interface ResolvedModuleContext {
  stage: CurriculumStage;
  phase: CurriculumPhase;
  module: CurriculumModule;
  topics: Topic[];
}

export const ALL_MODULES: ResolvedModuleContext[] = CURRICULUM.stages.flatMap((stage) =>
  stage.phases.flatMap((phase) =>
    phase.modules.map((module) => ({
      stage,
      phase,
      module,
      topics: module.topicSlugs.map((slug) => TOPIC_BY_SLUG[slug]).filter(Boolean),
    }))
  )
);

export const MODULE_BY_ID: Record<string, ResolvedModuleContext> = Object.fromEntries(
  ALL_MODULES.map((m) => [m.module.id, m])
);

export function getTopicContext(topicSlug: string) {
  const topic = TOPIC_BY_SLUG[topicSlug];
  if (!topic) return null;
  const modCtx = MODULE_BY_ID[topic.moduleId];
  if (!modCtx) return null;
  const idxInAll = ALL_TOPICS.findIndex((t) => t.slug === topicSlug);
  const prevTopic = idxInAll > 0 ? ALL_TOPICS[idxInAll - 1] : null;
  const nextTopic = idxInAll < ALL_TOPICS.length - 1 ? ALL_TOPICS[idxInAll + 1] : null;
  return {
    topic,
    ...modCtx,
    prevTopic,
    nextTopic,
  };
}

export function isModuleUnlocked(
  moduleId: string,
  completedTopicSlugs: Set<string>,
  stageACertified: boolean,
  isAdmin: boolean
): { unlocked: boolean; reason?: string } {
  if (isAdmin) return { unlocked: true };
  const ctx = MODULE_BY_ID[moduleId];
  if (!ctx) return { unlocked: false, reason: 'Module not found' };

  if (ctx.stage.code === 'B' && !stageACertified) {
    return {
      unlocked: false,
      reason: 'Locked: Earn the Stage A Passive OSINT Certificate first',
    };
  }

  for (const prereqId of ctx.module.prerequisites) {
    const prereq = MODULE_BY_ID[prereqId];
    if (prereq) {
      const allPrereqTopicsDone = prereq.module.topicSlugs.every((s) =>
        completedTopicSlugs.has(s)
      );
      if (!allPrereqTopicsDone) {
        return {
          unlocked: false,
          reason: `Prerequisite required: Complete ${prereq.module.title}`,
        };
      }
    }
  }
  return { unlocked: true };
}

export function checkFillBlankAnswer(userInput: string, acceptedAnswers: string[]): boolean {
  const normalized = userInput.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized) return false;
  return acceptedAnswers.some(
    (ans) => ans.trim().toLowerCase().replace(/\s+/g, ' ') === normalized
  );
}
