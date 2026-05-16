export type SourceInput =
  | { kind: 'zip'; files: string[] }
  | { kind: 'github'; url: string; commitSha: string };

export function validateZipLayout(files: string[]) {
  if (!files.some((f) => f.endsWith('Cargo.toml'))) {
    throw new Error('Cargo.toml required in archive');
  }
}

export function parseGithubInput(url: string, commitSha: string): SourceInput {
  return { kind: 'github', url, commitSha };
}
