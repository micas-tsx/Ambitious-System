import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { swaggerConfig } from "./swagger";

export const authDetails = {
  detail: {
    tags: ["Auth"],
    description: "Endpoints de autenticação e gerenciamento de usuários",
    security: [],
  },
};

export const pessoalDetails = {
  detail: {
    tags: ["Pessoal"],
    description: "Pilar Pessoal - Gerenciamento de finanças, diário e metas",
  },
};

export const menteDetails = {
  detail: {
    tags: ["Mente"],
    description: "Pilar Mente - Estudos, biblioteca de livros e flashcards",
  },
};

export const corpoDetails = {
  detail: {
    tags: ["Corpo"],
    description: "Pilar Corpo - Avaliações físicas, treinos e dieta",
  },
};

export const almaDetails = {
  detail: {
    tags: ["Alma"],
    description: "Pilar Alma - Hobbies e brainstorming",
  },
};

export const dashboardDetails = {
  detail: {
    tags: ["Dashboard"],
    description: "Endpoints agregados para o dashboard principal",
  },
};

export { swaggerConfig, swagger };
