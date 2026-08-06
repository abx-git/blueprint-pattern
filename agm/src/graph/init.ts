import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { AgmConfig, TemplateId } from '../types.js';
import { docRootAbs, normDocRoot, resolvedTemplate } from '../config/load.js';

interface TemplatePhase {
  phase: string;
  section: string;
  target: string;
}

const ARC42_PHASES: TemplatePhase[] = [
  { phase: '0', section: 'Bootstrap', target: 'blueprint.md' },
  { phase: '1', section: 'Introduction and Goals', target: 'arc42/introduction.md' },
  { phase: '2', section: 'Constraints', target: 'arc42/constraints.md' },
  { phase: '3', section: 'Context and Scope', target: 'arc42/context.md + interfaces/' },
  { phase: '4', section: 'Solution Strategy', target: 'arc42/solution-strategy.md' },
  { phase: '5', section: 'Building Block View', target: 'arc42/building-blocks.md' },
  { phase: '6', section: 'Runtime View', target: 'arc42/runtime.md' },
  { phase: '7', section: 'Deployment View', target: 'arc42/deployment.md' },
  { phase: '8', section: 'Cross-cutting Concepts', target: 'arc42/concepts.md' },
  { phase: '9', section: 'Architecture Decisions', target: 'arc42/decisions/' },
  { phase: '10', section: 'Quality Requirements', target: 'arc42/quality.md' },
  { phase: '11', section: 'Risks and Technical Debt', target: 'arc42/risks.md' },
  { phase: '12', section: 'Glossary', target: 'arc42/glossary.md' },
  { phase: '13', section: 'Operational Knowledge', target: 'ops/' },
  { phase: '14', section: 'Domain — Context map', target: 'domain/context-map.md' },
  { phase: '15', section: 'Domain — Subdomains', target: 'domain/subdomains.md' },
  { phase: '16', section: 'Domain — Event catalog', target: 'domain/events.md' },
  { phase: '17', section: 'Domain — Context models', target: 'domain/contexts/' },
];

const C4_LIGHT_PHASES: TemplatePhase[] = [
  { phase: '0', section: 'Bootstrap', target: 'blueprint.md' },
  { phase: '1', section: 'Context', target: 'c4-light/context.md' },
  { phase: '2', section: 'Containers', target: 'c4-light/containers.md' },
  { phase: '3', section: 'Components', target: 'c4-light/components.md' },
  { phase: '4', section: 'Decisions', target: 'c4-light/decisions/' },
  { phase: '5', section: 'Interfaces', target: 'interfaces/' },
  { phase: '6', section: 'Operations', target: 'ops/' },
  { phase: '7', section: 'Domain', target: 'domain/' },
];

const ADR_FIRST_PHASES: TemplatePhase[] = [
  { phase: '0', section: 'Bootstrap', target: 'blueprint.md' },
  { phase: '1', section: 'Context', target: 'adr-first/context.md' },
  { phase: '2', section: 'Views', target: 'adr-first/views.md' },
  { phase: '3', section: 'Decisions', target: 'adr-first/decisions/' },
  { phase: '4', section: 'Interfaces', target: 'interfaces/' },
  { phase: '5', section: 'Domain', target: 'domain/' },
];

const LEAN_SERVICE_PHASES: TemplatePhase[] = [
  { phase: '0', section: 'Bootstrap', target: 'blueprint.md' },
  { phase: '1', section: 'Overview', target: 'lean-service/overview.md' },
  { phase: '2', section: 'Runtime', target: 'lean-service/runtime.md' },
  { phase: '3', section: 'Decisions', target: 'lean-service/decisions/' },
  { phase: '4', section: 'Interfaces', target: 'interfaces/' },
  { phase: '5', section: 'Domain', target: 'domain/' },
];

function phasesForTemplate(template: TemplateId): TemplatePhase[] {
  switch (template) {
    case 'c4-light':
      return C4_LIGHT_PHASES;
    case 'adr-first':
      return ADR_FIRST_PHASES;
    case 'lean-service':
      return LEAN_SERVICE_PHASES;
    case 'custom':
      return [
        { phase: '0', section: 'Bootstrap', target: 'blueprint.md' },
        { phase: '1', section: 'Custom sections', target: 'custom/' },
      ];
    default:
      return ARC42_PHASES;
  }
}

function buildStatusTable(template: TemplateId, customName?: string): string {
  const t = template === 'custom' ? customName || 'custom' : template;
  const phases = phasesForTemplate(template).map((p) => ({
    ...p,
    target: p.target.replace(/arc42\//g, `${t}/`).replace(/c4-light\//g, `${t}/`).replace(/adr-first\//g, `${t}/`).replace(/lean-service\//g, `${t}/`),
  }));

  const today = new Date().toISOString().slice(0, 10);
  const rows = phases.map((p, i) => {
    const state = i === 0 ? '[x] done' : '[ ] open';
    const updated = i === 0 ? today : '—';
    return `| ${p.phase.padEnd(5)} | ${p.section.padEnd(26)} | ${p.target.padEnd(34)} | ${state.padEnd(14)} | ${updated.padEnd(12)} |`;
  });

  return [
    '## Status',
    '',
    '| Phase | Section                    | Target file                        | State          | Last updated |',
    '|-------|----------------------------|------------------------------------|----------------|--------------|',
    ...rows,
    '',
    'States: `[ ]` open · `[~]` in progress · `[x]` done · `[!]` blocked',
    '',
  ].join('\n');
}

function buildAlwaysOn(_config: AgmConfig): string {
  return [
    '---',
    'type: architecture-context',
    'title: "Always-on (legacy)"',
    'description: "Legacy stub — prefer entry-point.md"',
    'resource: "repo://"',
    'tags: [architecture, context, legacy]',
    `timestamp: "${new Date().toISOString().slice(0, 10)}"`,
    '---',
    '',
    '# Always-on (legacy)',
    '',
    'Facts and session orientation now live in **[entry-point.md](../entry-point.md)**.',
    '',
    'Keep this file only for older repos. If anything unique remains here, merge it into entry-point and stop maintaining a third source of truth.',
    '',
  ].join('\n');
}

function buildBlueprint(config: AgmConfig): string {
  const template = resolvedTemplate(config);
  const today = new Date().toISOString().slice(0, 10);

  return [
    `# Blueprint — ${config.appName}`,
    '',
    "**What's next** for the docs. Tick items as you go: `[ ]` open · `[~]` in progress · `[x]` done.",
    '',
    '## Documentation template',
    '',
    `Selected template: ${template}`,
    `Rationale: Initial bootstrap via agm init on ${today}.`,
    '',
    buildStatusTable(config.template, config.customTemplate),
    '## Spikes',
    '',
    '| ID | Track | Title | Type | File | Status | Date |',
    '|----|-------|-------|------|------|--------|------|',
    '| —  | —     | —     | —    | —    | —      | —    |',
    '',
    '**Track:** `architecture` · `domain`',
    '',
    '## Reviews',
    '',
    '| Phase / target | Reviewed | Verdict | Report | Findings |',
    '|----------------|----------|---------|--------|----------|',
    '| —              | —        | —       | —      | —        |',
    '',
    '## Session notes',
    '',
    `### ${today} — Session 1`,
    '- Completed: agm init — entry-point + blueprint created',
    `- Key decisions: template=${template}, docRoot=${config.docRoot}`,
    '- Next: Continue building via AGM Studio Run → Continue building',
    `- Resume: open ${config.docRoot}entry-point.md in AI context, then continue from blueprint.`,
    '',
  ].join('\n');
}

function buildEntryPoint(config: AgmConfig): string {
  const template = resolvedTemplate(config);
  const docRoot = normDocRoot(config.docRoot);

  return [
    `# ${config.appName} — Entry point`,
    '',
    '**Start here.** Put this file in the AI context. Short facts + links to everything else.',
    '',
    '## About this system',
    '',
    `**Application:** ${config.appName}`,
    `**Domain:** ${config.purpose || '<one sentence>'}`,
    `**Stack:** ${config.stack || '<stack>'}`,
    `**Template:** ${template}`,
    '',
    '## Source code map',
    '',
    '| Module | Path |',
    '|--------|------|',
    config.sourceRoot
      ? `| Primary | [${config.sourceRoot}](../../${config.sourceRoot}) |`
      : '| — | — |',
    '',
    '## Links',
    '',
    '| What | Where |',
    '|------|-------|',
    "| What's next (checklist) | [blueprint.md](./blueprint.md) |",
    `| Template (${template}) | [${template}/](./${template}/) |`,
    '| Interface exports | [interfaces/exports.md](./interfaces/exports.md) |',
    '| Interface imports | [interfaces/imports.md](./interfaces/imports.md) |',
    '| Spikes | [process/spikes/](./process/spikes/) |',
    '| Reviews | [process/reviews/](./process/reviews/) |',
    '| Domain | [domain/context-map.md](./domain/context-map.md) |',
    '',
    '## Session habit',
    '',
    '1. Read this file → [blueprint.md](./blueprint.md) → `prompts/role-<role>.md`.',
    '2. Follow links; update this map when chapters appear.',
    '3. Tick blueprint items when work moves forward.',
    '',
    `<!-- Doc root: ${docRoot} -->`,
    '',
  ].join('\n');
}

export interface InitResult {
  created: string[];
  skipped: string[];
  docRoot: string;
}

export function initGraph(config: AgmConfig, cwd = process.cwd(), force = false): InitResult {
  const docRoot = docRootAbs(config, cwd);
  const created: string[] = [];
  const skipped: string[] = [];

  const files: Array<{ rel: string; content: string }> = [
    { rel: 'context/always-on.md', content: buildAlwaysOn(config) },
    { rel: 'blueprint.md', content: buildBlueprint(config) },
    { rel: 'entry-point.md', content: buildEntryPoint(config) },
  ];

  for (const { rel, content } of files) {
    const dest = join(docRoot, rel);
    mkdirSync(join(dest, '..'), { recursive: true });
    if (existsSync(dest) && !force) {
      skipped.push(rel);
      continue;
    }
    writeFileSync(dest, content, 'utf8');
    created.push(rel);
  }

  return { created, skipped, docRoot: config.docRoot };
}
