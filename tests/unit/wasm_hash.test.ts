import { describe, it, expect } from 'vitest';
import { wasmHash } from '../../src/comparator/wasm_hash.js';

describe('wasmHash', () => {
  it('hashes buffer', () => {
    expect(wasmHash(Buffer.from('x'))).toHaveLength(64);
  });
});
