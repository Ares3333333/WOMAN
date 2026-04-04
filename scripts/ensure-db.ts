import { execSync } from "node:child_process";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

execSync("npx prisma generate", { stdio: "inherit", cwd: process.cwd() });
execSync("npx prisma db push", { stdio: "inherit", cwd: process.cwd() });

async function main() {
  const prisma = new PrismaClient();
  try {
    const demo = await prisma.user.findUnique({ where: { email: "demo@soracalm.app" } });
    if (!demo) {
      console.log("[sora-calm] Seeding database (first run)…");
      execSync("npx prisma db seed", { stdio: "inherit", cwd: process.cwd() });
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
