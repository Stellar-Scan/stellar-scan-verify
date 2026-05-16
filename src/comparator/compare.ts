export type MatchResult = { match: boolean; expected: string; actual: string };

export function compareHashes(expected: string, actual: string): MatchResult {
  const match = expected.toLowerCase() === actual.toLowerCase();
  return { match, expected, actual };
}
