import { compareHashes } from '../comparator/compare.js';
import { fetchOnChainHash } from '../comparator/hash_fetcher.js';

export async function runJob(opts: { rpcUrl: string; contractId: string; builtHash: string }) {
  const onChain = await fetchOnChainHash(opts.rpcUrl, opts.contractId);
  return compareHashes(onChain, opts.builtHash);
}
