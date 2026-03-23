import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { authRoutes } from '../src/routes/auth.routes';
import { pessoalRoutes } from '../src/routes/pessoal.routes';
import { menteRoutes } from '../src/routes/mente.routes';
import { corpoRoutes } from '../src/routes/corpo.routes';
import { almaRoutes } from '../src/routes/alma.routes';
import { dashboardRoutes } from '../src/routes/dashboard.routes';

export function createTestApp() {
  return new Elysia()
    .use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }))
    .use(authRoutes)
    .use(pessoalRoutes)
    .use(menteRoutes)
    .use(corpoRoutes)
    .use(almaRoutes)
    .use(dashboardRoutes);
}
