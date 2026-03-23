import { Elysia, t } from "elysia";
import { prisma } from "../db/prisma";
import { isAuthenticated } from "../middleware/auth";

export const corpoRoutes = new Elysia({ prefix: "/corpo" })
  .use(isAuthenticated)

  // === AVALIAÇÕES FÍSICAS ===
  .get("/avaliacoes", async ({ userId }) => {
    return await prisma.physicalAssessment.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
  }, {
    detail: {
      tags: ["Corpo"],
      summary: "Listar avaliações físicas",
      description: "Retorna o histórico de avaliações físicas ordenadas por data.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de avaliações", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/PhysicalAssessment" } } } } },
      },
    },
  })
  .post("/avaliacoes", async ({ userId, body }) => {
    const { weight, bodyFat, muscleMass, goal } = body;
    return await prisma.physicalAssessment.create({
      data: { weight, bodyFat, muscleMass, goal, userId },
    });
  }, {
    body: t.Object({
      weight: t.Number(),
      bodyFat: t.Optional(t.Number()),
      muscleMass: t.Optional(t.Number()),
      goal: t.String(),
    }),
    detail: {
      tags: ["Corpo"],
      summary: "Criar avaliação física",
      description: "Registra uma nova avaliação física com medidas corporais.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["weight", "goal"],
              properties: {
                weight: { type: "number" },
                bodyFat: { type: "number" },
                muscleMass: { type: "number" },
                goal: { type: "string" },
              },
              example: { weight: 75.5, bodyFat: 18.5, muscleMass: 35, goal: "Hipertrofia" },
            },
          },
        },
      },
      responses: {
        "200": { description: "Avaliação criada", content: { "application/json": { schema: { $ref: "#/components/schemas/PhysicalAssessment" } } } },
      },
    },
  })
  .delete("/avaliacoes/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.physicalAssessment.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Corpo"],
      summary: "Deletar avaliação",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Avaliação deletada" } },
    },
  })

  // === TREINOS ===
  .get("/treinos", async ({ userId }) => {
    return await prisma.workoutRoutine.findMany({
      where: { userId },
      include: { exercises: true },
    });
  }, {
    detail: {
      tags: ["Corpo"],
      summary: "Listar rotinas de treino",
      description: "Retorna todas as rotinas de treino com seus exercícios.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de rotinas", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/WorkoutRoutine" } } } } },
      },
    },
  })
  .post("/treinos", async ({ userId, body }) => {
    const { name, weekday } = body;
    return await prisma.workoutRoutine.create({ data: { name, weekday, userId } });
  }, {
    body: t.Object({
      name: t.String(),
      weekday: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Corpo"],
      summary: "Criar rotina de treino",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string" },
                weekday: { type: "string" },
              },
              example: { name: "Treino de Peito", weekday: "Segunda" },
            },
          },
        },
      },
      responses: {
        "200": { description: "Rotina criada", content: { "application/json": { schema: { $ref: "#/components/schemas/WorkoutRoutine" } } } },
      },
    },
  })
  .patch("/treinos/:id", async ({ params, body }) => {
    const { id } = params;
    return await prisma.workoutRoutine.update({ where: { id }, data: body });
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      weekday: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Corpo"],
      summary: "Atualizar rotina",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Rotina atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/WorkoutRoutine" } } } },
      },
    },
  })
  .delete("/treinos/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.workoutRoutine.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Corpo"],
      summary: "Deletar rotina",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Rotina deletada" } },
    },
  })

  // === EXERCÍCIOS ===
  .post("/treinos/:id/exercicios", async ({ params, body }) => {
    const { id } = params;
    const { name, sets, reps, weight } = body;
    return await prisma.exercise.create({ data: { name, sets, reps, weight, routineId: id } });
  }, {
    body: t.Object({
      name: t.String(),
      sets: t.Number(),
      reps: t.Number(),
      weight: t.Number(),
    }),
    detail: {
      tags: ["Corpo"],
      summary: "Adicionar exercício",
      description: "Adiciona um exercício a uma rotina de treino.",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "sets", "reps", "weight"],
              properties: {
                name: { type: "string" },
                sets: { type: "number" },
                reps: { type: "number" },
                weight: { type: "number" },
              },
              example: { name: "Supino Reto", sets: 4, reps: 12, weight: 60 },
            },
          },
        },
      },
      responses: {
        "200": { description: "Exercício adicionado", content: { "application/json": { schema: { $ref: "#/components/schemas/Exercise" } } } },
      },
    },
  })
  .patch("/exercicios/:id", async ({ params, body }) => {
    const { id } = params;
    return await prisma.exercise.update({ where: { id }, data: body });
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      sets: t.Optional(t.Number()),
      reps: t.Optional(t.Number()),
      weight: t.Optional(t.Number()),
    }),
    detail: {
      tags: ["Corpo"],
      summary: "Atualizar exercício",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Exercício atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Exercise" } } } },
      },
    },
  })
  .delete("/exercicios/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.exercise.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Corpo"],
      summary: "Remover exercício",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Exercício removido" } },
    },
  })

  // === DIETA / REFEIÇÕES ===
  .get("/refeicoes", async ({ userId, query }) => {
    const { date } = query;
    const where: any = { userId };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.time = { gte: startOfDay.toISOString(), lte: endOfDay.toISOString() };
    }
    
    return await prisma.dietMeal.findMany({
      where,
      include: { items: { include: { food: true } } },
      orderBy: { time: "asc" },
    });
  }, {
    detail: {
      tags: ["Corpo"],
      summary: "Listar refeições",
      description: "Retorna as refeições do usuário. Use o parâmetro date para filtrar por dia específico (YYYY-MM-DD).",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "date", in: "query", schema: { type: "string", format: "date" }, description: "Filtrar por data (YYYY-MM-DD)" }],
      responses: {
        "200": { description: "Lista de refeições", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/DietMeal" } } } } },
      },
    },
  })
  .post("/refeicoes", async ({ userId, body }) => {
    const { name, time } = body;
    return await prisma.dietMeal.create({ data: { name, time, userId } });
  }, {
    body: t.Object({
      name: t.String(),
      time: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Corpo"],
      summary: "Criar refeição",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string" },
                time: { type: "string" },
              },
              example: { name: "Café da Manhã", time: "08:00" },
            },
          },
        },
      },
      responses: {
        "200": { description: "Refeição criada", content: { "application/json": { schema: { $ref: "#/components/schemas/DietMeal" } } } },
      },
    },
  })
  .patch("/refeicoes/:id", async ({ params, body }) => {
    const { id } = params;
    return await prisma.dietMeal.update({ where: { id }, data: body });
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      time: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Corpo"],
      summary: "Atualizar refeição",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Refeição atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/DietMeal" } } } },
      },
    },
  })
  .delete("/refeicoes/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.dietMeal.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Corpo"],
      summary: "Deletar refeição",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Refeição deletada" } },
    },
  })

  // === ITENS DE REFEIÇÃO ===
  .post("/refeicoes/:id/itens", async ({ params, body }) => {
    const { id } = params;
    const { foodId, amountInGrams } = body;
    return await prisma.mealItem.create({ data: { mealId: id, foodId, amountInGrams } });
  }, {
    body: t.Object({
      foodId: t.String(),
      amountInGrams: t.Number(),
    }),
    detail: {
      tags: ["Corpo"],
      summary: "Adicionar item à refeição",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["foodId", "amountInGrams"],
              properties: {
                foodId: { type: "string", format: "uuid" },
                amountInGrams: { type: "number" },
              },
              example: { foodId: "uuid", amountInGrams: 150 },
            },
          },
        },
      },
      responses: { "200": { description: "Item adicionado" } },
    },
  })
  .patch("/refeicoes/itens/:id", async ({ params, body }) => {
    const { id } = params;
    return await prisma.mealItem.update({ where: { id }, data: body });
  }, {
    body: t.Object({ amountInGrams: t.Number() }),
    detail: {
      tags: ["Corpo"],
      summary: "Atualizar item da refeição",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Item atualizado" } },
    },
  })
  .delete("/refeicoes/itens/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.mealItem.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Corpo"],
      summary: "Remover item da refeição",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Item removido" } },
    },
  })

  // === BIBLIOTECA DE ALIMENTOS ===
  .get("/alimentos", async () => {
    return await prisma.foodItem.findMany({ orderBy: { name: "asc" } });
  }, {
    detail: {
      tags: ["Corpo"],
      summary: "Listar alimentos",
      description: "Retorna a biblioteca de alimentos ordenada alfabeticamente.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de alimentos", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/FoodItem" } } } } },
      },
    },
  })
  .post("/alimentos", async ({ body }) => {
    return await prisma.foodItem.create({ data: body });
  }, {
    body: t.Object({
      name: t.String(),
      calories: t.Number(),
      protein: t.Number(),
      carbs: t.Number(),
      fats: t.Number(),
    }),
    detail: {
      tags: ["Corpo"],
      summary: "Criar alimento",
      description: "Adiciona um novo alimento à biblioteca com informações nutricionais.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "calories", "protein", "carbs", "fats"],
              properties: {
                name: { type: "string" },
                calories: { type: "number" },
                protein: { type: "number" },
                carbs: { type: "number" },
                fats: { type: "number" },
              },
              example: { name: "Frango Grelhado", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
            },
          },
        },
      },
      responses: {
        "200": { description: "Alimento criado", content: { "application/json": { schema: { $ref: "#/components/schemas/FoodItem" } } } },
      },
    },
  })
  .patch("/alimentos/:id", async ({ params, body }) => {
    const { id } = params;
    return await prisma.foodItem.update({ where: { id }, data: body });
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      calories: t.Optional(t.Number()),
      protein: t.Optional(t.Number()),
      carbs: t.Optional(t.Number()),
      fats: t.Optional(t.Number()),
    }),
    detail: {
      tags: ["Corpo"],
      summary: "Atualizar alimento",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Alimento atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/FoodItem" } } } },
      },
    },
  })
  .delete("/alimentos/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.foodItem.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Corpo"],
      summary: "Remover alimento",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Alimento removido" } },
    },
  })

  // === RECEITAS ===
  .get("/receitas", async () => {
    return await prisma.recipe.findMany();
  }, {
    detail: {
      tags: ["Corpo"],
      summary: "Listar receitas",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de receitas", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Recipe" } } } } },
      },
    },
  })
  .post("/receitas", async ({ body }) => {
    const { name, instructions, ingredients } = body;
    return await prisma.recipe.create({ data: { name, instructions, ingredients: ingredients || [] } });
  }, {
    body: t.Object({
      name: t.String(),
      instructions: t.String(),
      ingredients: t.Optional(t.Array(t.String())),
    }),
    detail: {
      tags: ["Corpo"],
      summary: "Criar receita",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "instructions"],
              properties: {
                name: { type: "string" },
                instructions: { type: "string" },
                ingredients: { type: "array", items: { type: "string" } },
              },
              example: { name: "Smoothie Proteico", instructions: "Bater todos os ingredientes", ingredients: ["leite", "banana"] },
            },
          },
        },
      },
      responses: {
        "200": { description: "Receita criada", content: { "application/json": { schema: { $ref: "#/components/schemas/Recipe" } } } },
      },
    },
  })
  .patch("/receitas/:id", async ({ params, body }) => {
    const { id } = params;
    const { name, instructions, ingredients } = body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (instructions !== undefined) data.instructions = instructions;
    if (ingredients !== undefined) data.ingredients = ingredients;
    return await prisma.recipe.update({ where: { id }, data });
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      instructions: t.Optional(t.String()),
      ingredients: t.Optional(t.Array(t.String())),
    }),
    detail: {
      tags: ["Corpo"],
      summary: "Atualizar receita",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Receita atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/Recipe" } } } },
      },
    },
  })
  .delete("/receitas/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.recipe.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Corpo"],
      summary: "Remover receita",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Receita removida" } },
    },
  })

  // === HIDRATAÇÃO ===
  .get("/hidratacao", async ({ userId }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const intakes = await prisma.waterIntake.findMany({
      where: { userId, date: { gte: today } },
      orderBy: { date: 'asc' },
    });
    
    const consumed = intakes.reduce((sum, intake) => sum + intake.amount, 0);
    return { consumed, goal: 3500, intakes };
  }, {
    detail: {
      tags: ["Corpo"],
      summary: "Obter hidratação do dia",
      description: "Retorna o consumo de água do dia atual e a meta (3500ml).",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": {
          description: "Dados de hidratação",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  consumed: { type: "number", description: "Total consumido em ml" },
                  goal: { type: "number", description: "Meta diária em ml" },
                  intakes: { type: "array", items: { $ref: "#/components/schemas/WaterIntake" } },
                },
              },
            },
          },
        },
      },
    },
  })
  .post("/hidratacao", async ({ userId, body }) => {
    const { amount } = body;
    const intake = await prisma.waterIntake.create({ data: { userId, amount } });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allIntakes = await prisma.waterIntake.findMany({
      where: { userId, date: { gte: today } },
    });
    
    const total = allIntakes.reduce((sum, i) => sum + i.amount, 0);
    return { success: true, intake, consumed: total };
  }, {
    body: t.Object({ amount: t.Number() }),
    detail: {
      tags: ["Corpo"],
      summary: "Registrar consumo de água",
      description: "Registra o consumo de água em ml.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["amount"],
              properties: { amount: { type: "number", description: "Quantidade em ml" } },
              example: { amount: 250 },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Consumo registrado",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  intake: { $ref: "#/components/schemas/WaterIntake" },
                  consumed: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
  });
