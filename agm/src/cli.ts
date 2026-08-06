#!/usr/bin/env node
import { Command } from 'commander';
import { input, select, confirm } from '@inquirer/prompts';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { loadConfig, configFilePath, normDocRoot, docRootAbs } from './config/load.js';
import { join } from 'node:path';
import { initGraph } from './graph/init.js';
import { installScaffold } from './graph/scaffold.js';
import { upgradeAgm } from './graph/upgrade.js';
import { linkExternalWorkDir } from './graph/work-link.js';
import { formatLinkCheck, verifyLinks } from './graph/verify.js';
import { getGraphStatus } from './graph/status.js';
import {
  findPrivatePromptsFile,
  findPrivateCompressedPromptsFile,
  getPromptPackFormat,
  getPromptPackTier,
  resolvePromptsDirectories,
  starterWorkflowIds,
} from './config/prompts-path.js';
import { listWorkflowIds, loadWorkflowCatalog } from './workflows/loader.js';
import type { AgmConfig, TemplateId } from './types.js';

const program = new Command();

program.name('agm').description('Architecture Graph Method — local CLI').version('0.1.0');

const AGM_INSTALL_URL =
  'https://raw.githubusercontent.com/abx-git/agm/main/scripts/agm-install.sh';
const AGM_UPGRADE_URL =
  'https://raw.githubusercontent.com/abx-git/agm/main/scripts/agm-upgrade.sh';

program
  .command('scaffold')
  .description('Install AGM scaffold from npm bundle (MCP-only — no GitHub curl)')
  .option('--project <name>', 'Application name', 'My Application')
  .option('--template <id>', 'arc42 | lean-service | c4-light | adr-first | custom', 'arc42')
  .option('--doc-root <path>', 'Documentation root', 'docs/architecture/')
  .option('--work-dir <path>', 'Store work/ outside Git (symlink)')
  .option('--ai-tool <name>', 'cursor | claude | copilot | generic', 'cursor')
  .option('--domain', 'Also install Domain/DDD pack')
  .option('--full', 'Install Architect + Domain packs (Assistant Advanced)')
  .option('-f, --force', 'Overwrite existing scaffold files')
  .action((opts) => {
    const result = installScaffold({
      project: opts.project,
      template: opts.template as TemplateId,
      docRoot: normDocRoot(opts.docRoot),
      workDir: opts.workDir,
      aiTool: opts.aiTool,
      domain: Boolean(opts.domain || opts.full),
      full: Boolean(opts.full),
      force: Boolean(opts.force),
    });
    console.log(`AGM scaffold installed (${result.template}) → ${result.docRoot}`);
    if (result.workDir) {
      console.log(`External work: ${result.docRoot}work/ → ${result.workDir}`);
    }
    if (result.created.length) {
      console.log(`Created ${result.created.length} file(s):`);
      for (const f of result.created.slice(0, 20)) console.log(`  ${f}`);
      if (result.created.length > 20) console.log(`  … and ${result.created.length - 20} more`);
    }
    if (result.skipped.length) {
      console.log(`Skipped ${result.skipped.length} existing file(s) (use --force to overwrite)`);
    }
    console.log('\nNext: new chat → MCP agm_trigger_workflow bootstrap-adopt (or Assistant UI Adopt prompt).');
    console.log('Do not re-run scaffold if blueprint.md already exists from adoption.');
    if (!opts.full) {
      console.log('Tip: agm scaffold --domain or --full for Architect/Domain packs.');
    }
    if (!opts.workDir) {
      console.log('Tip: --work-dir $HOME/agm-work/<app>/work keeps drafts outside Git.');
    }
  });

program
  .command('upgrade')
  .description('Refresh AGM platform files (workflows, prompts, roles) without touching architecture docs')
  .option('--doc-root <path>', 'Documentation root (default: from .agm-install-meta)')
  .option('--ai-tool <name>', 'cursor | claude | copilot | generic')
  .option('--project <name>', 'Application name')
  .option('--domain', 'Include Domain pack workflows and roles')
  .option('--full', 'Include Architect + Domain packs')
  .option('--no-add-missing', 'Do not scaffold missing folders (sources/, use-cases/, …)')
  .action((opts) => {
    const result = upgradeAgm({
      docRoot: opts.docRoot,
      aiTool: opts.aiTool,
      project: opts.project,
      domain: Boolean(opts.domain || opts.full),
      full: Boolean(opts.full),
      addMissing: opts.addMissing !== false,
    });
    console.log(`AGM upgraded (pack: ${result.pack}) → ${result.docRoot}`);
    console.log(`\n${result.preservedNote}`);
    if (result.updated.length) {
      console.log(`\nUpdated ${result.updated.length} file(s):`);
      for (const f of result.updated.slice(0, 25)) console.log(`  ${f}`);
      if (result.updated.length > 25) console.log(`  … and ${result.updated.length - 25} more`);
    }
    if (result.added.length) {
      console.log(`\nAdded ${result.added.length} missing scaffold file(s):`);
      for (const f of result.added) console.log(`  ${f}`);
    }
    console.log('\nNext: use new workflows from Assistant UI or prompts/workflows/.');
    console.log('Optional: bootstrap-continue to link new folders in entry-point.md.');
    console.log('MCP: update @abx-hh/agm-cli for compressed starter prompts.');
  });

program
  .command('install')
  .description('Print agm-install.sh curl command (or use: agm scaffold)')
  .option('--project <name>', 'Application name', 'My Application')
  .option('--template <id>', 'arc42 | lean-service | c4-light | adr-first | custom', 'arc42')
  .option('--doc-root <path>', 'Documentation root', 'docs/architecture/')
  .option('--work-dir <path>', 'Store work/ outside Git (symlink)')
  .option('--ai-tool <name>', 'cursor | claude | copilot | generic', 'cursor')
  .action((opts) => {
    const docRoot = normDocRoot(opts.docRoot);
    const args = [
      `--project "${opts.project}"`,
      `--doc-root "${docRoot}"`,
      `--template "${opts.template}"`,
      `--ai-tool "${opts.aiTool}"`,
    ];
    if (opts.workDir) args.push(`--work-dir "${opts.workDir}"`);
    console.log('AGM golden-path install — run at your application repository root:\n');
    console.log(`curl -fsSL ${AGM_INSTALL_URL} | bash -s -- ${args.join(' ')}`);
    console.log('\nAdd --full or --domain for Architect/Domain packs.');
    console.log('Add --work-dir $HOME/agm-work/<app>/work to keep drafts outside Git.');
    console.log('\nPrefer MCP-only: npx @abx-hh/agm-cli scaffold');
    console.log('Already installed? npx @abx-hh/agm-cli upgrade');
    console.log('\nagm init creates only 3 core graph files — use scaffold for prompts + templates.');
    console.log('Docs: docs/reference/install.md · docs/reference/external-work.md');
  });

program
  .command('work-link')
  .description('Point <doc-root>/work at a directory outside Git (per-developer local drafts)')
  .requiredOption('--work-dir <path>', 'External work directory')
  .option('--doc-root <path>', 'Documentation root (default: from config / docs/architecture/)')
  .option('-f, --force', 'Replace an existing symlink that points elsewhere')
  .action((opts) => {
    const config = loadConfig();
    const result = linkExternalWorkDir({
      docRoot: opts.docRoot || config.docRoot,
      workDir: opts.workDir,
      force: Boolean(opts.force),
    });
    console.log(`Linked ${result.linkPath} → ${result.workDirAbs}`);
    console.log(`Pointer: ${result.locationFile}`);
    if (result.gitignoreUpdated) console.log('Updated .gitignore');
  });

program
  .command('init')
  .description('Bootstrap core files (entry-point, blueprint; always-on stub). For full setup use: agm install')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('-f, --force', 'Overwrite existing core files')
  .option('--app-name <name>', 'Application name')
  .option('--template <id>', 'Documentation template')
  .option('--doc-root <path>', 'Documentation root')
  .option('--stack <stack>', 'Technology stack')
  .action(async (opts) => {
    let config: AgmConfig;

    if (opts.yes && opts.appName) {
      config = {
        appName: opts.appName,
        template: (opts.template as TemplateId) || 'arc42',
        docRoot: normDocRoot(opts.docRoot || 'docs/architecture/'),
        stack: opts.stack || '',
      };
    } else {
      const appName =
        opts.appName ||
        (await input({
          message: 'Application name',
          default: 'My Application',
        }));

      const template =
        opts.template ||
        (await select({
          message: 'Documentation template',
          choices: [
            { name: 'arc42', value: 'arc42' },
            { name: 'c4-light', value: 'c4-light' },
            { name: 'adr-first', value: 'adr-first' },
            { name: 'lean-service', value: 'lean-service' },
            { name: 'custom', value: 'custom' },
          ],
          default: 'arc42',
        }));

      let customTemplate: string | undefined;
      if (template === 'custom') {
        customTemplate = await input({
          message: 'Custom template folder name',
          default: 'custom',
        });
      }

      const docRoot = normDocRoot(
        opts.docRoot ||
          (await input({
            message: 'Documentation root',
            default: 'docs/architecture/',
          }))
      );

      const stack =
        opts.stack ||
        (await input({
          message: 'Stack (optional)',
          default: '',
        }));

      const purpose = await input({
        message: 'Purpose / domain (optional)',
        default: '',
      });

      config = {
        appName,
        template: template as TemplateId,
        customTemplate,
        docRoot,
        stack,
        purpose: purpose || undefined,
      };
    }

    const cfgPath = configFilePath();
    mkdirSync(dirname(cfgPath), { recursive: true });
    writeFileSync(cfgPath, JSON.stringify(config, null, 2) + '\n', 'utf8');

    const blueprintExists = existsSync(join(docRootAbs(config), 'blueprint.md'));

    if (blueprintExists && !opts.force) {
      const proceed = await confirm({
        message: 'blueprint.md already exists. Skip core file creation?',
        default: true,
      });
      if (proceed) {
        console.log(`Config written to ${cfgPath}`);
        console.log('Existing graph files preserved. Use --force to overwrite.');
        return;
      }
    }

    const result = initGraph(config, process.cwd(), Boolean(opts.force));
    console.log(`Config: ${cfgPath}`);
    console.log(`Doc root: ${result.docRoot}`);
    if (result.created.length) {
      console.log('Created:');
      for (const f of result.created) console.log(`  ${f}`);
    }
    if (result.skipped.length) {
      console.log('Skipped (already exist):');
      for (const f of result.skipped) console.log(`  ${f}`);
    }
    console.log('\nNext: run `agm scaffold` for full scaffold, then bootstrap-adopt via MCP.');
    console.log('MCP: see agm/README.md');
  });

program
  .command('verify')
  .description('Validate relative Markdown links in the architecture graph')
  .option('--json', 'Output JSON')
  .action((opts) => {
    const config = loadConfig();
    const result = verifyLinks(config);

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatLinkCheck(result));
      if (result.brokenLinks.length) {
        console.log('\nBroken links:');
        for (const b of result.brokenLinks) {
          console.log(`  ${b.file}: ${b.link} → ${b.resolved}`);
        }
      }
      console.log(`\nFiles checked: ${result.filesChecked}`);
    }

    process.exit(result.status === 'pass' ? 0 : 1);
  });

program
  .command('status')
  .description('Print graph status from blueprint.md')
  .option('--json', 'Output JSON')
  .action((opts) => {
    const config = loadConfig();
    const status = getGraphStatus(config);
    if (opts.json) {
      console.log(JSON.stringify(status, null, 2));
    } else {
      console.log(`Template: ${status.template}`);
      console.log(`Doc root: ${status.docRoot}`);
      console.log(`Open phases: ${status.openPhases.length}`);
      console.log(`In progress: ${status.inProgressPhases.length}`);
      console.log(`Active WRK (draft): ${status.activeWorkItems.length}`);
      console.log(`Guardrail findings: ${status.guardrailFindings.length}`);
    }
  });

const workflowsCmd = program.command('workflows').description('Workflow catalog');

workflowsCmd
  .command('list')
  .description('List workflow IDs (catalog only — no prompt text)')
  .action(() => {
    const workflows = loadWorkflowCatalog();
    for (const w of workflows) {
      console.log(`${w.id}\t${w.group}\t${w.when}`);
    }
  });

const promptsCmd = program.command('prompts').description('Prompt pack (starter + optional full)');

promptsCmd
  .command('status')
  .description('Check prompt pack tier: starter (public) or full (private)')
  .action(() => {
    const config = loadConfig();
    const tier = getPromptPackTier(config);
    if (tier === 'none') {
      console.log('Prompt pack: NOT installed');
      process.exit(1);
    }
    console.log(`Prompt pack: ${tier} (${getPromptPackFormat(config)})`);
    if (tier === 'starter') {
      console.log(`  Starter workflows (${starterWorkflowIds().length}): ${starterWorkflowIds().join(', ')}`);
      console.log('  Public npm ships LLMLingua-2 compressed prompts only.');
      console.log('  Install full private pack for extended workflows — see agm/prompts-pack/README.md');
    }
    const file = findPrivatePromptsFile(config);
    const compressed = findPrivateCompressedPromptsFile(config);
    if (file) console.log(`  Private plaintext: ${file}`);
    if (compressed) console.log(`  Private compressed: ${compressed}`);
    console.log('  Private pack search paths:');
    for (const d of resolvePromptsDirectories(config)) {
      console.log(`    - ${d}`);
    }
  });

workflowsCmd
  .command('ids')
  .description('Print workflow IDs only')
  .action(() => {
    for (const id of listWorkflowIds()) console.log(id);
  });

program.parse();
