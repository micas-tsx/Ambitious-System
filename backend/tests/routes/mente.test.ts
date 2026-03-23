import { describe, it, expect, beforeAll } from '@jest/globals';
import { createTestApp, createTestClient, registerAndLogin, authHeader } from '../helpers';
import { createNotebookData, createLessonData, createFlashcardData, createBookData } from '../helpers';

const app = createTestApp();
const client = createTestClient(app);

describe('Mente Routes', () => {
  let auth: Awaited<ReturnType<typeof registerAndLogin>>;
  let notebookId: string;

  beforeAll(async () => {
    auth = await registerAndLogin(client);

    const notebookResponse = await client.post('/mente/cadernos', {
      headers: authHeader(auth.token),
      body: createNotebookData(),
    });
    notebookId = (notebookResponse.body as { id: string }).id;
  });

  describe('GET /mente/cadernos', () => {
    it('deve listar cadernos do usuário', async () => {
      const response = await client.get('/mente/cadernos', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect((response.body as Array<unknown>).length).toBeGreaterThan(0);
    });

    it('deve retornar 401 sem autenticação', async () => {
      const response = await client.get('/mente/cadernos');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /mente/cadernos', () => {
    it('deve criar caderno', async () => {
      const data = createNotebookData();

      const response = await client.post('/mente/cadernos', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: data.title,
        userId: auth.userId,
      });
    });
  });

  describe('DELETE /mente/cadernos/:id', () => {
    it('deve deletar caderno', async () => {
      const createResponse = await client.post('/mente/cadernos', {
        headers: authHeader(auth.token),
        body: createNotebookData(),
      });
      const newNotebookId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/mente/cadernos/${newNotebookId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /mente/aulas', () => {
    it('deve listar todas as aulas', async () => {
      const response = await client.get('/mente/aulas', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /mente/aulas', () => {
    it('deve criar aula', async () => {
      const data = createLessonData(notebookId);

      const response = await client.post('/mente/aulas', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        notebookId: notebookId,
        name: data.name,
        status: 'NOT_STARTED',
      });
    });

    it('deve retornar erro 404 para caderno inexistente', async () => {
      const data = createLessonData('non-existent-id');

      const response = await client.post('/mente/aulas', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: 'Caderno não encontrado',
      });
    });
  });

  describe('PATCH /mente/aulas/:id', () => {
    it('deve marcar aula como completa', async () => {
      const createResponse = await client.post('/mente/aulas', {
        headers: authHeader(auth.token),
        body: createLessonData(notebookId),
      });
      const lessonId = (createResponse.body as { id: string }).id;

      const response = await client.patch(`/mente/aulas/${lessonId}`, {
        headers: authHeader(auth.token),
        body: { status: 'COMPLETED' },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'COMPLETED',
      });
    });

    it('deve atualizar nome da aula', async () => {
      const createResponse = await client.post('/mente/aulas', {
        headers: authHeader(auth.token),
        body: createLessonData(notebookId),
      });
      const lessonId = (createResponse.body as { id: string }).id;

      const response = await client.patch(`/mente/aulas/${lessonId}`, {
        headers: authHeader(auth.token),
        body: { name: 'Aula Renomeada' },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'Aula Renomeada',
      });
    });
  });

  describe('DELETE /mente/aulas/:id', () => {
    it('deve deletar aula', async () => {
      const createResponse = await client.post('/mente/aulas', {
        headers: authHeader(auth.token),
        body: createLessonData(notebookId),
      });
      const lessonId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/mente/aulas/${lessonId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /mente/livros', () => {
    it('deve listar livros', async () => {
      const response = await client.get('/mente/livros', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /mente/livros', () => {
    it('deve adicionar livro', async () => {
      const data = createBookData();

      const response = await client.post('/mente/livros', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: data.title,
        author: data.author,
        status: data.status,
        userId: auth.userId,
      });
    });
  });

  describe('PATCH /mente/livros/:id', () => {
    it('deve atualizar status do livro', async () => {
      const createResponse = await client.post('/mente/livros', {
        headers: authHeader(auth.token),
        body: createBookData(),
      });
      const bookId = (createResponse.body as { id: string }).id;

      const response = await client.patch(`/mente/livros/${bookId}`, {
        headers: authHeader(auth.token),
        body: { status: 'FINISHED' },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'FINISHED',
      });
    });

    it('deve atualizar autor do livro', async () => {
      const createResponse = await client.post('/mente/livros', {
        headers: authHeader(auth.token),
        body: createBookData(),
      });
      const bookId = (createResponse.body as { id: string }).id;

      const response = await client.patch(`/mente/livros/${bookId}`, {
        headers: authHeader(auth.token),
        body: { author: 'Novo Autor' },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        author: 'Novo Autor',
      });
    });
  });

  describe('DELETE /mente/livros/:id', () => {
    it('deve remover livro', async () => {
      const createResponse = await client.post('/mente/livros', {
        headers: authHeader(auth.token),
        body: createBookData(),
      });
      const bookId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/mente/livros/${bookId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /mente/flashcards/pending', () => {
    it('deve listar flashcards pendentes', async () => {
      const response = await client.get('/mente/flashcards/pending', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /mente/flashcards', () => {
    it('deve criar flashcard', async () => {
      const data = createFlashcardData(notebookId);

      const response = await client.post('/mente/flashcards', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        notebookId: notebookId,
        front: data.front,
        back: data.back,
        interval: 0,
        ease: 2.5,
      });
    });
  });

  describe('POST /mente/flashcards/:id/review', () => {
    it('deve revisar flashcard com qualidade alta', async () => {
      const createResponse = await client.post('/mente/flashcards', {
        headers: authHeader(auth.token),
        body: createFlashcardData(notebookId),
      });
      const flashcardId = (createResponse.body as { id: string }).id;

      const response = await client.post(`/mente/flashcards/${flashcardId}/review`, {
        headers: authHeader(auth.token),
        body: { quality: 5 },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        interval: expect.any(Number),
        ease: expect.any(Number),
        nextReview: expect.any(String),
      });
    });

    it('deve revisar flashcard com qualidade baixa (reset)', async () => {
      const createResponse = await client.post('/mente/flashcards', {
        headers: authHeader(auth.token),
        body: createFlashcardData(notebookId),
      });
      const flashcardId = (createResponse.body as { id: string }).id;

      const response = await client.post(`/mente/flashcards/${flashcardId}/review`, {
        headers: authHeader(auth.token),
        body: { quality: 1 },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        interval: 1,
      });
    });
  });

  describe('DELETE /mente/flashcards/:id', () => {
    it('deve deletar flashcard', async () => {
      const createResponse = await client.post('/mente/flashcards', {
        headers: authHeader(auth.token),
        body: createFlashcardData(notebookId),
      });
      const flashcardId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/mente/flashcards/${flashcardId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });
});
