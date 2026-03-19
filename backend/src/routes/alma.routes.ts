import { Elysia, t } from "elysia";
import { prisma } from "../db/prisma";
import { isAuthenticated } from "../middleware/auth";

export const almaRoutes = new Elysia({ prefix: "/alma" })
  .use(isAuthenticated)

  // === HOBBIES ===
  .get("/hobbies", async ({ userId }) => {
    return await prisma.hobby.findMany({
      where: { userId },
    });
  })
  .post(
    "/hobbies",
    async ({ userId, body }) => {
      const { name, category } = body;
      return await prisma.hobby.create({
        data: {
          name,
          category,
          userId,
        },
      });
    },
    {
      body: t.Object({
        name: t.String(),
        category: t.Optional(t.String()),
      }),
    }
  )
  .delete("/hobbies/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.hobby.delete({
      where: { id },
    });
  })

  // === BRAINSTORM / NOTAS ===
  .get("/brainstorm", async ({ userId }) => {
    return await prisma.brainstormNote.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  })
  .post(
    "/brainstorm",
    async ({ userId, body }) => {
      const { title, content, category } = body;
      return await prisma.brainstormNote.create({
        data: {
          title,
          content,
          category,
          userId,
        },
      });
    },
    {
      body: t.Object({
        title: t.String(),
        content: t.String(),
        category: t.Optional(t.String()),
      }),
    }
  )
  .delete("/brainstorm/:id", async ({ params }) => {
    const { id } = params;
    return await prisma.brainstormNote.delete({
      where: { id },
    });
  });
