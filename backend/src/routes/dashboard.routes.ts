import { Elysia } from "elysia";
import { prisma } from "../db/prisma";
import { isAuthenticated } from "../middleware/auth";

export const dashboardRoutes = new Elysia({ prefix: "/dashboard" })
  .use(isAuthenticated)
  .get("/resumo", async ({ userId }) => {
    try {
      // 1. Pessoal: Saldo Total
      const accounts = await prisma.bankAccount.findMany({
        where: { userId },
        select: { balance: true }
      });
      const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

      // 2. Mente: Livros lendo e aulas concluídas
      const readingBooks = await prisma.book.count({
        where: { userId, status: "READING" }
      });
      const completedLessons = await prisma.studyLesson.count({
        where: { notebook: { userId }, status: "COMPLETED" }
      });

      // 3. Corpo: Peso atual (última avaliação)
      const latestAssessment = await prisma.physicalAssessment.findFirst({
        where: { userId },
        orderBy: { date: "desc" },
        select: { weight: true }
      });

      // 4. Alma: Qtd de Hobbies
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
  });
