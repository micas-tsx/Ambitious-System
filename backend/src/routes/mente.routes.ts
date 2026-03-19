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
  })
  .post(
    "/cadernos",
    async ({ userId, body }) => {
      const { title } = body;
      return await prisma.studyNotebook.create({
        data: {
          title,
          userId,
        },
      });
    },
    {
      body: t.Object({
        title: t.String(),
      }),
    }
  )
  .delete("/cadernos/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.studyNotebook.delete({
      where: { id },
    });
  })
  .post(
    "/aulas",
    async ({ userId, body, set }) => {
      const { notebookId, name, status, nextReview } = body;

      // Verifica se o caderno pertence ao usuário
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
    },
    {
      body: t.Object({
        notebookId: t.String(),
        name: t.String(),
        status: t.String(), // ex: "NOT_STARTED", "DOING", "COMPLETED"
        nextReview: t.Optional(t.String()), // Data em string ISO
      }),
    }
  )
  .patch(
    "/aulas/:id",
    async ({ params, body }) => {
      const { id } = params;
      return await prisma.studyLesson.update({
        where: { id },
        data: body,
      });
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        status: t.Optional(t.String()),
        nextReview: t.Optional(t.String()),
      }),
    }
  )
  .delete("/aulas/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.studyLesson.delete({
      where: { id },
    });
  })

  // === BIBLIOTECA: LIVROS ===
  .get("/livros", async ({ userId }) => {
    return await prisma.book.findMany({
      where: { userId },
    });
  })
  .post(
    "/livros",
    async ({ userId, body }) => {
      const { title, author, status } = body;
      return await prisma.book.create({
        data: {
          title,
          author,
          status,
          userId,
        },
      });
    },
    {
      body: t.Object({
        title: t.String(),
        author: t.Optional(t.String()),
        status: t.String(), // ex: "READING", "FINISHED"
      }),
    }
  )
  .patch(
    "/livros/:id",
    async ({ params, body }) => {
      const { id } = params;
      return await prisma.book.update({
        where: { id },
        data: body,
      });
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        author: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
    }
  )
  .delete("/livros/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.book.delete({
      where: { id },
    });
  });
