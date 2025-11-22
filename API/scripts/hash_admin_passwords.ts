// scripts/hash_admin_passwords.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

function isHashed(s?: string | null) {
  // bcrypt hash costuma começar com $2a$, $2b$ ou $2y$ e ~60 chars
  return !!s && /^\$2[aby]\$/.test(s) && s.length >= 50;
}

async function main() {
  const admins = await prisma.admin.findMany({
    select: { id: true, nome: true, email: true, senha: true },
  });

  let changed = 0;
  for (const a of admins) {
    if (!isHashed(a.senha)) {
      const plain = String(a.senha ?? "");
      const hash = await bcrypt.hash(plain, ROUNDS);
      await prisma.admin.update({ where: { id: a.id }, data: { senha: hash } });
      console.log(`✔️ Hasheada a senha do admin #${a.id} (${a.email})`);
      changed++;
    } else {
      console.log(`↩️ Já era hash: admin #${a.id} (${a.email})`);
    }
  }

  console.log(`\nFim. Atualizados: ${changed}/${admins.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
