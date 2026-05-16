export async function fetchOnChainHash(rpcUrl: string, contractId: string) {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getContractWasm', params: { contractId } }),
  });
  const json = (await res.json()) as { result?: { wasm?: string } };
  const wasm = json.result?.wasm;
  if (!wasm) throw new Error('wasm missing');
  const { wasmHash } = await import('./wasm_hash.js');
  return wasmHash(Buffer.from(wasm, 'base64'));
}
