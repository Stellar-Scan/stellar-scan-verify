import { describe, it, expect } from 'vitest';
import { validateZipLayout } from '../../src/pipeline/source_receiver.js';

describe('validateZipLayout', () => {
  it('requires Cargo.toml', () => {
    expect(() => validateZipLayout(['README.md'])).toThrow();
  });
});
