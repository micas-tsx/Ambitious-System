import { Elysia, t } from "elysia";
import { prisma } from "../db/prisma";
import { isAuthenticated } from "../middleware/auth";

export const menteRoutes = new Elysia({ prefix: "/mente" })
  .use(isAuthenticated)

  // === ESTUDOS: CADERNOS E AULAS ===
  .get("/cadernos", async ({ userId }) => {
    return await prisma.studyNotebook.findMany({
      where: { userId },
      include: { lessons: true },
    });
  }, {
    detail: {
      tags: ["Mente"],
      summary: "Listar cadernos de estudo",
      description: "Retorna todos os cadernos de estudo com suas aulas.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de cadernos", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/StudyNotebook" } } } } },
      },
    },
  })
  .post("/cadernos", async ({ userId, body }) => {
    const { title } = body;
    return await prisma.studyNotebook.create({ data: { title, userId } });
  }, {
    body: t.Object({ title: t.String() }),
    detail: {
      tags: ["Mente"],
      summary: "Criar caderno",
      description: "Cria um novo caderno de estudos.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", required: ["title"], properties: { title: { type: "string" } }, example: { title: "Fundamentos de Programação" } },
          },
        },
      },
      responses: { "200": { description: "Caderno criado", content: { "application/json": { schema: { $ref: "#/components/schemas/StudyNotebook" } } } } },
    },
  })
  .delete("/cadernos/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.studyNotebook.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Mente"],
      summary: "Deletar caderno",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Caderno deletado" } },
    },
  })
  .get("/aulas", async ({ userId }) => {
    const notebooks = await prisma.studyNotebook.findMany({
      where: { userId },
      select: { id: true },
    });
    const notebookIds = notebooks.map(n => n.id);
    
    return await prisma.studyLesson.findMany({
      where: { notebookId: { in: notebookIds } },
      include: { notebook: true },
    });
  }, {
    detail: {
      tags: ["Mente"],
      summary: "Listar todas as aulas",
      description: "Retorna todas as aulas de todos os cadernos do usuário.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de aulas", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/StudyLesson" } } } } },
      },
    },
  })
  .post("/aulas", async ({ userId, body, set }) => {
    const { notebookId, name, status, nextReview } = body;

    const notebook = await prisma.studyNotebook.findFirst({
      where: { id: notebookId, userId },
    });

    if (!notebook) {
      set.status = 404;
      return { error: "Caderno não encontrado" };
    }

    return await prisma.studyLesson.create({
      data: {
        notebookId,
        name,
        status,
        nextReview: nextReview ? new Date(nextReview) : null,
      },
    });
  }, {
    body: t.Object({
      notebookId: t.String(),
      name: t.String(),
      status: t.String(),
      nextReview: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Mente"],
      summary: "Criar aula",
      description: "Cria uma nova aula dentro de um caderno.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["notebookId", "name", "status"],
              properties: {
                notebookId: { type: "string", format: "uuid" },
                name: { type: "string" },
                status: { type: "string", enum: ["NOT_STARTED", "DOING", "COMPLETED"] },
                nextReview: { type: "string", format: "date-time" },
              },
              example: { notebookId: "uuid", name: "Aula 1: Introdução", status: "NOT_STARTED" },
            },
          },
        },
      },
      responses: {
        "200": { description: "Aula criada", content: { "application/json": { schema: { $ref: "#/components/schemas/StudyLesson" } } } },
        "404": { description: "Caderno não encontrado" },
      },
    },
  })
  .patch("/aulas/:id", async ({ params, body }) => {
    const { id } = params;
    return await prisma.studyLesson.update({ where: { id }, data: body });
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      status: t.Optional(t.String()),
      nextReview: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Mente"],
      summary: "Atualizar aula",
      description: "Atualiza uma aula existente (nome, status ou próxima revisão).",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Aula atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/StudyLesson" } } } },
      },
    },
  })
  .delete("/aulas/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.studyLesson.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Mente"],
      summary: "Deletar aula",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Aula deletada" } },
    },
  })

  // === BIBLIOTECA: LIVROS ===
  .get("/livros", async ({ userId }) => {
    return await prisma.book.findMany({ where: { userId } });
  }, {
    detail: {
      tags: ["Mente"],
      summary: "Listar livros",
      description: "Retorna todos os livros da biblioteca pessoal.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de livros", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Book" } } } } },
      },
    },
  })
  .post("/livros", async ({ userId, body }) => {
    const { title, author, status } = body;
    return await prisma.book.create({ data: { title, author, status, userId } });
  }, {
    body: t.Object({
      title: t.String(),
      author: t.Optional(t.String()),
      status: t.String(),
    }),
    detail: {
      tags: ["Mente"],
      summary: "Adicionar livro",
      description: "Adiciona um novo livro à biblioteca.",
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
                author: { type: "string" },
                status: { type: "string", enum: ["READING", "WISHLIST", "NEXT_UP", "FINISHED"] },
              },
              example: { title: "Clean Code", author: "Robert C. Martin", status: "READING" },
            },
          },
        },
      },
      responses: {
        "200": { description: "Livro adicionado", content: { "application/json": { schema: { $ref: "#/components/schemas/Book" } } } },
      },
    },
  })
  .patch("/livros/:id", async ({ params, body }) => {
    const { id } = params;
    return await prisma.book.update({ where: { id }, data: body });
  }, {
    body: t.Object({
      title: t.Optional(t.String()),
      author: t.Optional(t.String()),
      status: t.Optional(t.String()),
      rating: t.Optional(t.Number()),
    }),
    detail: {
      tags: ["Mente"],
      summary: "Atualizar livro",
      description: "Atualiza um livro existente. Use para alterar status ou adicionar rating.",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Livro atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Book" } } } },
      },
    },
  })
  .delete("/livros/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.book.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Mente"],
      summary: "Remover livro",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Livro removido" } },
    },
  })

  // === FLASHCARDS ===
  .get("/cadernos/:notebookId/flashcards", async ({ params }) => {
    const { notebookId } = params;
    return await prisma.flashcard.findMany({
      where: { notebookId },
      orderBy: { nextReview: 'asc' },
    });
  }, {
    detail: {
      tags: ["Mente"],
      summary: "Listar flashcards do caderno",
      description: "Retorna todos os flashcards de um caderno ordenados por próxima revisão.",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "notebookId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Lista de flashcards", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Flashcard" } } } } },
      },
    },
  })
  .get("/flashcards/pending", async ({ userId }) => {
    const notebooks = await prisma.studyNotebook.findMany({
      where: { userId },
      select: { id: true },
    });
    const notebookIds = notebooks.map(n => n.id);
    
    return await prisma.flashcard.findMany({
      where: { notebookId: { in: notebookIds }, nextReview: { lte: new Date() } },
      include: { notebook: true },
      orderBy: { nextReview: 'asc' },
    });
  }, {
    detail: {
      tags: ["Mente"],
      summary: "Listar flashcards pendentes",
      description: "Retorna flashcards que estão prontos para revisão (nextReview <= agora).",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de flashcards pendentes", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Flashcard" } } } } },
      },
    },
  })
  .post("/flashcards", async ({ body }) => {
    const { notebookId, front, back } = body;
    return await prisma.flashcard.create({ data: { notebookId, front, back } });
  }, {
    body: t.Object({
      notebookId: t.String(),
      front: t.String(),
      back: t.String(),
    }),
    detail: {
      tags: ["Mente"],
      summary: "Criar flashcard",
      description: "Cria um novo flashcard com frente (pergunta) e verso (resposta).",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["notebookId", "front", "back"],
              properties: {
                notebookId: { type: "string", format: "uuid" },
                front: { type: "string" },
                back: { type: "string" },
              },
              example: { notebookId: "uuid", front: "O que é TypeScript?", back: "TypeScript é um superset do JavaScript..." },
            },
          },
        },
      },
      responses: {
        "200": { description: "Flashcard criado", content: { "application/json": { schema: { $ref: "#/components/schemas/Flashcard" } } } },
      },
    },
  })
  .post("/flashcards/:id/review", async ({ params, body }) => {
    const { id } = params;
    const { quality } = body;
    
    const flashcard = await prisma.flashcard.findUnique({ where: { id } });
    if (!flashcard) return { error: "Flashcard não encontrado" };

    let newInterval: number;
    let newEase = flashcard.ease;

    if (quality < 3) {
      newInterval = 1;
    } else {
      if (flashcard.interval === 0) {
        newInterval = 1;
      } else if (flashcard.interval === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(flashcard.interval * flashcard.ease);
      }
    }

    newEase = flashcard.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEase = Math.max(1.3, newEase);

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return await prisma.flashcard.update({
      where: { id },
      data: { interval: newInterval, ease: newEase, nextReview: nextReviewDate },
    });
  }, {
    body: t.Object({ quality: t.Number() }),
    detail: {
      tags: ["Mente"],
      summary: "Revisar flashcard",
      description: "Registra a revisão de um flashcard usando o algoritmo SM-2 para calcular o próximo review.",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["quality"],
              properties: {
                quality: { type: "number", minimum: 0, maximum: 5, description: "Qualidade da resposta (0-5)" },
              },
              example: { quality: 4 },
            },
          },
        },
      },
      responses: {
        "200": { description: "Revisão registrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Flashcard" } } } },
        "404": { description: "Flashcard não encontrado" },
      },
    },
  })
  .delete("/flashcards/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.flashcard.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Mente"],
      summary: "Deletar flashcard",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Flashcard deletado" } },
    },
  });
