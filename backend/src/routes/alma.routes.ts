import { Elysia, t } from "elysia";
import { prisma } from "../db/prisma";
import { isAuthenticated } from "../middleware/auth";

export const almaRoutes = new Elysia({ prefix: "/alma" })
  .use(isAuthenticated)

  // === HOBBIES ===
  .get("/hobbies", async ({ userId }) => {
    return await prisma.hobby.findMany({ where: { userId } });
  }, {
    detail: {
      tags: ["Alma"],
      summary: "Listar hobbies",
      description: "Retorna todos os hobbies do usuário.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de hobbies", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Hobby" } } } } },
      },
    },
  })
  .post("/hobbies", async ({ userId, body }) => {
    const { name, schedule } = body;
    return await prisma.hobby.create({ data: { name, schedule, userId } });
  }, {
    body: t.Object({
      name: t.String(),
      schedule: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Alma"],
      summary: "Criar hobby",
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
                schedule: { type: "string" },
              },
              example: { name: "Pintura", schedule: "Sábados às 14h" },
            },
          },
        },
      },
      responses: {
        "200": { description: "Hobby criado", content: { "application/json": { schema: { $ref: "#/components/schemas/Hobby" } } } },
      },
    },
  })
  .patch("/hobbies/:id", async ({ params, body }) => {
    const { id } = params;
    const { name, schedule } = body as { name?: string; schedule?: string };
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (schedule !== undefined) data.schedule = schedule;
    return await prisma.hobby.update({ where: { id }, data });
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      schedule: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Alma"],
      summary: "Atualizar hobby",
      description: "Atualiza um hobby existente (nome ou schedule).",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Hobby atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Hobby" } } } },
      },
    },
  })
  .delete("/hobbies/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.hobby.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Alma"],
      summary: "Remover hobby",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Hobby removido" } },
    },
  })

  // === BRAINSTORM / NOTAS ===
  .get("/brainstorm", async ({ userId }) => {
    return await prisma.brainstormNote.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }, {
    detail: {
      tags: ["Alma"],
      summary: "Listar notas de brainstorm",
      description: "Retorna todas as notas de brainstorm ordenadas por data.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de notas", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/BrainstormNote" } } } } },
      },
    },
  })
  .post("/brainstorm", async ({ userId, body }) => {
    const { content } = body;
    return await prisma.brainstormNote.create({ data: { content, userId } });
  }, {
    body: t.Object({
      content: t.String(),
    }),
    detail: {
      tags: ["Alma"],
      summary: "Criar nota de brainstorm",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["content"],
              properties: {
                content: { type: "string" },
              },
              example: { content: "Ideas for the new project..." },
            },
          },
        },
      },
      responses: {
        "200": { description: "Nota criada", content: { "application/json": { schema: { $ref: "#/components/schemas/BrainstormNote" } } } },
      },
    },
  })
  .patch("/brainstorm/:id", async ({ params, body }) => {
    const { id } = params;
    const { content } = body as { content?: string };
    const data: any = {};
    if (content !== undefined) data.content = content;
    return await prisma.brainstormNote.update({ where: { id }, data });
  }, {
    body: t.Object({
      content: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Alma"],
      summary: "Atualizar nota de brainstorm",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Nota atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/BrainstormNote" } } } },
      },
    },
  })
  .delete("/brainstorm/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.brainstormNote.delete({ where: { id } });
  }, {
    detail: {
      tags: ["Alma"],
      summary: "Remover nota de brainstorm",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "Nota removida" } },
    },
  });
