import { assertZipSize } from '../middleware/rate_limit.js';

export type SourceInput =
  | { kind: 'zip'; files: string[]; size: number }
  | { kind: 'github'; url: string; commitSha: string };

export function validateZipLayout(files: string[]) {
  if (!files.some((f) => f.endsWith('Cargo.toml'))) {
    throw new Error('Cargo.toml required in archive');
  }
}

export function parseGithubInput(url: string, commitSha: string): SourceInput {
  return { kind: 'github', url, commitSha };
}

export function acceptZip(files: string[], size: number): SourceInput {
  assertZipSize(size);
  validateZipLayout(files);
  return { kind: 'zip', files, size };
}
