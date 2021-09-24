import { FastifyPluginCallback } from 'fastify';


const routes: FastifyPluginCallback = (fastify, opts, next) => {
  fastify.get('/', async () => ({ ping: 'pong' }));

  fastify.get('/passage/:passage', async (request, reply) => {
    const passage = (request.params as { passage: string }).passage;
    if (passage.length > 100) {
      reply.code(400);
      return { success: false };
    }
    try {
      return { success: true, words: 123 };
    } catch (error) {
      fastify.log.error(error);
      reply.code(404);
      return { success: false };
    }
  });

  next();
}

export default routes;
