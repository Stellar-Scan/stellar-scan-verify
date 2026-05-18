import type { FastifyInstance } from 'fastify';

export async function streamRoutes(app: FastifyInstance) {
  app.get('/verify/:jobId/stream', async (req, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
    });
    reply.raw.write('data: ' + JSON.stringify({ log: 'queued' }) + '\n\n');
    reply.raw.end();
  });
}
