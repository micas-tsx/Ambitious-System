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

        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          set.status = 400;
          return { error: "Email já cadastrado" };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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
      detail: {
        tags: ["Auth"],
        summary: "Registrar novo usuário",
        description: "Cria um novo usuário no sistema. O email deve ser único.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", minLength: 2 },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                },
                example: { name: "João Silva", email: "joao@example.com", password: "minhasenha123" },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Usuário criado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Email já cadastrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "Email já cadastrado" },
              },
            },
          },
        },
      },
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
      detail: {
        tags: ["Auth"],
        summary: "Login de usuário",
        description: "Autentica o usuário e retorna um token JWT para acesso aos endpoints protegidos.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
                example: { email: "joao@example.com", password: "minhasenha123" },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login bem sucedido",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    token: { type: "string", description: "Token JWT" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Credenciais inválidas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "Credenciais inválidas" },
              },
            },
          },
        },
      },
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
  }, {
    detail: {
      tags: ["Auth"],
      summary: "Obter usuário atual",
      description: "Retorna os dados do usuário autenticado através do token JWT.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": {
          description: "Dados do usuário",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
      },
    },
  });
