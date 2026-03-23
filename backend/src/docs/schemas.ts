export const authSchemas = {
  RegisterRequest: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", minLength: 2, description: "Nome completo do usuário" },
      email: { type: "string", format: "email", description: "Email do usuário" },
      password: { type: "string", minLength: 6, description: "Senha (mínimo 6 caracteres)" },
    },
    example: {
      name: "João Silva",
      email: "joao@example.com",
      password: "minhasenha123",
    },
  },
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string" },
    },
    example: {
      email: "joao@example.com",
      password: "minhasenha123",
    },
  },
  AuthResponse: {
    type: "object",
    properties: {
      message: { type: "string" },
      token: { type: "string", description: "Token JWT" },
      user: { $ref: "#/components/schemas/User" },
    },
  },
};

export const pessoalSchemas = {
  CreateBankAccount: {
    type: "object",
    required: ["name", "balance"],
    properties: {
      name: { type: "string", description: "Nome da conta bancária" },
      balance: { type: "number", description: "Saldo inicial" },
    },
    example: { name: "Conta Corrente", balance: 5000 },
  },
  CreateTransaction: {
    type: "object",
    required: ["accountId", "amount", "type", "category"],
    properties: {
      accountId: { type: "string", format: "uuid" },
      amount: { type: "number", description: "Valor da transação" },
      type: { type: "string", enum: ["INCOME", "EXPENSE"], description: "Tipo de transação" },
      category: { type: "string", description: "Categoria (ex: Alimentação, Salário)" },
      description: { type: "string", description: "Descrição opcional" },
    },
    example: {
      accountId: "uuid-da-conta",
      amount: 150.50,
      type: "EXPENSE",
      category: "Alimentação",
      description: "Supermercado semanal",
    },
  },
  CreateCreditCard: {
    type: "object",
    required: ["accountId", "name", "limit", "invoiceDate"],
    properties: {
      accountId: { type: "string", format: "uuid" },
      name: { type: "string", description: "Nome do cartão" },
      limit: { type: "number", description: "Limite de crédito" },
      invoiceDate: { type: "number", minimum: 1, maximum: 31, description: "Dia do fechamento da fatura" },
    },
    example: {
      accountId: "uuid-da-conta",
      name: "Nubank",
      limit: 5000,
      invoiceDate: 15,
    },
  },
  UpdateCreditCard: {
    type: "object",
    properties: {
      name: { type: "string" },
      limit: { type: "number" },
      invoiceDate: { type: "number", minimum: 1, maximum: 31 },
    },
  },
  CreateTask: {
    type: "object",
    required: ["title", "category"],
    properties: {
      journalId: { type: "string", format: "uuid", description: "ID do diário (opcional)" },
      title: { type: "string", description: "Título da tarefa" },
      category: { type: "string", description: "Categoria (Saúde, Estudos, Pessoal)" },
      rating: { type: "number", minimum: 0, maximum: 5 },
      isCompleted: { type: "boolean" },
    },
    example: {
      journalId: "uuid-opcional",
      title: "Estudar TypeScript",
      category: "Estudos",
      rating: 0,
      isCompleted: false,
    },
  },
  UpdateTask: {
    type: "object",
    properties: {
      title: { type: "string" },
      category: { type: "string" },
      rating: { type: "number", minimum: 0, maximum: 5 },
      isCompleted: { type: "boolean" },
    },
  },
  CreateGoal: {
    type: "object",
    required: ["title", "status"],
    properties: {
      title: { type: "string", description: "Título da meta" },
      status: { type: "string", enum: ["TODO", "DOING", "DONE"] },
    },
    example: { title: "Aprender React", status: "TODO" },
  },
  UpdateGoal: {
    type: "object",
    properties: {
      title: { type: "string" },
      status: { type: "string", enum: ["TODO", "DOING", "DONE"] },
    },
  },
  CreateJournalEntry: {
    type: "object",
    required: ["content"],
    properties: {
      content: { type: "string", description: "Conteúdo da nota" },
    },
    example: { content: "Hoje foi um dia produtivo..." },
  },
};

export const menteSchemas = {
  CreateNotebook: {
    type: "object",
    required: ["title"],
    properties: { title: { type: "string" } },
    example: { title: "Fundamentos de Programação" },
  },
  CreateLesson: {
    type: "object",
    required: ["notebookId", "name", "status"],
    properties: {
      notebookId: { type: "string", format: "uuid" },
      name: { type: "string", description: "Nome da aula" },
      status: { type: "string", enum: ["NOT_STARTED", "DOING", "COMPLETED"] },
      nextReview: { type: "string", format: "date-time", description: "Próxima revisão" },
    },
    example: {
      notebookId: "uuid-do-caderno",
      name: "Aula 1: Introdução",
      status: "NOT_STARTED",
    },
  },
  UpdateLesson: {
    type: "object",
    properties: {
      name: { type: "string" },
      status: { type: "string", enum: ["NOT_STARTED", "DOING", "COMPLETED"] },
      nextReview: { type: "string", format: "date-time" },
    },
  },
  CreateFlashcard: {
    type: "object",
    required: ["notebookId", "front", "back"],
    properties: {
      notebookId: { type: "string", format: "uuid" },
      front: { type: "string", description: "Frente do cartão (pergunta)" },
      back: { type: "string", description: "Verso do cartão (resposta)" },
    },
    example: {
      notebookId: "uuid-do-caderno",
      front: "O que é TypeScript?",
      back: "TypeScript é um superset do JavaScript...",
    },
  },
  ReviewFlashcard: {
    type: "object",
    required: ["quality"],
    properties: {
      quality: { type: "number", minimum: 0, maximum: 5, description: "Qualidade da resposta (0-5)" },
    },
    example: { quality: 4 },
  },
  CreateBook: {
    type: "object",
    required: ["title", "status"],
    properties: {
      title: { type: "string" },
      author: { type: "string" },
      status: { type: "string", enum: ["READING", "WISHLIST", "NEXT_UP", "FINISHED"] },
    },
    example: {
      title: "Clean Code",
      author: "Robert C. Martin",
      status: "READING",
    },
  },
  UpdateBook: {
    type: "object",
    properties: {
      title: { type: "string" },
      author: { type: "string" },
      status: { type: "string", enum: ["READING", "WISHLIST", "NEXT_UP", "FINISHED"] },
      rating: { type: "number", minimum: 0, maximum: 5 },
    },
  },
};

export const corpoSchemas = {
  CreateAssessment: {
    type: "object",
    required: ["weight", "goal"],
    properties: {
      weight: { type: "number", description: "Peso em kg" },
      bodyFat: { type: "number", description: "Percentual de gordura corporal" },
      muscleMass: { type: "number", description: "Massa muscular em kg" },
      goal: { type: "string", description: "Meta do usuário" },
    },
    example: {
      weight: 75.5,
      bodyFat: 18.5,
      muscleMass: 35,
      goal: "Hipertrofia",
    },
  },
  CreateWorkout: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
      weekday: { type: "string", description: "Dia da semana (ex: Segunda, Terça)" },
    },
    example: { name: "Treino de Peito", weekday: "Segunda" },
  },
  UpdateWorkout: {
    type: "object",
    properties: {
      name: { type: "string" },
      weekday: { type: "string" },
    },
  },
  CreateExercise: {
    type: "object",
    required: ["name", "sets", "reps", "weight"],
    properties: {
      name: { type: "string" },
      sets: { type: "number" },
      reps: { type: "number" },
      weight: { type: "number" },
    },
    example: { name: "Supino Reto", sets: 4, reps: 12, weight: 60 },
  },
  UpdateExercise: {
    type: "object",
    properties: {
      name: { type: "string" },
      sets: { type: "number" },
      reps: { type: "number" },
      weight: { type: "number" },
    },
  },
  CreateMeal: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", description: "Nome da refeição (ex: Café da Manhã)" },
      time: { type: "string", description: "Horário (HH:mm)" },
    },
    example: { name: "Café da Manhã", time: "08:00" },
  },
  UpdateMeal: {
    type: "object",
    properties: {
      name: { type: "string" },
      time: { type: "string" },
    },
  },
  CreateMealItem: {
    type: "object",
    required: ["foodId", "amountInGrams"],
    properties: {
      foodId: { type: "string", format: "uuid" },
      amountInGrams: { type: "number" },
    },
    example: { foodId: "uuid-do-alimento", amountInGrams: 150 },
  },
  UpdateMealItem: {
    type: "object",
    required: ["amountInGrams"],
    properties: {
      amountInGrams: { type: "number" },
    },
  },
  CreateFood: {
    type: "object",
    required: ["name", "calories", "protein", "carbs", "fats"],
    properties: {
      name: { type: "string" },
      calories: { type: "number", description: "Calorias por 100g" },
      protein: { type: "number", description: "Proteína por 100g" },
      carbs: { type: "number", description: "Carboidratos por 100g" },
      fats: { type: "number", description: "Gorduras por 100g" },
    },
    example: {
      name: "Frango Grelhado",
      calories: 165,
      protein: 31,
      carbs: 0,
      fats: 3.6,
    },
  },
  UpdateFood: {
    type: "object",
    properties: {
      name: { type: "string" },
      calories: { type: "number" },
      protein: { type: "number" },
      carbs: { type: "number" },
      fats: { type: "number" },
    },
  },
  CreateRecipe: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
      instructions: { type: "string" },
      ingredients: { type: "string" },
    },
    example: {
      name: "Smoothie Proteico",
      instructions: "Bater todos os ingredientes no liquidificador",
      ingredients: "200ml leite, 1 banana, 2 scoops whey",
    },
  },
  UpdateRecipe: {
    type: "object",
    properties: {
      name: { type: "string" },
      instructions: { type: "string" },
      ingredients: { type: "string" },
    },
  },
  CreateHydration: {
    type: "object",
    required: ["amount"],
    properties: {
      amount: { type: "number", description: "Quantidade em ml" },
    },
    example: { amount: 250 },
  },
  HydrationResponse: {
    type: "object",
    properties: {
      consumed: { type: "number", description: "Total consumido hoje em ml" },
      goal: { type: "number", description: "Meta diária em ml" },
      intakes: {
        type: "array",
        items: { $ref: "#/components/schemas/WaterIntake" },
      },
    },
  },
};

export const almaSchemas = {
  CreateHobby: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
      category: { type: "string", description: "Categoria (ex: Artes, Esportes)" },
    },
    example: { name: "Pintura", category: "Artes" },
  },
  UpdateHobby: {
    type: "object",
    properties: {
      name: { type: "string" },
      category: { type: "string" },
    },
  },
  CreateBrainstorm: {
    type: "object",
    required: ["title", "content"],
    properties: {
      title: { type: "string" },
      content: { type: "string" },
      category: { type: "string" },
    },
    example: {
      title: "Ideia de App",
      content: "Desenvolver um aplicativo de produtividade...",
      category: "Projetos",
    },
  },
  UpdateBrainstorm: {
    type: "object",
    properties: {
      title: { type: "string" },
      content: { type: "string" },
      category: { type: "string" },
    },
  },
};
