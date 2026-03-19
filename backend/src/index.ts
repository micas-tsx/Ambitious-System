import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authRoutes } from "./routes/auth.routes";
import { pessoalRoutes } from "./routes/pessoal.routes";
import { menteRoutes } from "./routes/mente.routes";
import { corpoRoutes } from "./routes/corpo.routes";
import { almaRoutes } from "./routes/alma.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";
import { prisma } from "./db/prisma";

const app = new Elysia()
  // Configuração global de CORS
  .use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }))
  // Gerador de doc do Swagger (acessível em /swagger)
  .use(swagger({
    documentation: {
      info: {
        title: "Ambitious System API",
        version: "1.0.0",
      }
    }
  }))
  // Conectar rotas de autenticação (JWT setup acontece dentro deste módulo)
  .use(authRoutes)
  // Conectar rotas do Pilar Pessoal
  .use(pessoalRoutes)
  // Conectar rotas do Pilar Mente
  .use(menteRoutes)
  // Conectar rotas do Pilar Corpo
  .use(corpoRoutes)
  // Conectar rotas do Pilar Alma
  .use(almaRoutes)
  // Conectar rotas do Dashboard
  .use(dashboardRoutes)
  // Healthcheck com verificação de Banco
  .get("/", async () => {
    try {
      // Tenta uma operação simples no banco
      const userCount = await prisma.user.count();
      return { 
        status: "Ok", 
        message: "Ambitious System API is running 🚀", 
        database: "Connected",
        stats: { users: userCount },
        timestamp: new Date().toISOString() 
      };
    } catch (error) {
      console.error("Healthcheck DB Error:", error);
      return { 
        status: "Error", 
        message: "API is running but Database is disconnected ❌", 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString() 
      };
    }
  })
  .listen(3001);

console.log(`🦊 Ambitious System API is running at ${app.server?.hostname}:${app.server?.port}`);
