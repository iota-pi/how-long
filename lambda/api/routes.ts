import { FastifyPluginCallback } from 'fastify';
import { countWords, getPassageText, parsePassage } from './local-bible';

const routes: FastifyPluginCallback = (fastify, opts, next) => {
  fastify.get('/', async () => ({ ping: 'pong' }));

  fastify.get('/passage/:passage', async (request, reply) => {
    const passage = (request.params as { passage: string }).passage;
    const ref = parsePassage(passage);
    if (!ref) {
      reply.code(400);
      return { success: false, message: 'Could not parse passage reference' };
    }
    try {
      const text = getPassageText(ref)
      const words = countWords(text);
      return {
        passage: ref,
        success: true,
        words,
      };
    } catch (error) {
      fastify.log.error({});
      reply.code(500);
      return { success: false };
    }
  });

  next();
}

export default routes;
