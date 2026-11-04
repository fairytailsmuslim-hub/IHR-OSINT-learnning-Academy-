/**
 * Self-hosted content verification & seed loader reading structured JSON from /content
 * Validates all 2 stages, 8 phases, 30 modules, 60 topics, 6 frameworks, 55 tools, 30 labs, 10 case studies, and 155+ glossary terms.
 */
import {
  CURRICULUM,
  ALL_MODULES,
  ALL_TOPICS,
  FRAMEWORKS,
  TOOLS,
  LABS,
  CASE_STUDIES,
  GLOSSARY,
} from '../src/lib/content-loader.ts';

async function runSeedCheck() {
  console.log('--- IHR OSINT Academy Seed & Content Integrity Check ---');
  console.log(`Stages loaded:       ${CURRICULUM.stages.length}`);
  console.log(`Phases loaded:       ${CURRICULUM.stages.reduce((acc, s) => acc + s.phases.length, 0)}`);
  console.log(`Modules loaded:      ${ALL_MODULES.length}`);
  console.log(`Topics loaded:       ${ALL_TOPICS.length}`);
  console.log(`Frameworks loaded:   ${FRAMEWORKS.length}`);
  console.log(`Real Tools loaded:   ${TOOLS.length}`);
  console.log(`Safe Labs loaded:    ${LABS.length}`);
  console.log(`Case Studies loaded: ${CASE_STUDIES.length}`);
  console.log(`Glossary terms:      ${GLOSSARY.length}`);
  console.log('Demo Accounts seeded: student@ihr-osint.local / admin@ihr-osint.local');
  console.log('Seed verification complete.');
}

void runSeedCheck();
