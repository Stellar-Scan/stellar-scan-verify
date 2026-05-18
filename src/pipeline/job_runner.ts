import { compareHashes } from '../comparator/compare.js';
import { fetchOnChainHash } from '../comparator/hash_fetcher.js';
import { markSuccess, setStatus } from './job_status.js';

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

export async function runJob(opts: { jobId: string; rpcUrl: string; contractId: string; builtHash: string }) {
  setStatus(opts.jobId, 'running');
  const onChain = await retry(() => fetchOnChainHash(opts.rpcUrl, opts.contractId));
  const result = compareHashes(onChain, opts.builtHash);
  if (result.match) markSuccess(opts.jobId, result);
  else setStatus(opts.jobId, 'failed', result);
  return result;
}
