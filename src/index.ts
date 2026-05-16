import Fastify from 'fastify';
import { log } from './utils/logger.js';
import { pool } from './storage/db.js';
import { VerificationRepo } from './storage/verification_repo.js';
import { createQueue } from './pipeline/job_queue.js';
import { getStatus, setStatus } from './pipeline/job_status.js';
import { verifyBody } from './utils/validators.js';

const logger = log(process.env.LOG_LEVEL ?? 'info');
const app = Fastify({ logger });
const db = pool(process.env.DATABASE_URL ?? '');
const repo = new VerificationRepo(db);
const queue = createQueue(process.env.REDIS_URL ?? 'redis://localhost:6379');

app.get('/health', async () => ({ status: 'ok' }));

app.post('/verify', async (req, reply) => {
  const body = verifyBody.parse(req.body);
  const jobId = 'verify_' + String(Date.now());
  setStatus(jobId, 'queued');
  await queue.add('verify', { ...body, jobId });
  return reply.status(202).send({ jobId, status: 'queued', statusUrl: '/verify/' + jobId });
});

app.get('/verify/:jobId', async (req) => {
  const { jobId } = req.params as { jobId: string };
  return getStatus(jobId) ?? { status: 'unknown' };
});

const port = Number(process.env.PORT ?? 3003);
await app.listen({ port, host: '0.0.0.0' });
void repo;
