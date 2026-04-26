import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swaggerConfig } from "./docs/swagger";
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
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }))
  // Documentação Swagger (acessível em /swagger)
  .use(swaggerConfig)
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
  .onError(({ error, set }) => {
    console.error("API Error:", error.message);
    set.status = 500;
    return { message: error.message };
  })
  .listen(3001);

console.log(`🦊 Ambitious System API is running at ${app.server?.hostname}:${app.server?.port}`);
