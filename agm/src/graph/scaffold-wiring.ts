import { mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

export type AiTool = 'cursor' | 'claude' | 'copilot' | 'generic';

function writeCursorRules(docRootRule: string, cwd: string, updated: string[]): void {
  mkdirSync(join(cwd, '.cursor', 'rules'), { recursive: true });
  const pattern = join(cwd, '.cursor/rules/agm.mdc');
  const context = join(cwd, '.cursor/rules/agm-context.mdc');
  writeFileSync(
    pattern,
    `---
description: AGM — core system prompt
alwaysApply: true
---

Follow the AGM core prompt in [prompts/core/system-prompt.md](../../prompts/core/system-prompt.md).

Human-in-the-loop scribe only. Read order: entry-point.md → blueprint.md → role prompt.
Paths: \`${docRootRule}/\` · Workflows: MCP \`agm_trigger_workflow\` or AGM Studio.
Output semantic anchors before stopping.

OKF: every architecture artifact needs YAML frontmatter with mandatory \`type\`; maintain \`index.md\` and \`log.md\`.
`
  );
  writeFileSync(
    context,
    `---
description: AGM — context and governance
alwaysApply: true
---

# Architecture Graph Method (AGM) — Context Rules

1. Read \`${docRootRule}/entry-point.md\` (start here — facts + links; put in AI context)
2. Read \`${docRootRule}/blueprint.md\` (what's next)
3. Load \`${docRootRule}/prompts/role-<role>.md\` from the session prompt or MCP workflow

Invariants: relative Markdown links only; human-in-the-loop; traceable claims; OKF frontmatter with mandatory type; index.md and log.md at each level.
On stop: update entry-point links if needed, tick blueprint checklist, update \`log.md\`, [[ANCHOR:LINK_CHECK]].
`
  );
  updated.push(relative(cwd, pattern), relative(cwd, context));
}

export function writeAiToolRulesFromScaffold(
  aiTool: AiTool,
  project: string,
  docRootRule: string,
  cwd: string,
  updated: string[]
): void {
  switch (aiTool) {
    case 'claude': {
      const p = join(cwd, 'CLAUDE.md');
      writeFileSync(
        p,
        `# ${project} — Architecture Graph Method (AGM)

Follow [prompts/core/system-prompt.md](prompts/core/system-prompt.md).

Each session: read \`${docRootRule}/entry-point.md\` → \`${docRootRule}/blueprint.md\` → role prompt via MCP \`agm_trigger_workflow\` or AGM Studio.
`
      );
      updated.push(relative(cwd, p));
      break;
    }
    case 'copilot': {
      mkdirSync(join(cwd, '.github'), { recursive: true });
      const p = join(cwd, '.github/copilot-instructions.md');
      writeFileSync(
        p,
        `# Architecture Graph Method (AGM)

Follow [prompts/core/system-prompt.md](../prompts/core/system-prompt.md).

Read \`${docRootRule}/entry-point.md\` and \`${docRootRule}/blueprint.md\` at session start.
Use MCP \`agm_trigger_workflow\` or AGM Studio for session prompts.
`
      );
      updated.push(relative(cwd, p));
      break;
    }
    case 'generic': {
      const p = join(cwd, 'AGENTS.md');
      writeFileSync(
        p,
        `# AGM — ${project}

Core rules: [prompts/core/system-prompt.md](prompts/core/system-prompt.md)
Documentation: \`${docRootRule}/\` (start with entry-point.md)
Workflows: MCP \`agm_trigger_workflow\` or AGM Studio.
`
      );
      updated.push(relative(cwd, p));
      break;
    }
    default:
      writeCursorRules(docRootRule, cwd, updated);
  }
}
