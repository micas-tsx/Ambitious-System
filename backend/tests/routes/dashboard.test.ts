import { describe, it, expect, beforeAll } from '@jest/globals';
import { createTestApp, createTestClient, registerAndLogin, authHeader } from '../helpers';
import { createBankAccountData, createBookData, createGoalData, createHobbyData, createAssessmentData, createNotebookData, createLessonData } from '../helpers';

const app = createTestApp();
const client = createTestClient(app);

describe('Dashboard Routes', () => {
  let auth: Awaited<ReturnType<typeof registerAndLogin>>;

  beforeAll(async () => {
    auth = await registerAndLogin(client);

    await client.post('/pessoal/contas', {
      headers: authHeader(auth.token),
      body: createBankAccountData(),
    });

    await client.post('/mente/livros', {
      headers: authHeader(auth.token),
      body: createBookData(),
    });

    const notebook = await client.post('/mente/cadernos', {
      headers: authHeader(auth.token),
      body: createNotebookData(),
    });
    const notebookId = (notebook.body as { id: string }).id;

    await client.post('/mente/aulas', {
      headers: authHeader(auth.token),
      body: { ...createLessonData(notebookId), status: 'COMPLETED' },
    });

    await client.post('/corpo/avaliacoes', {
      headers: authHeader(auth.token),
      body: createAssessmentData(),
    });

    await client.post('/alma/hobbies', {
      headers: authHeader(auth.token),
      body: createHobbyData(),
    });

    await client.post('/pessoal/metas', {
      headers: authHeader(auth.token),
      body: createGoalData(),
    });
  });

  describe('GET /dashboard/resumo', () => {
    it('deve retornar resumo agregado', async () => {
      const response = await client.get('/dashboard/resumo', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        pessoal: {
          totalBalance: expect.any(Number),
        },
        mente: {
          readingBooks: expect.any(Number),
          completedLessons: expect.any(Number),
        },
        corpo: {
          currentWeight: expect.any(Number),
        },
        alma: {
          hobbyCount: expect.any(Number),
        },
        timestamp: expect.any(String),
      });
    });

    it('deve retornar 401 sem autenticação', async () => {
      const response = await client.get('/dashboard/resumo');
      expect(response.status).toBe(401);
    });

    it('deve retornar 401 com token inválido', async () => {
      const response = await client.get('/dashboard/resumo', {
        headers: authHeader('invalid-token'),
      });
      expect(response.status).toBe(401);
    });

    it('deve conter dados corretos para recursos criados', async () => {
      const response = await client.get('/dashboard/resumo', {
        headers: authHeader(auth.token),
      });

      const body = response.body as {
        pessoal: { totalBalance: number };
        mente: { readingBooks: number; completedLessons: number };
        corpo: { currentWeight: number };
        alma: { hobbyCount: number };
      };

      expect(body.pessoal.totalBalance).toBeGreaterThan(0);
      expect(body.mente.readingBooks).toBeGreaterThanOrEqual(1);
      expect(body.mente.completedLessons).toBeGreaterThanOrEqual(1);
      expect(body.corpo.currentWeight).toBeGreaterThan(0);
      expect(body.alma.hobbyCount).toBeGreaterThanOrEqual(1);
    });
  });
});
