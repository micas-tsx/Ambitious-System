import { swagger } from "@elysiajs/swagger";

export const swaggerConfig = swagger({
  documentation: {
    info: {
      title: "Ambitious System API",
      version: "1.0.0",
      description: "API RESTful para o sistema de gerenciamento pessoal Ambitious System. Gerencia quatro pilares fundamentais: Pessoal, Mente, Corpo e Alma.",
      contact: {
        name: "Ambitious System",
        email: "support@ambitious.system",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Servidor de Desenvolvimento",
      },
    ],
    tags: [
      { name: "Auth", description: "Endpoints de autenticação" },
      { name: "Pessoal", description: "Pilar Pessoal - Finanças, Diário e Metas" },
      { name: "Mente", description: "Pilar Mente - Estudos, Biblioteca e Flashcards" },
      { name: "Corpo", description: "Pilar Corpo - Avaliações, Treinos e Dieta" },
      { name: "Alma", description: "Pilar Alma - Hobbies e Brainstorm" },
      { name: "Dashboard", description: "Endpoints agregados para dashboard" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT obtido através do endpoint /auth/login",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string", description: "Mensagem de erro" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        BankAccount: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            balance: { type: "number" },
            userId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            accountId: { type: "string", format: "uuid" },
            amount: { type: "number" },
            type: { type: "string", enum: ["INCOME", "EXPENSE"] },
            category: { type: "string" },
            description: { type: "string" },
            date: { type: "string", format: "date-time" },
          },
        },
        CreditCard: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            accountId: { type: "string", format: "uuid" },
            name: { type: "string" },
            limit: { type: "number" },
            invoiceDate: { type: "number", description: "Dia do fechamento da fatura (1-31)" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            journalId: { type: "string", format: "uuid" },
            title: { type: "string" },
            category: { type: "string" },
            rating: { type: "number" },
            isCompleted: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        GoalBoard: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            status: { type: "string", enum: ["TODO", "DOING", "DONE"] },
            userId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        StudyNotebook: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            userId: { type: "string", format: "uuid" },
            lessons: {
              type: "array",
              items: { $ref: "#/components/schemas/StudyLesson" },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        StudyLesson: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            notebookId: { type: "string", format: "uuid" },
            name: { type: "string" },
            status: { type: "string", enum: ["NOT_STARTED", "DOING", "COMPLETED"] },
            nextReview: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Flashcard: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            notebookId: { type: "string", format: "uuid" },
            front: { type: "string", description: "Frente do cartão (pergunta)" },
            back: { type: "string", description: "Verso do cartão (resposta)" },
            interval: { type: "number", description: "Intervalo em dias para próxima revisão" },
            ease: { type: "number", description: "Fator de facilidade (inicia em 2.5)" },
            nextReview: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Book: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            author: { type: "string" },
            status: { type: "string", enum: ["READING", "WISHLIST", "NEXT_UP", "FINISHED"] },
            rating: { type: "number", minimum: 0, maximum: 5, nullable: true },
            userId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        PhysicalAssessment: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            weight: { type: "number", description: "Peso em kg" },
            bodyFat: { type: "number", nullable: true, description: "Percentual de gordura corporal" },
            muscleMass: { type: "number", nullable: true, description: "Massa muscular em kg" },
            goal: { type: "string", description: "Meta do usuário" },
            date: { type: "string", format: "date-time" },
          },
        },
        WorkoutRoutine: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            weekday: { type: "string", nullable: true },
            userId: { type: "string", format: "uuid" },
            exercises: {
              type: "array",
              items: { $ref: "#/components/schemas/Exercise" },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Exercise: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            routineId: { type: "string", format: "uuid" },
            name: { type: "string" },
            sets: { type: "number" },
            reps: { type: "number" },
            weight: { type: "number", description: "Peso em kg" },
          },
        },
        DietMeal: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            name: { type: "string" },
            time: { type: "string", description: "Horário da refeição (HH:mm)" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/MealItem" },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        FoodItem: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            calories: { type: "number", description: "Calorias por 100g" },
            protein: { type: "number", description: "Proteína por 100g" },
            carbs: { type: "number", description: "Carboidratos por 100g" },
            fats: { type: "number", description: "Gorduras por 100g" },
          },
        },
        Recipe: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            instructions: { type: "string", nullable: true },
            ingredients: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        WaterIntake: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            amount: { type: "number", description: "Quantidade em ml" },
            date: { type: "string", format: "date-time" },
          },
        },
        Hobby: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            name: { type: "string" },
            category: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        BrainstormNote: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            title: { type: "string" },
            content: { type: "string" },
            category: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
});
