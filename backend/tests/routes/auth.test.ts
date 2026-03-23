import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createTestApp, createTestClient, createTestUser, authHeader } from '../helpers';

const app = createTestApp();
const client = createTestClient(app);

describe('Auth Routes', () => {
  let testUser: ReturnType<typeof createTestUser>;

  beforeAll(() => {
    testUser = createTestUser();
  });

  describe('POST /auth/register', () => {
    it('deve criar usuário com dados válidos', async () => {
      const response = await client.post('/auth/register', {
        body: testUser,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Usuário criado com sucesso',
        user: {
          id: expect.any(String),
          name: testUser.name,
          email: testUser.email,
        },
      });
    });

    it('deve retornar erro 400 para email duplicado', async () => {
      const response = await client.post('/auth/register', {
        body: testUser,
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Email já cadastrado',
      });
    });

    it('deve retornar erro para email inválido', async () => {
      const response = await client.post('/auth/register', {
        body: {
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        },
      });

      expect(response.status).toBe(422);
    });

    it('deve retornar erro para senha curta', async () => {
      const response = await client.post('/auth/register', {
        body: {
          name: 'Test User',
          email: 'another@test.com',
          password: '123',
        },
      });

      expect(response.status).toBe(422);
    });

    it('deve retornar erro para nome vazio', async () => {
      const response = await client.post('/auth/register', {
        body: {
          name: '',
          email: 'another@test.com',
          password: 'password123',
        },
      });

      expect(response.status).toBe(422);
    });
  });

  describe('POST /auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const response = await client.post('/auth/login', {
        body: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Login bem sucedido',
        token: expect.any(String),
        user: {
          id: expect.any(String),
          name: testUser.name,
          email: testUser.email,
        },
      });
    });

    it('deve retornar erro 401 para usuário não existente', async () => {
      const response = await client.post('/auth/login', {
        body: {
          email: 'nonexistent@test.com',
          password: 'password123',
        },
      });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: 'Credenciais inválidas',
      });
    });

    it('deve retornar erro 401 para senha errada', async () => {
      const response = await client.post('/auth/login', {
        body: {
          email: testUser.email,
          password: 'wrongpassword',
        },
      });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: 'Credenciais inválidas',
      });
    });

    it('deve retornar erro para email inválido', async () => {
      const response = await client.post('/auth/login', {
        body: {
          email: 'invalid-email',
          password: 'password123',
        },
      });

      expect(response.status).toBe(422);
    });
  });

  describe('GET /auth/me', () => {
    let token: string;

    beforeAll(async () => {
      const loginResponse = await client.post('/auth/login', {
        body: {
          email: testUser.email,
          password: testUser.password,
        },
      });
      token = (loginResponse.body as { token: string }).token;
    });

    it('deve retornar dados do usuário autenticado', async () => {
      const response = await client.get('/auth/me', {
        headers: authHeader(token),
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: testUser.email,
        name: testUser.name,
        createdAt: expect.any(String),
      });
    });

    it('deve retornar erro 401 sem token', async () => {
      const response = await client.get('/auth/me');

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 401 com token inválido', async () => {
      const response = await client.get('/auth/me', {
        headers: authHeader('invalid-token'),
      });

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 401 sem Bearer prefix', async () => {
      const response = await client.get('/auth/me', {
        headers: { Authorization: token },
      });

      expect(response.status).toBe(401);
    });
  });
});
