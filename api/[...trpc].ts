import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../backend/trpc/app-router';
import { createContext } from '../backend/trpc/create-context';

export default async function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: '/api',
    req,
    router: appRouter,
    createContext: (opts) => createContext(opts),
  });
}

export const config = {
  runtime: 'edge',
};