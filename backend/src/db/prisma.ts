import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new pg.Pool({ connectionString });

pool.on('connect', () => {
  console.log('🐘 PostgreSQL connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL Pool Error:', err);
});

const adapter = new PrismaPg(pool as any);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// No Prisma 7, usamos o adapter para conexões diretas
export const prisma =
  globalForPrisma.prisma || 
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
