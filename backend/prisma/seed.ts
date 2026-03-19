import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Limpar banco de dados (Opcional, mas bom para garantir pureza)
  await prisma.transaction.deleteMany();
  await prisma.creditCard.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.task.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.goalBoard.deleteMany();
  await prisma.studyLesson.deleteMany();
  await prisma.studyNotebook.deleteMany();
  await prisma.book.deleteMany();
  await prisma.mealItem.deleteMany();
  await prisma.dietMeal.deleteMany();
  await prisma.physicalAssessment.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.workoutRoutine.deleteMany();
  await prisma.hobby.deleteMany();
  await prisma.brainstormNote.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.user.deleteMany();

  // 2. Criar Usuário de Teste
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("password123", salt);

  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      password: hashedPassword,
    },
  });

  console.log(`✅ User created: ${user.email}`);

  // ==========================================
  // PILAR 1: PESSOAL
  // ==========================================

  const account1 = await prisma.bankAccount.create({
    data: {
      userId: user.id,
      name: "Nubank",
      balance: 1500.0,
    },
  });

  const account2 = await prisma.bankAccount.create({
    data: {
      userId: user.id,
      name: "Inter",
      balance: 500.0,
    },
  });

  await prisma.transaction.createMany({
    data: [
      { accountId: account1.id, amount: -50.0, type: "EXPENSE", category: "Comida", description: "Ifood" },
      { accountId: account1.id, amount: 3000.0, type: "INCOME", category: "Salário", description: "Pagamento mensal" },
    ],
  });

  const journal = await prisma.journalEntry.create({
    data: {
      userId: user.id,
      content: "Hoje o dia foi produtivo. Finalizei o backend do Ambitious System!",
      tasks: {
        create: [
          { title: "Estudar Prisma 7", category: "Estudos", rating: 5, isCompleted: true },
          { title: "Beber 2L de água", category: "Saúde", rating: 4, isCompleted: false },
        ],
      },
    },
  });

  await prisma.goalBoard.createMany({
    data: [
      { userId: user.id, title: "Comprar Monitor 4K", status: "TODO" },
      { userId: user.id, title: "Aprender Next.js App Router", status: "DOING" },
    ],
  });

  console.log("✅ Pillar 1 (Pessoal) seeded");

  // ==========================================
  // PILAR 2: MENTE
  // ==========================================

  const notebook = await prisma.studyNotebook.create({
    data: {
      userId: user.id,
      title: "Desenvolvimento Fullstack",
      lessons: {
        create: [
          { name: "Server Actions no Next.js", status: "COMPLETED" },
          { name: "Prisma Adapters", status: "DOING", nextReview: new Date() },
        ],
      },
    },
  });

  await prisma.book.createMany({
    data: [
      { userId: user.id, title: "Hábitos Atômicos", author: "James Clear", status: "READING" },
      { userId: user.id, title: "Clean Code", author: "Robert C. Martin", status: "WISHLIST" },
      { userId: user.id, title: "O Alquimista", author: "Paulo Coelho", status: "FINISHED" },
    ],
  });

  console.log("✅ Pillar 2 (Mente) seeded");

  // ==========================================
  // PILAR 3: CORPO
  // ==========================================

  await prisma.physicalAssessment.create({
    data: {
      userId: user.id,
      weight: 75.5,
      bodyFat: 15.0,
      goal: "Bulking",
    },
  });

  const routine = await prisma.workoutRoutine.create({
    data: {
      userId: user.id,
      name: "Treino A - Peito e Tríceps",
      exercises: {
        create: [
          { name: "Supino Reto", sets: 4, reps: 10, weight: 60 },
          { name: "Tríceps Corda", sets: 3, reps: 12, weight: 25 },
        ],
      },
    },
  });

  const food1 = await prisma.foodItem.create({
    data: { name: "Peito de Frango", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  });

  const food2 = await prisma.foodItem.create({
    data: { name: "Arroz Branco", calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
  });

  await prisma.dietMeal.create({
    data: {
      userId: user.id,
      name: "Almoço Padrão",
      items: {
        create: [
          { foodId: food1.id, amountInGrams: 150 },
          { foodId: food2.id, amountInGrams: 200 },
        ],
      },
    },
  });

  await prisma.recipe.createMany({
    data: [
      { name: "Omelete de Frango", instructions: "Misture os ovos com frango desfiado e frite.", ingredients: ["Ovos", "Frango", "Sal"] },
      { name: "Shake de Banana", instructions: "Bata tudo no liquidificador.", ingredients: ["Banana", "Leite", "Aveia"] },
    ],
  });

  console.log("✅ Pillar 3 (Corpo) seeded");

  // ==========================================
  // PILAR 4: ALMA
  // ==========================================

  await prisma.hobby.createMany({
    data: [
      { userId: user.id, name: "Tocar Violão", schedule: "Sábado à tarde" },
      { userId: user.id, name: "Jogar Xadrez", schedule: "Diariamente" },
    ],
  });

  await prisma.brainstormNote.createMany({
    data: [
      { userId: user.id, content: "Ideia: Criar um plugin para o VS Code que automatiza o seed do Prisma." },
      { userId: user.id, content: "Lembrete: Comprar presente de aniversário para a mãe." },
    ],
  });

  console.log("✅ Pillar 4 (Alma) seeded");

  console.log("🌳 Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
