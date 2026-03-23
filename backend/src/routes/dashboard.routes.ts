import { Elysia } from "elysia";
import { prisma } from "../db/prisma";
import { isAuthenticated } from "../middleware/auth";

export const dashboardRoutes = new Elysia({ prefix: "/dashboard" })
  .use(isAuthenticated)
  .get("/resumo", async ({ userId }) => {
    try {
      const accounts = await prisma.bankAccount.findMany({
        where: { userId },
        select: { balance: true }
      });
      const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

      const readingBooks = await prisma.book.count({
        where: { userId, status: "READING" }
      });
      const completedLessons = await prisma.studyLesson.count({
        where: { notebook: { userId }, status: "COMPLETED" }
      });

      const latestAssessment = await prisma.physicalAssessment.findFirst({
        where: { userId },
        orderBy: { date: "desc" },
        select: { weight: true }
      });

      const hobbyCount = await prisma.hobby.count({
        where: { userId }
      });

      return {
        pessoal: { totalBalance },
        mente: { readingBooks, completedLessons },
        corpo: { currentWeight: latestAssessment?.weight || 0 },
        alma: { hobbyCount },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Dashboard Stats Error:", error);
      throw new Error("Erro ao carregar estatísticas do dashboard");
    }
  }, {
    detail: {
      tags: ["Dashboard"],
      summary: "Obter resumo do dashboard",
      description: "Retorna um resumo agregado com estatísticas dos 4 pilares: Pessoal, Mente, Corpo e Alma.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": {
          description: "Resumo do dashboard",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  pessoal: {
                    type: "object",
                    properties: { totalBalance: { type: "number" } },
                  },
                  mente: {
                    type: "object",
                    properties: {
                      readingBooks: { type: "number" },
                      completedLessons: { type: "number" },
                    },
                  },
                  corpo: {
                    type: "object",
                    properties: { currentWeight: { type: "number" } },
                  },
                  alma: {
                    type: "object",
                    properties: { hobbyCount: { type: "number" } },
                  },
                  timestamp: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
      },
    },
  });
