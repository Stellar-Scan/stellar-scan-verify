import { Queue } from 'bullmq';

export function createQueue(redisUrl: string) {
  return new Queue('verify-jobs', { connection: { url: redisUrl } });
}
