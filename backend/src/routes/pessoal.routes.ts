import { Elysia, t } from "elysia";
import { prisma } from "../db/prisma";
import { isAuthenticated } from "../middleware/auth";

export const pessoalRoutes = new Elysia({ prefix: "/pessoal" })
  .use(isAuthenticated)
  
  // === FINANÇAS: CONTAS ===
  .get("/contas", async ({ userId }) => {
    const accounts = await prisma.bankAccount.findMany({
      where: { userId },
      include: {
        transactions: {
          where: { cardId: null },
        },
      },
    });
    
    return accounts.map(account => {
      const balance = account.transactions.reduce((sum, tx) => {
        return tx.type === "INCOME" ? sum + tx.amount : sum - tx.amount;
      }, 0);
      return { ...account, balance };
    });
  }, {
    detail: {
      tags: ["Pessoal"],
      summary: "Listar contas bancárias",
      description: "Retorna todas as contas bancárias do usuário.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": {
          description: "Lista de contas bancárias",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/BankAccount" },
              },
            },
          },
        },
      },
    },
  })
  .post("/contas", async ({ userId, body }) => {
    const { name, balance } = body;
    return await prisma.bankAccount.create({
      data: { name, balance, userId },
    });
  }, {
    body: t.Object({
      name: t.String(),
      balance: t.Number(),
    }),
    detail: {
      tags: ["Pessoal"],
      summary: "Criar conta bancária",
      description: "Cria uma nova conta bancária para o usuário.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "balance"],
              properties: {
                name: { type: "string" },
                balance: { type: "number" },
              },
              example: { name: "Conta Corrente", balance: 5000 },
            },
          },
        },
      },
      responses: {
        "200": { description: "Conta criada", content: { "application/json": { schema: { $ref: "#/components/schemas/BankAccount" } } } },
      },
    },
  })
  .patch("/contas/:id", async ({ params, body }) => {
    const { id } = params;
    return await prisma.bankAccount.update({
      where: { id },
      data: body,
    });
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      balance: t.Optional(t.Number()),
    }),
    detail: {
      tags: ["Pessoal"],
      summary: "Atualizar conta bancária",
      description: "Atualiza uma conta bancária existente.",
      security: [{ BearerAuth: [] }],
      parameters: [{
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
      }],
      responses: {
        "200": { description: "Conta atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/BankAccount" } } } },
      },
    },
  })
  .delete("/contas/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.bankAccount.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Pessoal"],
      summary: "Deletar conta bancária",
      description: "Remove uma conta bancária.",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Conta deletada" } },
    },
  })

  // === FINANÇAS: TRANSAÇÕES ===
  .get("/transacoes", async ({ userId }) => {
    return await prisma.transaction.findMany({
      where: { account: { userId } },
      orderBy: { date: "desc" },
    });
  }, {
    detail: {
      tags: ["Pessoal"],
      summary: "Listar transações",
      description: "Retorna todas as transações ordenadas por data (mais recentes primeiro).",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de transações", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Transaction" } } } } },
      },
    },
  })
  .post("/transacoes", async ({ body }) => {
    const { accountId, cardId, amount, type, category, description } = body;
    return await prisma.transaction.create({
      data: { accountId, cardId, amount, type, category, description },
    });
  }, {
    body: t.Object({
      accountId: t.String(),
      cardId: t.Optional(t.String()),
      amount: t.Number(),
      type: t.String(),
      category: t.String(),
      description: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Pessoal"],
      summary: "Criar transação",
      description: "Cria uma nova transação (receita ou despesa). Se cardId for fornecido, atualiza a fatura do cartão.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["accountId", "amount", "type", "category"],
              properties: {
                accountId: { type: "string", format: "uuid" },
                cardId: { type: "string", format: "uuid" },
                amount: { type: "number" },
                type: { type: "string", enum: ["INCOME", "EXPENSE"] },
                category: { type: "string" },
                description: { type: "string" },
              },
              example: { accountId: "uuid", cardId: "uuid (opcional)", amount: 150.50, type: "EXPENSE", category: "Alimentação", description: "Supermercado" },
            },
          },
        },
      },
      responses: {
        "200": { description: "Transação criada", content: { "application/json": { schema: { $ref: "#/components/schemas/Transaction" } } } },
      },
    },
  })
  .delete("/transacoes/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.transaction.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Pessoal"],
      summary: "Deletar transação",
      description: "Remove uma transação.",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Transação deletada" } },
    },
  })

  // === FINANÇAS: CARTÕES ===
  .get("/cartoes", async ({ userId }) => {
    const cards = await prisma.creditCard.findMany({
      where: { account: { userId } },
      include: {
        transactions: true,
      },
    });
    
    return cards.map(card => {
      const currentUsed = card.transactions
        .filter(tx => tx.type === "EXPENSE")
        .reduce((sum, tx) => sum + tx.amount, 0);
      return { ...card, currentUsed };
    });
  }, {
    detail: {
      tags: ["Pessoal"],
      summary: "Listar cartões de crédito",
      description: "Retorna todos os cartões de crédito do usuário.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de cartões", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/CreditCard" } } } } },
      },
    },
  })
  .post("/cartoes", async ({ body }) => {
    const { accountId, name, limit, invoiceDate } = body;
    return await prisma.creditCard.create({
      data: { accountId, name, limit, invoiceDate },
    });
  }, {
    body: t.Object({
      accountId: t.String(),
      name: t.String(),
      limit: t.Number(),
      invoiceDate: t.Number(),
    }),
    detail: {
      tags: ["Pessoal"],
      summary: "Criar cartão de crédito",
      description: "Cria um novo cartão de crédito vinculado a uma conta.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["accountId", "name", "limit", "invoiceDate"],
              properties: {
                accountId: { type: "string", format: "uuid" },
                name: { type: "string" },
                limit: { type: "number" },
                invoiceDate: { type: "number", minimum: 1, maximum: 31 },
              },
              example: { accountId: "uuid", name: "Nubank", limit: 5000, invoiceDate: 15 },
            },
          },
        },
      },
      responses: {
        "200": { description: "Cartão criado", content: { "application/json": { schema: { $ref: "#/components/schemas/CreditCard" } } } },
      },
    },
  })
  .patch("/cartoes/:id", async ({ params, body }) => {
    const { id } = params;
    return await prisma.creditCard.update({ where: { id }, data: body });
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      limit: t.Optional(t.Number()),
      invoiceDate: t.Optional(t.Number()),
    }),
    detail: {
      tags: ["Pessoal"],
      summary: "Atualizar cartão de crédito",
      description: "Atualiza os dados de um cartão de crédito.",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Cartão atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/CreditCard" } } } },
      },
    },
  })
  .delete("/cartoes/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.creditCard.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Pessoal"],
      summary: "Deletar cartão de crédito",
      description: "Remove um cartão de crédito.",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Cartão deletado" } },
    },
  })

  // === DIÁRIO: NOTAS & TASKS ===
  .get("/notas", async ({ userId }) => {
    return await prisma.journalEntry.findMany({
      where: { userId },
      include: { tasks: true },
      orderBy: { date: "desc" },
    });
  }, {
    detail: {
      tags: ["Pessoal"],
      summary: "Listar entradas do diário",
      description: "Retorna todas as entradas do diário com suas tarefas.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de entradas" },
      },
    },
  })
  .post("/notas", async ({ userId, body }) => {
    const { content } = body;
    return await prisma.journalEntry.create({
      data: { content, userId },
    });
  }, {
    body: t.Object({ content: t.String() }),
    detail: {
      tags: ["Pessoal"],
      summary: "Criar entrada no diário",
      description: "Cria uma nova entrada no diário.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["content"],
              properties: { content: { type: "string" } },
              example: { content: "Hoje foi um dia produtivo..." },
            },
          },
        },
      },
      responses: { "200": { description: "Entrada criada" } },
    },
  })
  .delete("/notas/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.journalEntry.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Pessoal"],
      summary: "Deletar entrada do diário",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Entrada deletada" } },
    },
  })
  .post("/tasks", async ({ userId, body }) => {
    const { journalId, title, category, rating, isCompleted, status } = body;
    return await prisma.task.create({
      data: { userId, journalId, title, category, rating, isCompleted, status },
    });
  }, {
    body: t.Object({
      journalId: t.Optional(t.String()),
      title: t.String(),
      category: t.String(),
      rating: t.Optional(t.Number()),
      isCompleted: t.Optional(t.Boolean()),
      status: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Pessoal"],
      summary: "Criar tarefa",
      description: "Cria uma nova tarefa no diário ou quadro Kanban.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title", "category"],
              properties: {
                journalId: { type: "string", format: "uuid" },
                title: { type: "string" },
                category: { type: "string" },
                rating: { type: "number" },
                isCompleted: { type: "boolean" },
                status: { type: "string", enum: ["TODO", "DOING", "DONE"] },
              },
              example: { title: "Estudar TypeScript", category: "Estudos", rating: 0, isCompleted: false, status: "TODO" },
            },
          },
        },
      },
      responses: {
        "200": { description: "Tarefa criada", content: { "application/json": { schema: { $ref: "#/components/schemas/Task" } } } },
      },
    },
  })
  .get("/tasks", async ({ userId }) => {
    return await prisma.task.findMany({
      where: { userId },
      orderBy: { date: "desc" }
    });
  }, {
    detail: {
      tags: ["Pessoal"],
      summary: "Listar tarefas",
      description: "Retorna todas as tarefas para o quadro Kanban.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de tarefas", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Task" } } } } },
      },
    },
  })
  .patch("/tasks/:id", async ({ params, body, userId }) => {
    const { id } = params;
    const updateData: { title?: string; category?: string; rating?: number; isCompleted?: boolean; status?: string } = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.isCompleted !== undefined) updateData.isCompleted = body.isCompleted;
    if (body.status !== undefined) updateData.status = body.status;
    return await prisma.task.update({ 
      where: { id, userId }, 
      data: updateData 
    });
  }, {
    body: t.Object({
      title: t.Optional(t.String()),
      category: t.Optional(t.String()),
      rating: t.Optional(t.Number()),
      isCompleted: t.Optional(t.Boolean()),
      status: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Pessoal"],
      summary: "Atualizar tarefa",
      description: "Atualiza uma tarefa existente. Use para mover entre colunas do Kanban.",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Tarefa atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/Task" } } } },
      },
    },
  })
  .delete("/tasks/:id", async ({ params, userId }) => {
    const { id } = params;
    return await prisma.task.delete({ where: { id, userId } });
  }, {
    detail: {
      tags: ["Pessoal"],
      summary: "Deletar tarefa",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Tarefa deletada" } },
    },
  })

  // === METAS (GoalBoard) ===
  .get("/metas", async ({ userId }) => {
    return await prisma.goalBoard.findMany({ where: { userId } });
  }, {
    detail: {
      tags: ["Pessoal"],
      summary: "Listar metas",
      description: "Retorna todas as metas do quadro Kanban (TODO, DOING, DONE).",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de metas", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/GoalBoard" } } } } },
      },
    },
  })
  .post("/metas", async ({ userId, body }) => {
    const { title, status } = body;
    return await prisma.goalBoard.create({ data: { title, status, userId } });
  }, {
    body: t.Object({
      title: t.String(),
      status: t.String(),
    }),
    detail: {
      tags: ["Pessoal"],
      summary: "Criar meta",
      description: "Cria uma nova meta no quadro Kanban.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title", "status"],
              properties: {
                title: { type: "string" },
                status: { type: "string", enum: ["TODO", "DOING", "DONE"] },
              },
              example: { title: "Aprender React", status: "TODO" },
            },
          },
        },
      },
      responses: {
        "200": { description: "Meta criada", content: { "application/json": { schema: { $ref: "#/components/schemas/GoalBoard" } } } },
      },
    },
  })
  .patch("/metas/:id", async ({ params, body }) => {
    const { id } = params;
    const updateData: { title?: string; status?: string } = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.status !== undefined) updateData.status = body.status;
    return await prisma.goalBoard.update({ where: { id }, data: updateData });
  }, {
    body: t.Object({
      title: t.Optional(t.String()),
      status: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Pessoal"],
      summary: "Atualizar meta",
      description: "Move uma meta entre colunas ou atualiza seu título.",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Meta atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/GoalBoard" } } } },
      },
    },
  })
  .delete("/metas/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.goalBoard.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Pessoal"],
      summary: "Deletar meta",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Meta deletada" } },
    },
  });
