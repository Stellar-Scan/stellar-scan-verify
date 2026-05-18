import { z } from 'zod';

export const verifyBody = z.object({
  contractId: z.string().min(1),
  network: z.enum(['testnet', 'mainnet', 'futurenet']),
  rustVersion: z.string().optional(),
});
