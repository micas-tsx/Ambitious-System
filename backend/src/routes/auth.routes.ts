import { Elysia, t } from "elysia";
import { prisma } from "../db/prisma";
import * as bcrypt from "bcryptjs";
import { authPlugin, isAuthenticated } from "../middleware/auth";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(authPlugin)
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        const { name, email, password } = body;

        // Verifica se usuário já existe
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          set.status = 400;
          return { error: "Email já cadastrado" };
        }

        // Criptografar Senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Criar usuário
        const newUser = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });

        return {
          message: "Usuário criado com sucesso",
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
          },
        };
      } catch (error) {
        set.status = 500;
        return { error: "Erro interno ao registrar usuário" };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, set, jwt }) => {
      try {
        const { email, password } = body;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          set.status = 401;
          return { error: "Credenciais inválidas" };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          set.status = 401;
          return { error: "Credenciais inválidas" };
        }

        // Gerar token
        const token = await jwt.sign({ sub: user.id });

        return {
          message: "Login bem sucedido",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        };
      } catch (error) {
        set.status = 500;
        return { error: "Erro interno no servidor" };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )
  .use(isAuthenticated)
  .get("/me", async ({ userId }) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) throw new Error("Usuário não encontrado");
    return user;
  });
