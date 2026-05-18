import { describe, it, expect } from 'vitest';
import { compareHashes } from '../../src/comparator/compare.js';

describe('compareHashes', () => {
  it('matches equal hashes', () => {
    const r = compareHashes('abc', 'abc');
    expect(r.match).toBe(true);
  });
});
