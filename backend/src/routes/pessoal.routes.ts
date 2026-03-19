import { Elysia, t } from "elysia";
import { prisma } from "../db/prisma";
import { isAuthenticated } from "../middleware/auth";

export const pessoalRoutes = new Elysia({ prefix: "/pessoal" })
  .use(isAuthenticated)
  
  // === FINANÇAS: CONTAS ===
  .get("/contas", async ({ userId }) => {
    return await prisma.bankAccount.findMany({
      where: { userId },
    });
  })
  .post(
    "/contas",
    async ({ userId, body }) => {
      const { name, balance } = body;
      return await prisma.bankAccount.create({
        data: {
          name,
          balance,
          userId,
        },
      });
    },
    {
      body: t.Object({
        name: t.String(),
        balance: t.Number(),
      }),
    }
  )
  .patch(
    "/contas/:id",
    async ({ params, body }) => {
      const { id } = params;
      return await prisma.bankAccount.update({
        where: { id },
        data: body,
      });
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        balance: t.Optional(t.Number()),
      }),
    }
  )
  .delete("/contas/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.bankAccount.delete({
      where: { id },
    });
  })

  // === FINANÇAS: TRANSAÇÕES ===
  .get("/transacoes", async ({ userId }) => {
    return await prisma.transaction.findMany({
      where: { account: { userId } },
      orderBy: { date: "desc" },
    });
  })
  .post(
    "/transacoes",
    async ({ body }) => {
      const { accountId, amount, type, category, description } = body;
      return await prisma.transaction.create({
        data: {
          accountId,
          amount,
          type,
          category,
          description,
        },
      });
    },
    {
      body: t.Object({
        accountId: t.String(),
        amount: t.Number(),
        type: t.String(), // INCOME | EXPENSE
        category: t.String(),
        description: t.Optional(t.String()),
      }),
    }
  )
  .delete("/transacoes/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.transaction.delete({
      where: { id },
    });
  })

  // === FINANÇAS: CARTÕES ===
  .get("/cartoes", async ({ userId }) => {
    return await prisma.creditCard.findMany({
      where: { account: { userId } },
    });
  })

  // === DIÁRIO: NOTAS & TASKS ===
  .get("/notas", async ({ userId }) => {
    return await prisma.journalEntry.findMany({
      where: { userId },
      include: { tasks: true },
      orderBy: { date: "desc" },
    });
  })
  .post(
    "/notas",
    async ({ userId, body }) => {
      const { content } = body;
      return await prisma.journalEntry.create({
        data: {
          content,
          userId,
        },
      });
    },
    {
      body: t.Object({
        content: t.String(),
      }),
    }
  )
  .post(
    "/tasks",
    async ({ body }) => {
      const { journalId, title, category, rating, isCompleted } = body;
      return await prisma.task.create({
        data: {
          journalId,
          title,
          category,
          rating,
          isCompleted,
        },
      });
    },
    {
      body: t.Object({
        journalId: t.Optional(t.String()),
        title: t.String(),
        category: t.String(),
        rating: t.Number(),
        isCompleted: t.Optional(t.Boolean()),
      }),
    }
  )
  .patch(
    "/tasks/:id",
    async ({ params, body }) => {
      const { id } = params;
      return await prisma.task.update({
        where: { id },
        data: body,
      });
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        category: t.Optional(t.String()),
        rating: t.Optional(t.Number()),
        isCompleted: t.Optional(t.Boolean()),
      }),
    }
  )
  .delete("/tasks/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.task.delete({
      where: { id },
    });
  })
  .delete("/notas/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.journalEntry.delete({
      where: { id },
    });
  })

  // === METAS (GoalBoard) ===
  .get("/metas", async ({ userId }) => {
    return await prisma.goalBoard.findMany({
      where: { userId },
    });
  })
  .post(
    "/metas",
    async ({ userId, body }) => {
      const { title, status } = body;
      return await prisma.goalBoard.create({
        data: {
          title,
          status,
          userId,
        },
      });
    },
    {
      body: t.Object({
        title: t.String(),
        status: t.String(), // ex: "TODO", "DOING", "DONE"
      }),
    }
  )
  .patch(
    "/metas/:id",
    async ({ params, body }) => {
      const { id } = params;
      const { title, status } = body;
      return await prisma.goalBoard.update({
        where: { id },
        data: { title, status },
      });
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
    }
  )
  .delete("/metas/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.goalBoard.delete({
      where: { id },
    });
  });
