import { describe, it, expect, beforeAll } from '@jest/globals';
import { createTestApp, createTestClient, registerAndLogin, authHeader } from '../helpers';
import { createAssessmentData, createWorkoutData, createExerciseData, createMealData, createFoodData, createRecipeData, createHydrationData } from '../helpers';

const app = createTestApp();
const client = createTestClient(app);

describe('Corpo Routes', () => {
  let auth: Awaited<ReturnType<typeof registerAndLogin>>;
  let workoutId: string;
  let foodId: string;
  let mealId: string;

  beforeAll(async () => {
    auth = await registerAndLogin(client);

    const workoutResponse = await client.post('/corpo/treinos', {
      headers: authHeader(auth.token),
      body: createWorkoutData(),
    });
    workoutId = (workoutResponse.body as { id: string }).id;

    const foodResponse = await client.post('/corpo/alimentos', {
      headers: authHeader(auth.token),
      body: createFoodData(),
    });
    foodId = (foodResponse.body as { id: string }).id;

    const mealResponse = await client.post('/corpo/refeicoes', {
      headers: authHeader(auth.token),
      body: createMealData(),
    });
    mealId = (mealResponse.body as { id: string }).id;
  });

  describe('GET /corpo/avaliacoes', () => {
    it('deve listar avaliações físicas', async () => {
      const response = await client.get('/corpo/avaliacoes', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve retornar 401 sem autenticação', async () => {
      const response = await client.get('/corpo/avaliacoes');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /corpo/avaliacoes', () => {
    it('deve criar avaliação física', async () => {
      const data = createAssessmentData();

      const response = await client.post('/corpo/avaliacoes', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        weight: data.weight,
        goal: data.goal,
        userId: auth.userId,
      });
    });
  });

  describe('DELETE /corpo/avaliacoes/:id', () => {
    it('deve deletar avaliação', async () => {
      const createResponse = await client.post('/corpo/avaliacoes', {
        headers: authHeader(auth.token),
        body: createAssessmentData(),
      });
      const assessmentId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/corpo/avaliacoes/${assessmentId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /corpo/treinos', () => {
    it('deve listar rotinas de treino', async () => {
      const response = await client.get('/corpo/treinos', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect((response.body as Array<unknown>).length).toBeGreaterThan(0);
    });
  });

  describe('POST /corpo/treinos', () => {
    it('deve criar rotina de treino', async () => {
      const data = createWorkoutData();

      const response = await client.post('/corpo/treinos', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: data.name,
        weekday: data.weekday,
        userId: auth.userId,
      });
    });
  });

  describe('PATCH /corpo/treinos/:id', () => {
    it('deve atualizar rotina', async () => {
      const response = await client.patch(`/corpo/treinos/${workoutId}`, {
        headers: authHeader(auth.token),
        body: { name: 'Treino Atualizado' },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'Treino Atualizado',
      });
    });
  });

  describe('DELETE /corpo/treinos/:id', () => {
    it('deve deletar rotina', async () => {
      const createResponse = await client.post('/corpo/treinos', {
        headers: authHeader(auth.token),
        body: createWorkoutData(),
      });
      const newWorkoutId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/corpo/treinos/${newWorkoutId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /corpo/treinos/:id/exercicios', () => {
    it('deve adicionar exercício', async () => {
      const data = createExerciseData();

      const response = await client.post(`/corpo/treinos/${workoutId}/exercicios`, {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        routineId: workoutId,
        name: data.name,
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
      });
    });
  });

  describe('PATCH /corpo/exercicios/:id', () => {
    it('deve atualizar exercício', async () => {
      const createResponse = await client.post(`/corpo/treinos/${workoutId}/exercicios`, {
        headers: authHeader(auth.token),
        body: createExerciseData(),
      });
      const exerciseId = (createResponse.body as { id: string }).id;

      const response = await client.patch(`/corpo/exercicios/${exerciseId}`, {
        headers: authHeader(auth.token),
        body: { sets: 5, reps: 10 },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        sets: 5,
        reps: 10,
      });
    });
  });

  describe('DELETE /corpo/exercicios/:id', () => {
    it('deve remover exercício', async () => {
      const createResponse = await client.post(`/corpo/treinos/${workoutId}/exercicios`, {
        headers: authHeader(auth.token),
        body: createExerciseData(),
      });
      const exerciseId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/corpo/exercicios/${exerciseId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /corpo/refeicoes', () => {
    it('deve listar refeições', async () => {
      const response = await client.get('/corpo/refeicoes', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect((response.body as Array<unknown>).length).toBeGreaterThan(0);
    });
  });

  describe('POST /corpo/refeicoes', () => {
    it('deve criar refeição', async () => {
      const data = createMealData();

      const response = await client.post('/corpo/refeicoes', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: data.name,
        time: data.time,
        userId: auth.userId,
      });
    });
  });

  describe('PATCH /corpo/refeicoes/:id', () => {
    it('deve atualizar refeição', async () => {
      const response = await client.patch(`/corpo/refeicoes/${mealId}`, {
        headers: authHeader(auth.token),
        body: { name: 'Refeição Atualizada' },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'Refeição Atualizada',
      });
    });
  });

  describe('POST /corpo/refeicoes/:id/itens', () => {
    it('deve adicionar item à refeição', async () => {
      const response = await client.post(`/corpo/refeicoes/${mealId}/itens`, {
        headers: authHeader(auth.token),
        body: { foodId, amountInGrams: 150 },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        mealId,
        foodId,
        amountInGrams: 150,
      });
    });
  });

  describe('PATCH /corpo/refeicoes/itens/:id', () => {
    it('deve atualizar item da refeição', async () => {
      const createResponse = await client.post(`/corpo/refeicoes/${mealId}/itens`, {
        headers: authHeader(auth.token),
        body: { foodId, amountInGrams: 100 },
      });
      const itemId = (createResponse.body as { id: string }).id;

      const response = await client.patch(`/corpo/refeicoes/itens/${itemId}`, {
        headers: authHeader(auth.token),
        body: { amountInGrams: 200 },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        amountInGrams: 200,
      });
    });
  });

  describe('DELETE /corpo/refeicoes/itens/:id', () => {
    it('deve remover item da refeição', async () => {
      const createResponse = await client.post(`/corpo/refeicoes/${mealId}/itens`, {
        headers: authHeader(auth.token),
        body: { foodId, amountInGrams: 100 },
      });
      const itemId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/corpo/refeicoes/itens/${itemId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /corpo/refeicoes/:id', () => {
    it('deve deletar refeição', async () => {
      const createResponse = await client.post('/corpo/refeicoes', {
        headers: authHeader(auth.token),
        body: createMealData(),
      });
      const newMealId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/corpo/refeicoes/${newMealId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /corpo/alimentos', () => {
    it('deve listar alimentos', async () => {
      const response = await client.get('/corpo/alimentos', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /corpo/alimentos', () => {
    it('deve criar alimento', async () => {
      const data = createFoodData();

      const response = await client.post('/corpo/alimentos', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fats: data.fats,
      });
    });
  });

  describe('PATCH /corpo/alimentos/:id', () => {
    it('deve atualizar alimento', async () => {
      const response = await client.patch(`/corpo/alimentos/${foodId}`, {
        headers: authHeader(auth.token),
        body: { calories: 500 },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        calories: 500,
      });
    });
  });

  describe('DELETE /corpo/alimentos/:id', () => {
    it('deve remover alimento', async () => {
      const createResponse = await client.post('/corpo/alimentos', {
        headers: authHeader(auth.token),
        body: createFoodData(),
      });
      const newFoodId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/corpo/alimentos/${newFoodId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /corpo/receitas', () => {
    it('deve listar receitas', async () => {
      const response = await client.get('/corpo/receitas', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /corpo/receitas', () => {
    it('deve criar receita', async () => {
      const data = createRecipeData();

      const response = await client.post('/corpo/receitas', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: data.name,
      });
    });
  });

  describe('PATCH /corpo/receitas/:id', () => {
    it('deve atualizar receita', async () => {
      const createResponse = await client.post('/corpo/receitas', {
        headers: authHeader(auth.token),
        body: createRecipeData(),
      });
      const recipeId = (createResponse.body as { id: string }).id;

      const response = await client.patch(`/corpo/receitas/${recipeId}`, {
        headers: authHeader(auth.token),
        body: { name: 'Receita Atualizada' },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'Receita Atualizada',
      });
    });
  });

  describe('DELETE /corpo/receitas/:id', () => {
    it('deve remover receita', async () => {
      const createResponse = await client.post('/corpo/receitas', {
        headers: authHeader(auth.token),
        body: createRecipeData(),
      });
      const recipeId = (createResponse.body as { id: string }).id;

      const response = await client.delete(`/corpo/receitas/${recipeId}`, {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /corpo/hidratacao', () => {
    it('deve obter consumo de água do dia', async () => {
      const response = await client.get('/corpo/hidratacao', {
        headers: authHeader(auth.token),
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        consumed: expect.any(Number),
        goal: 3500,
        intakes: expect.any(Array),
      });
    });
  });

  describe('POST /corpo/hidratacao', () => {
    it('deve registrar consumo de água', async () => {
      const data = createHydrationData();

      const response = await client.post('/corpo/hidratacao', {
        headers: authHeader(auth.token),
        body: data,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        intake: {
          id: expect.any(String),
          amount: data.amount,
          userId: auth.userId,
        },
        consumed: expect.any(Number),
      });
    });
  });
});
