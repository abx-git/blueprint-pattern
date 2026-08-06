import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { AgmConfig } from '../types.js';
import { docRootAbs } from '../config/load.js';

export interface LoadedContext {
  docRoot: string;
  alwaysOn: string;
  entryPoint: string;
  alwaysOnPath: string;
  entryPointPath: string;
}

/** Load session context: entry-point is required; always-on is optional (legacy). */
export function loadContext(config: AgmConfig, cwd = process.cwd()): LoadedContext {
  const docRoot = docRootAbs(config, cwd);
  const alwaysOnPath = join(docRoot, 'context/always-on.md');
  const entryPointPath = join(docRoot, 'entry-point.md');

  if (!existsSync(entryPointPath)) {
    throw new Error(
      `entry-point.md not found at ${entryPointPath}. Run agm init or AGM Studio Install first.`,
    );
  }

  const entryPoint = readFileSync(entryPointPath, 'utf8');
  const alwaysOn = existsSync(alwaysOnPath)
    ? readFileSync(alwaysOnPath, 'utf8')
    : '_No always-on.md (legacy). Use entry-point.md as the single start file._\n';

  return {
    docRoot: config.docRoot,
    alwaysOn,
    entryPoint,
    alwaysOnPath: join(config.docRoot, 'context/always-on.md'),
    entryPointPath: join(config.docRoot, 'entry-point.md'),
  };
}
