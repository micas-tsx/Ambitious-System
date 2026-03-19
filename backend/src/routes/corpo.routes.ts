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
  })
  .post(
    "/avaliacoes",
    async ({ userId, body }) => {
      const { weight, bodyFat, muscleMass, goal } = body;
      return await prisma.physicalAssessment.create({
        data: {
          weight,
          bodyFat,
          muscleMass,
          goal,
          userId,
        },
      });
    },
    {
      body: t.Object({
        weight: t.Number(),
        bodyFat: t.Optional(t.Number()),
        muscleMass: t.Optional(t.Number()),
        goal: t.String(),
      }),
    }
  )
  .delete("/avaliacoes/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.physicalAssessment.delete({
      where: { id },
    });
  })

  // === TREINOS ===
  .get("/treinos", async ({ userId }) => {
    return await prisma.workoutRoutine.findMany({
      where: { userId },
      include: { exercises: true },
    });
  })
  .post(
    "/treinos",
    async ({ userId, body }) => {
      const { name, weekday } = body;
      return await prisma.workoutRoutine.create({
        data: {
          name,
          weekday,
          userId,
        },
      });
    },
    {
      body: t.Object({
        name: t.String(),
        weekday: t.Optional(t.String()),
      }),
    }
  )
  .patch(
    "/treinos/:id",
    async ({ params, body }) => {
      const { id } = params;
      return await prisma.workoutRoutine.update({
        where: { id },
        data: body,
      });
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        weekday: t.Optional(t.String()),
      }),
    }
  )
  .delete("/treinos/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.workoutRoutine.delete({
      where: { id },
    });
  })

  // === EXERCÍCIOS (DENTRO DE TREINOS) ===
  .post(
    "/treinos/:id/exercicios",
    async ({ params, body }) => {
      const { id } = params;
      const { name, sets, reps, weight } = body;
      return await prisma.exercise.create({
        data: {
          name,
          sets,
          reps,
          weight,
          routineId: id,
        },
      });
    },
    {
      body: t.Object({
        name: t.String(),
        sets: t.Number(),
        reps: t.Number(),
        weight: t.Number(),
      }),
    }
  )
  .patch(
    "/exercicios/:id",
    async ({ params, body }) => {
      const { id } = params;
      return await prisma.exercise.update({
        where: { id },
        data: body,
      });
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        sets: t.Optional(t.Number()),
        reps: t.Optional(t.Number()),
        weight: t.Optional(t.Number()),
      }),
    }
  )
  .delete("/exercicios/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.exercise.delete({
      where: { id },
    });
  })

  // === DIETA / REFEIÇÕES ===
  .get("/refeicoes", async ({ userId }) => {
    return await prisma.dietMeal.findMany({
      where: { userId },
      include: { 
        items: {
          include: { food: true }
        }
      },
      orderBy: { time: "asc" },
    });
  })
  .post(
    "/refeicoes",
    async ({ userId, body }) => {
      const { name, time } = body;
      return await prisma.dietMeal.create({
        data: {
          name,
          time,
          userId,
        },
      });
    },
    {
      body: t.Object({
        name: t.String(),
        time: t.Optional(t.String()), // ex: "08:00"
      }),
    }
  )
  .delete("/refeicoes/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.dietMeal.delete({
      where: { id },
    });
  })

  // === ITENS DE REFEIÇÃO (DENTRO DE REFEIÇÕES) ===
  .post(
    "/refeicoes/:id/itens",
    async ({ params, body }) => {
      const { id } = params;
      const { foodId, amountInGrams } = body;
      return await prisma.mealItem.create({
        data: {
          mealId: id,
          foodId,
          amountInGrams,
        },
      });
    },
    {
      body: t.Object({
        foodId: t.String(),
        amountInGrams: t.Number(),
      }),
    }
  )
  .patch(
    "/refeicoes/itens/:id",
    async ({ params, body }) => {
      const { id } = params;
      return await prisma.mealItem.update({
        where: { id },
        data: body,
      });
    },
    {
      body: t.Object({
        amountInGrams: t.Number(),
      }),
    }
  )
  .delete("/refeicoes/itens/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.mealItem.delete({
      where: { id },
    });
  })

  // === BIBLIOTECA DE ALIMENTOS ===
  .get("/alimentos", async () => {
    return await prisma.foodItem.findMany({
      orderBy: { name: "asc" },
    });
  })
  .post(
    "/alimentos",
    async ({ body }) => {
      return await prisma.foodItem.create({
        data: body,
      });
    },
    {
      body: t.Object({
        name: t.String(),
        calories: t.Number(),
        protein: t.Number(),
        carbs: t.Number(),
        fats: t.Number(),
      }),
    }
  );
