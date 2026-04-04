/**
 * Run: npm run check:login
 * Verifies DATABASE_URL, connection, and demo password hashes.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PAIRS: [string, string][] = [
  ["demo@soracalm.app", "demo123456"],
  ["premium@soracalm.app", "premium123456"],
];

async function main() {
  console.log("DATABASE_URL set:", !!process.env.DATABASE_URL);
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Postgres: OK\n");
  } catch (e) {
    console.error("Postgres: FAILED — start DB and fix DATABASE_URL in .env");
    console.error(e);
    process.exit(1);
  }

  for (const [email, password] of PAIRS) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`${email}: MISSING — run npm run db:setup`);
      continue;
    }
    if (!user.passwordHash) {
      console.log(`${email}: no passwordHash`);
      continue;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log(`${email}: ${ok ? "password OK" : "password MISMATCH (re-run seed)"}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
