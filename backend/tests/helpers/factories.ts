let counter = 0;

function nextId(): string {
  return `mock-id-${++counter}`;
}

export function createBankAccountData() {
  return {
    name: `Account ${nextId()}`,
    balance: 1000.0,
  };
}

export function createTransactionData(accountId: string, type: 'INCOME' | 'EXPENSE' = 'EXPENSE') {
  return {
    accountId,
    amount: 100.0,
    type,
    category: 'Alimentação',
    description: 'Test transaction',
  };
}

export function createCreditCardData(accountId: string) {
  return {
    accountId,
    name: 'Nubank',
    limit: 5000.0,
    invoiceDate: 15,
  };
}

export function createJournalEntryData() {
  return {
    content: 'Test journal entry content',
  };
}

export function createTaskData(journalId?: string) {
  return {
    journalId: journalId || undefined,
    title: `Task ${nextId()}`,
    category: 'Trabalho',
    rating: 3,
    isCompleted: false,
  };
}

export function createGoalData() {
  return {
    title: `Goal ${nextId()}`,
    status: 'TODO',
  };
}

export function createNotebookData() {
  return {
    title: 'Study Notes',
  };
}

export function createLessonData(notebookId: string) {
  return {
    notebookId,
    name: `Lesson ${nextId()}`,
    status: 'NOT_STARTED',
  };
}

export function createFlashcardData(notebookId: string) {
  return {
    notebookId,
    front: 'Question?',
    back: 'Answer.',
  };
}

export function createBookData() {
  return {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    status: 'READING',
  };
}

export function createAssessmentData() {
  return {
    weight: 75.0,
    bodyFat: 18.0,
    muscleMass: 35.0,
    goal: 'Hipertrofia',
  };
}

export function createWorkoutData() {
  return {
    name: 'Treino de Peito',
    weekday: 'Segunda',
  };
}

export function createExerciseData() {
  return {
    name: 'Supino Reto',
    sets: 4,
    reps: 12,
    weight: 60.0,
  };
}

export function createMealData() {
  return {
    name: 'Almoço',
    time: '12:00',
  };
}

export function createFoodData() {
  return {
    name: 'Frango Grelhado',
    calories: 200,
    protein: 30.0,
    carbs: 0,
    fats: 5.0,
  };
}

export function createRecipeData() {
  return {
    name: 'Frango com Arroz',
    instructions: 'Cook chicken and rice together.',
    ingredients: ['chicken', 'rice', 'salt'],
  };
}

export function createHydrationData() {
  return {
    amount: 300,
  };
}

export function createHobbyData() {
  return {
    name: 'Leitura',
    schedule: 'Sábados às 14h',
  };
}

export function createBrainstormData() {
  return {
    content: 'Test brainstorm content.',
  };
}
