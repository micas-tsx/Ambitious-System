import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authPlugin = (app: Elysia) =>
  app.use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "ambitious_super_secret_key",
    })
  );

export const isAuthenticated = (app: Elysia) =>
  app
    .use(authPlugin)
    .derive(async ({ jwt, headers, set }) => {
      const auth = headers.authorization;
      if (!auth || !auth.startsWith("Bearer ")) {
        set.status = 401;
        throw new Error("Não autorizado");
      }
      const token = auth.slice(7);
      const payload = await jwt.verify(token);
      if (!payload) {
        set.status = 401;
        throw new Error("Token inválido");
      }
      return {
        userId: payload.sub as string,
      };
    });
