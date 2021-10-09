import Fastify, { FastifyInstance } from 'fastify';
import cors from 'fastify-cors';
import routes from './routes';


function createServer() {
  const server: FastifyInstance = Fastify({
    logger: { level: 'warn' },
  });
  server.register(routes);
  server.register(cors, {
    origin: [
      /^https?:\/\/([^.]+\.)?how-long\.cross-code\.org$/,
      /^https?:\/\/localhost(:[0-9]+)?$/,
    ],
    methods: ['GET', 'PATCH', 'POST', 'PUT', 'DELETE'],
  });
  return server;
}

export default createServer;
