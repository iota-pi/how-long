import axios, { AxiosError } from 'axios';
import { FastifyPluginCallback } from 'fastify';
import secrets from '../.secrets';
import { getPassageId } from './books';

const api = axios.create({
  baseURL: 'https://api.scripture.api.bible/v1',
  headers: { 'api-key': secrets.bibleAPIKey },
});

interface Bible {
  name: string,
  id: string,
}
type BibleAbbrev = 'kjv' | 'asv';
const AVAILABLE_BIBLES: Record<BibleAbbrev, Bible> = {
  kjv: {
    name: 'KJV',
    id: 'de4e12af7f28f599-02',
  },
  asv: {
    name: 'ASV',
    id: '06125adad2d5898a-01',
  },
}
const DEFAULT_BIBLE = AVAILABLE_BIBLES['asv'];

function getURI(base: string, params?: { [name: string]: string | number | boolean }) {
  const paramEntries = Object.entries(params || {});
  const paramString = paramEntries.map(
    ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`,
  ).join('&');
  const joiner = paramString.length > 0 ? '?' : '';
  return base + joiner + paramString;
}

const routes: FastifyPluginCallback = (fastify, opts, next) => {
  fastify.get('/', async () => ({ ping: 'pong' }));

  fastify.get('/passage/:passage', async (request, reply) => {
    const passage = (request.params as { passage: string }).passage;
    if (passage.length > 100) {
      reply.code(400);
      return { success: false };
    }
    try {
      const passageId = getPassageId(passage);
      console.log(passageId);
      const uri = getURI(
        `/bibles/${DEFAULT_BIBLE.id}/passages/${passageId}`,
        {
          'content-type': 'text',
          'include-titles': false,
          'include-verse-numbers': false,
        },
      );
      const result = await api.get(uri);
      const content = result.data.data.content.trim();
      const words = content.split(/\s+/).length;
      return { success: true, words };
    } catch (error) {
      fastify.log.error({
        code: (error as AxiosError).code,
        request: (error as AxiosError).request,
        message: (error as AxiosError).message,
        data: (error as AxiosError).response?.data,
      });
      reply.code(500);
      return { success: false };
    }
  });

  next();
}

export default routes;
