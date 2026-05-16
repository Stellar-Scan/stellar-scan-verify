import { compareHashes } from '../comparator/compare.js';
import { fetchOnChainHash } from '../comparator/hash_fetcher.js';

async function retry<T>(fn: () => Promise<T>, times = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

export async function runJob(opts: { rpcUrl: string; contractId: string; builtHash: string }) {
  const onChain = await retry(() => fetchOnChainHash(opts.rpcUrl, opts.contractId));
  return compareHashes(onChain, opts.builtHash);
}
