import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => "Hello do Backend Ambitious System!")
  .listen(8000);

console.log(
  `Backend rodando em ${app.server?.hostname}:${app.server?.port}`
);