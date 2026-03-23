import { beforeAll, afterAll, afterEach } from '@jest/globals';

const prisma = {
  mealItem: { deleteMany: async () => {} },
  dietMeal: { deleteMany: async () => {} },
  exercise: { deleteMany: async () => {} },
  workoutRoutine: { deleteMany: async () => {} },
  physicalAssessment: { deleteMany: async () => {} },
  waterIntake: { deleteMany: async () => {} },
  recipe: { deleteMany: async () => {} },
  foodItem: { deleteMany: async () => {} },
  flashcard: { deleteMany: async () => {} },
  studyLesson: { deleteMany: async () => {} },
  studyNotebook: { deleteMany: async () => {} },
  book: { deleteMany: async () => {} },
  brainstormNote: { deleteMany: async () => {} },
  hobby: { deleteMany: async () => {} },
  task: { deleteMany: async () => {} },
  journalEntry: { deleteMany: async () => {} },
  goalBoard: { deleteMany: async () => {} },
  transaction: { deleteMany: async () => {} },
  creditCard: { deleteMany: async () => {} },
  bankAccount: { deleteMany: async () => {} },
  user: { deleteMany: async () => {} },
};

export { prisma };

beforeAll(async () => {
  console.log('Test suite started');
});

afterAll(async () => {
  console.log('Test suite completed');
});

afterEach(async () => {
  await cleanDatabase();
});

async function cleanDatabase() {
  await prisma.mealItem.deleteMany();
  await prisma.dietMeal.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.workoutRoutine.deleteMany();
  await prisma.physicalAssessment.deleteMany();
  await prisma.waterIntake.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.studyLesson.deleteMany();
  await prisma.studyNotebook.deleteMany();
  await prisma.book.deleteMany();
  await prisma.brainstormNote.deleteMany();
  await prisma.hobby.deleteMany();
  await prisma.task.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.goalBoard.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.creditCard.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.user.deleteMany();
}
