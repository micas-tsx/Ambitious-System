import { describe, it, expect, beforeAll } from '@jest/globals';
import { createTestApp, createTestClient, registerAndLogin, authHeader } from '../helpers';
import { createBankAccountData, createTransactionData, createCreditCardData, createTaskData, createGoalData, createJournalEntryData } from '../helpers';

const app = createTestApp();
const client = createTestClient(app);

describe('Pessoal Routes', () => {
  let auth: Awaited<ReturnType<typeof registerAndLogin>>;
  let testAccountId: string;

  beforeAll(async () => {
    auth = await registerAndLogin(client);

    const accountResponse = await client.post('/pessoal/contas', {
      headers: authHeader(auth.token),
      body: createBankAccountData(),
    });
    testAccountId = (accountResponse.body as { id: string }).id;
  });

  describe('GET /pessoal/contas', () => {
    it('deve listar contas do usuário', async () => {
      const response = await client.get('/pessoal/contas', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect((response.body as Array<unknown>).length).toBeGreaterThan(0);
    });

    it('deve retornar 401 sem autenticação', async () => {
      const response = await client.get('/pessoal/contas');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /pessoal/contas', () => {
    it('deve criar nova conta', async () => {
      const data = createBankAccountData();
      const response = await client.post('/pessoal/contas', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: data.name,
        balance: data.balance,
        userId: auth.userId,
      });
    });

    it('deve retornar erro para dados inválidos', async () => {
      const response = await client.post('/pessoal/contas', {
        headers: authHeader(auth.token),
        body: { name: '' },
      });

      expect(response.status).toBe(422);
    });
  });

  describe('PATCH /pessoal/contas/:id', () => {
    it('deve atualizar conta', async () => {
      const response = await client.patch(`/pessoal/contas/${testAccountId}`, {
        headers: authHeader(auth.token),
        body: { name: 'Conta Atualizada', balance: 9999 },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'Conta Atualizada',
        balance: 9999,
      });
    });
  });

  describe('DELETE /pessoal/contas/:id', () => {
    it('deve deletar conta', async () => {
      const createResponse = await client.post('/pessoal/contas', {
        headers: authHeader(auth.token),
        body: createBankAccountData(),
      });
      const newAccountId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/pessoal/contas/${newAccountId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /pessoal/transacoes', () => {
    it('deve listar transações', async () => {
      const response = await client.get('/pessoal/transacoes', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /pessoal/transacoes', () => {
    it('deve criar transação INCOME', async () => {
      const data = createTransactionData(testAccountId, 'INCOME');

      const response = await client.post('/pessoal/transacoes', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        accountId: testAccountId,
        type: 'INCOME',
        amount: data.amount,
        category: data.category,
      });
    });

    it('deve criar transação EXPENSE', async () => {
      const data = createTransactionData(testAccountId);
      data.type = 'EXPENSE';

      const response = await client.post('/pessoal/transacoes', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        type: 'EXPENSE',
      });
    });
  });

  describe('DELETE /pessoal/transacoes/:id', () => {
    it('deve deletar transação', async () => {
      const createResponse = await client.post('/pessoal/transacoes', {
        headers: authHeader(auth.token),
        body: createTransactionData(testAccountId),
      });
      const transactionId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/pessoal/transacoes/${transactionId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /pessoal/cartoes', () => {
    it('deve listar cartões', async () => {
      const response = await client.get('/pessoal/cartoes', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /pessoal/cartoes', () => {
    it('deve criar cartão de crédito', async () => {
      const data = createCreditCardData(testAccountId);

      const response = await client.post('/pessoal/cartoes', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        accountId: testAccountId,
        name: data.name,
        limit: data.limit,
        invoiceDate: data.invoiceDate,
      });
    });
  });

  describe('PATCH /pessoal/cartoes/:id', () => {
    it('deve atualizar cartão', async () => {
      const createResponse = await client.post('/pessoal/cartoes', {
        headers: authHeader(auth.token),
        body: createCreditCardData(testAccountId),
      });
      const cardId = (createResponse.body as { id: string }).id;

      const response = await client.patch(`/pessoal/cartoes/${cardId}`, {
        headers: authHeader(auth.token),
        body: { name: 'Novo Nome', limit: 10000 },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'Novo Nome',
        limit: 10000,
      });
    });
  });

  describe('DELETE /pessoal/cartoes/:id', () => {
    it('deve deletar cartão', async () => {
      const createResponse = await client.post('/pessoal/cartoes', {
        headers: authHeader(auth.token),
        body: createCreditCardData(testAccountId),
      });
      const cardId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/pessoal/cartoes/${cardId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /pessoal/notas', () => {
    it('deve listar entradas do diário', async () => {
      const response = await client.get('/pessoal/notas', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /pessoal/notas', () => {
    it('deve criar entrada no diário', async () => {
      const data = createJournalEntryData();

      const response = await client.post('/pessoal/notas', {
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

  describe('POST /pessoal/tasks', () => {
    it('deve criar tarefa', async () => {
      const data = createTaskData();

      const response = await client.post('/pessoal/tasks', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: data.title,
        category: data.category,
        isCompleted: false,
      });
    });
  });

  describe('PATCH /pessoal/tasks/:id', () => {
    it('deve marcar tarefa como completa', async () => {
      const createResponse = await client.post('/pessoal/tasks', {
        headers: authHeader(auth.token),
        body: createTaskData(),
      });
      const taskId = (createResponse.body as { id: string }).id;

      const response = await client.patch(`/pessoal/tasks/${taskId}`, {
        headers: authHeader(auth.token),
        body: { isCompleted: true },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        isCompleted: true,
      });
    });

    it('deve atualizar rating da tarefa', async () => {
      const createResponse = await client.post('/pessoal/tasks', {
        headers: authHeader(auth.token),
        body: createTaskData(),
      });
      const taskId = (createResponse.body as { id: string }).id;

      const response = await client.patch(`/pessoal/tasks/${taskId}`, {
        headers: authHeader(auth.token),
        body: { rating: 5 },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        rating: 5,
      });
    });
  });

  describe('DELETE /pessoal/tasks/:id', () => {
    it('deve deletar tarefa', async () => {
      const createResponse = await client.post('/pessoal/tasks', {
        headers: authHeader(auth.token),
        body: createTaskData(),
      });
      const taskId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/pessoal/tasks/${taskId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /pessoal/metas', () => {
    it('deve listar metas', async () => {
      const response = await client.get('/pessoal/metas', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /pessoal/metas', () => {
    it('deve criar meta', async () => {
      const data = createGoalData();

      const response = await client.post('/pessoal/metas', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: data.title,
        status: 'TODO',
        userId: auth.userId,
      });
    });
  });

  describe('PATCH /pessoal/metas/:id', () => {
    it('deve mover meta para DOING', async () => {
      const createResponse = await client.post('/pessoal/metas', {
        headers: authHeader(auth.token),
        body: createGoalData(),
      });
      const goalId = (createResponse.body as { id: string }).id;

      const response = await client.patch(`/pessoal/metas/${goalId}`, {
        headers: authHeader(auth.token),
        body: { status: 'DOING' },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'DOING',
      });
    });

    it('deve mover meta para DONE', async () => {
      const createResponse = await client.post('/pessoal/metas', {
        headers: authHeader(auth.token),
        body: createGoalData(),
      });
      const goalId = (createResponse.body as { id: string }).id;

      const response = await client.patch(`/pessoal/metas/${goalId}`, {
        headers: authHeader(auth.token),
        body: { status: 'DONE' },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'DONE',
      });
    });
  });

  describe('DELETE /pessoal/metas/:id', () => {
    it('deve deletar meta', async () => {
      const createResponse = await client.post('/pessoal/metas', {
        headers: authHeader(auth.token),
        body: createGoalData(),
      });
      const goalId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/pessoal/metas/${goalId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });
});
