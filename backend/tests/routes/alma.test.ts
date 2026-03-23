import { describe, it, expect, beforeAll } from '@jest/globals';
import { createTestApp, createTestClient, registerAndLogin, authHeader } from '../helpers';
import { createHobbyData, createBrainstormData } from '../helpers';

const app = createTestApp();
const client = createTestClient(app);

describe('Alma Routes', () => {
  let auth: Awaited<ReturnType<typeof registerAndLogin>>;

  beforeAll(async () => {
    auth = await registerAndLogin(client);
  });

  describe('GET /alma/hobbies', () => {
    it('deve listar hobbies do usuário', async () => {
      const response = await client.get('/alma/hobbies', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve retornar 401 sem autenticação', async () => {
      const response = await client.get('/alma/hobbies');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /alma/hobbies', () => {
    it('deve criar hobby', async () => {
      const data = createHobbyData();

      const response = await client.post('/alma/hobbies', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: data.name,
        userId: auth.userId,
      });
    });
  });

  describe('PATCH /alma/hobbies/:id', () => {
    it('deve atualizar hobby', async () => {
      const createResponse = await client.post('/alma/hobbies', {
        headers: authHeader(auth.token),
        body: createHobbyData(),
      });
      const hobbyId = (createResponse.body as { id: string }).id;

      const response = await client.patch(`/alma/hobbies/${hobbyId}`, {
        headers: authHeader(auth.token),
        body: { name: 'Hobby Atualizado', schedule: 'Novo Horário' },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'Hobby Atualizado',
      });
    });
  });

  describe('DELETE /alma/hobbies/:id', () => {
    it('deve deletar hobby', async () => {
      const createResponse = await client.post('/alma/hobbies', {
        headers: authHeader(auth.token),
        body: createHobbyData(),
      });
      const hobbyId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/alma/hobbies/${hobbyId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /alma/brainstorm', () => {
    it('deve listar notas de brainstorm', async () => {
      const response = await client.get('/alma/brainstorm', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /alma/brainstorm', () => {
    it('deve criar nota de brainstorm', async () => {
      const data = createBrainstormData();

      const response = await client.post('/alma/brainstorm', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        content: data.content,
        userId: auth.userId,
      });
    });
  });

  describe('PATCH /alma/brainstorm/:id', () => {
    it('deve atualizar nota de brainstorm', async () => {
      const createResponse = await client.post('/alma/brainstorm', {
        headers: authHeader(auth.token),
        body: createBrainstormData(),
      });
      const noteId = (createResponse.body as { id: string }).id;

      const response = await client.patch(`/alma/brainstorm/${noteId}`, {
        headers: authHeader(auth.token),
        body: { content: 'Conteúdo atualizado' },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        content: 'Conteúdo atualizado',
      });
    });
  });

  describe('DELETE /alma/brainstorm/:id', () => {
    it('deve deletar nota de brainstorm', async () => {
      const createResponse = await client.post('/alma/brainstorm', {
        headers: authHeader(auth.token),
        body: createBrainstormData(),
      });
      const noteId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/alma/brainstorm/${noteId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });
});
