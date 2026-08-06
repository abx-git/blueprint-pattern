import type { AgmConfig, Workflow } from '../types.js';
import { normDocRoot, resolvedTemplate } from '../config/load.js';
import { substituteDocRoot } from './doc-root.js';
import { substituteTemplate } from './template.js';
import {
  DIALOG_WORKFLOW_IDS,
  EVOLVE_WORKFLOW_IDS,
} from './workflow-inputs.js';

function workflowRole(workflow: Workflow): string {
  const r = String(workflow.role || '').trim();
  return r.split('`')[0].split('(')[0].trim() || 'bootstrap';
}

function buildCoreFilesBlock(docRoot: string): string {
  const r = normDocRoot(docRoot);
  return [
    '## Core files (keep simple)',
    '',
    `- ${r}entry-point.md — **start here** (short facts + links). Put this in AI context; keep it current.`,
    `- ${r}blueprint.md — **what's next** (checklist + short session notes). Tick items when a chapter moves forward.`,
    `- ${r}context/always-on.md — legacy only. If it still has unique facts, merge them into entry-point; do not maintain a third source of truth.`,
    '',
    'When chapters or links change, update entry-point. When work progresses, update blueprint checkmarks.',
    '',
  ].join('\n');
}

function buildDialogModeHeader(): string {
  return [
    '## Dialog mode (OVERRIDES in this chat)',
    '',
    '**Interview first, write later.** role-architecture-work.md steps 3–5 and OUTPUT_CONTRACT apply only in Phase 2.',
    'Phase 1: no files, no designs, no [[ANCHOR:...]] — exactly **one question** per reply.',
    'Use Cursor **Chat** (not Agent/Composer) — the dialog requires turn-by-turn replies.',
    '',
  ].join('\n');
}

function applyWorkflowInputs(
  prompt: string,
  workflowId: string,
  values: Record<string, string | boolean | undefined>
): string {
  let out = prompt;
  const map: Record<string, string | boolean | undefined> = {
    'your question here': values.question as string,
    'e.g. payment integration resilience': values.topic as string,
    'modules, services, or template sections': values.scope as string,
    'modules, services, or <template> sections': values.scope as string,
    'e.g. coupling, failure modes, security, performance': values.focus as string,
    'e.g. add circuit breaker between order-service and payment-service': values.goal as string,
    'optional: latency, no new infra, etc.': values.constraints as string,
    'paste git diff or PR diff summary': values.gitDiff as string,
    'pasted-content': values.pastedContent as string,
    'source-label': values.sourceLabel as string,
    'source-type': values.sourceType as string,
    goal: values.goal as string,
    scope: values.scope as string,
    slug: values.slug as string,
    'diff-from': values.diffFrom as string,
    'diff-to': (values.diffTo as string) || 'HEAD',
    'focus-dimensions': values.focusDimensions as string,
    'source-paths': values.sourcePaths as string,
    'compare-documentation': values.compareDocumentation as string,
    'initial-goal': values.initialGoal as string,
    'clarify-with-user':
      values.scope === '<clarify-with-user>' ? (values.scope as string) : undefined,
  };

  for (const [placeholder, val] of Object.entries(map)) {
    if (val == null || val === '') continue;
    const escaped = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`<${escaped}>`, 'g'), String(val));
    if (placeholder.includes('e.g.') || placeholder === 'paste git diff or PR diff summary' || placeholder === 'pasted-content') {
      out = out.replace(placeholder, String(val));
    }
  }

  if (values.slug) {
    out = out.replace(/YYYY-MM-DD-<slug>/g, `YYYY-MM-DD-${values.slug}`);
    out = out.replace(/<slug>/g, String(values.slug));
  }
  if (values.question) {
    out = out.replace(/Question: <your question here>/, `Question: ${values.question}`);
  }
  if (values.gitDiff) {
    out = out.replace(/<paste git diff or PR diff summary>/, String(values.gitDiff));
    out = out.replace(
      /Git diff:\n<paste git diff or PR diff summary>/,
      `Git diff:\n${values.gitDiff}`
    );
  }
  if (values.pastedContent) {
    out = out.replace(/<pasted-content>/g, String(values.pastedContent));
    out = out.replace(
      /Pasted content:\n<pasted-content>/,
      `Pasted content:\n${values.pastedContent}`
    );
  }
  if (values.diffFrom) {
    const to = (values.diffTo as string) || 'HEAD';
    out = out.replace(/DIFF_FROM=<diff-from>/g, `DIFF_FROM=${values.diffFrom}`);
    out = out.replace(/DIFF_TO=<diff-to>/g, `DIFF_TO=${to}`);
    out = out.replace(/<diff-from>/g, String(values.diffFrom));
    out = out.replace(/<diff-to>/g, to);
    out = out.replace(/\$\{DIFF_FROM\}/g, String(values.diffFrom));
    out = out.replace(/\$\{DIFF_TO\}/g, to);
  }

  if (workflowId === 'architecture-work-sustainable-analysis') {
    const scope = (values.scope as string)?.trim() || '<clarify-with-user>';
    out = out.replace(/Scope: <modules, services, packages, or repository paths>/, `Scope: ${scope}`);
    out = out.replace(
      /Focus dimensions: <focus-dimensions>/,
      `Focus dimensions: ${values.focusDimensions || '<unspecified>'}`
    );
    const src = (values.sourcePaths as string)?.trim() || '<from entry-point.md source map>';
    out = out.replace(/Source paths \(optional\): <source-paths>/, `Source paths (optional): ${src}`);
    out = out.replace(
      /Compare to documented architecture: <compare-documentation>/,
      `Compare to documented architecture: ${values.compareDocumentation || 'yes'}`
    );
  }

  if (workflowId === 'architecture-work-sustainable-interrogate' && values.initialGoal) {
    out = out.replace(
      /Initial goal \(optional\): <initial-goal>/,
      `Initial goal (optional): ${values.initialGoal}`
    );
    out = out.replace(/<initial-goal>/g, String(values.initialGoal));
  }

  if (workflowId === 'domain-work-event-storm') {
    const proc = (values.processOrContext as string)?.trim() || '<to be clarified in dialog>';
    out = out.replace(
      /Process \/ bounded context \(optional\): <process-or-context>/,
      `Process / bounded context (optional): ${proc}`
    );
    out = out.replace(/<process-or-context>/g, proc);
    if (values.initialGoal) {
      out = out.replace(
        /Initial goal \(optional\): <initial-goal>/,
        `Initial goal (optional): ${values.initialGoal}`
      );
      out = out.replace(/<initial-goal>/g, String(values.initialGoal));
    }
  }

  if (workflowId === 'domain-board-ingest') {
    out = out.replace(/Source label: <source-label>/, `Source label: ${values.sourceLabel || ''}`);
    out = out.replace(
      /Goal: <e\.g\. Checkout process → events \+ BC-ORD model>/,
      `Goal: ${values.goal || ''}`
    );
    out = out.replace(
      /Intent views: <modelingMode list or "all Tier A">/,
      `Intent views: ${values.intentViews || 'all Tier A'}`
    );
    out = out.replace(
      /Board path or paste: <path-to-\.storm\.json or pasted JSON>/,
      `Board path or paste: ${values.boardPathOrPaste || values.pastedContent || ''}`
    );
    out = out.replace(
      /Code cross-check: <yes \| no>/,
      `Code cross-check: ${values.codeCrossCheck === false || values.codeCrossCheck === 'no' ? 'no' : 'yes'}`
    );
  }

  if (workflowId === 'domain-work-context-map') {
    out = out.replace(
      /Scope: <systems, modules, services, or repository paths>/,
      `Scope: ${values.scope || ''}`
    );
    out = out.replace(
      /Focus: <optional: greenfield \| legacy extraction \| integration cleanup>/,
      `Focus: ${values.focus || 'unspecified'}`
    );
  }

  if (workflowId === 'domain-work-subdomain-classification') {
    out = out.replace(
      /Business scope: <product line, platform, or enterprise area>/,
      `Business scope: ${values.businessScope || ''}`
    );
  }

  if (workflowId === 'domain-work-integration-review') {
    out = out.replace(
      /Scope: <cross-service integrations, API surface, or named context pair>/,
      `Scope: ${values.scope || ''}`
    );
  }

  if (workflowId === 'domain-work-tactical-review') {
    out = out.replace(/Bounded context: <context name>/, `Bounded context: ${values.boundedContext || ''}`);
    out = out.replace(/Scope: <source paths for this context>/, `Scope: ${values.scope || ''}`);
    out = out.replace(
      /Compare to model doc: <yes \| no>/,
      `Compare to model doc: ${values.compareModel ? 'yes' : 'no'}`
    );
  }

  if (workflowId === 'domain-work-language-audit') {
    out = out.replace(
      /Scope: <bounded context, service, or module paths>/,
      `Scope: ${values.scope || ''}`
    );
  }

  if (workflowId === 'domain-work-query' && values.question) {
    out = out.replace(/Question: <your domain question here>/, `Question: ${values.question}`);
  }

  if (workflowId === 'domain-work-design') {
    out = out.replace(
      /Goal: <e.g. split Order aggregate, introduce ACL to payment context, model refund policy>/,
      `Goal: ${values.goal || ''}`
    );
    out = out.replace(
      /Bounded context: <context name or cross-cutting>/,
      `Bounded context: ${values.boundedContext || ''}`
    );
    out = out.replace(/Constraints: <optional>/, `Constraints: ${values.constraints || 'none'}`);
  }

  if (workflowId === 'refinement' && values.goal) {
    const scopeText =
      (values.sessionFocusDetail as string)?.trim() ||
      'Next open row in blueprint.md (agent picks content section from the checklist)';
    out = out.replace(/Scope: <scope>[^\n]*/i, `Scope: ${scopeText}`);
    out = out.replace(/<scope>/g, scopeText);
  }

  if (workflowId === 'content-ingest') {
    const scopeText =
      (values.sessionFocusDetail as string)?.trim() ||
      'All relevant architecture content areas implied by the pasted material and goal';
    out = out.replace(/Scope: <scope>[^\n]*/i, `Scope: ${scopeText}`);
    out = out.replace(/<scope>/g, scopeText);
    if (values.sourceLabel) {
      out = out.replace(/Source label: <source-label>/, `Source label: ${values.sourceLabel}`);
    }
    if (values.sourceType) {
      out = out.replace(/Source type: <source-type>/, `Source type: ${values.sourceType}`);
    }
    if (values.goal) {
      out = out.replace(/Goal: <goal>/, `Goal: ${values.goal}`);
    }
  }

  return out;
}

/** Compose the full agent instruction for a workflow — returned via MCP only, never for human copy-paste. */
export function personalizeWorkflowPrompt(
  workflow: Workflow,
  config: AgmConfig,
  inputValues: Record<string, string | boolean | undefined> = {}
): string {
  const template = resolvedTemplate(config);
  let prompt = substituteDocRoot(workflow.prompt, config.docRoot);
  prompt = substituteTemplate(prompt, template);

  const values = { ...inputValues };
  if (workflow.id === 'architecture-work-sustainable-analysis') {
    values.compareDocumentation = values.compareDocs === false ? 'no' : 'yes';
    values.scope = (values.scope as string)?.trim() || '<clarify-with-user>';
  }

  prompt = applyWorkflowInputs(prompt, workflow.id, values);

  const docRoot = normDocRoot(config.docRoot);
  const workNote = config.workDir
    ? `- External work directory: ${config.workDir} (symlink ${docRoot}work/ — outside Git)`
    : `- Work directory: ${docRoot}work/ (in-repo; use --work-dir / agm work-link for local-only drafts)`;
  const isDialog = DIALOG_WORKFLOW_IDS.has(workflow.id);
  const focusNote =
    config.docFocus && config.docFocus.length > 0
      ? `- Architecture documentation areas: ${config.docFocus.join(', ')}`
      : '';
  const roleLine = isDialog
    ? `- Role file: ${docRoot}prompts/role-${workflowRole(workflow)}.md (Phase 2 only — overridden in Phase 1)`
    : `- Role file: ${docRoot}prompts/role-${workflowRole(workflow)}.md`;

  const header = [
    ...(isDialog ? [buildDialogModeHeader()] : []),
    '## Session context (installed prompts)',
    '',
    `- Documentation template: ${template}`,
    `- Documentation root: ${docRoot}`,
    `- Template folder: ${docRoot}${template}/`,
    workNote,
    focusNote,
    '- Core rules: prompts/core/system-prompt.md (installed)',
    roleLine,
    `- Workflow reference: prompts/workflows/${workflow.id}.md`,
    '',
    buildCoreFilesBlock(docRoot).trimEnd(),
    '',
  ]
    .filter(Boolean)
    .join('\n');

  return `${header}${prompt}`;
}
