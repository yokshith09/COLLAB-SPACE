import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const skills = [
    "React", "TypeScript", "Python", "Node.js", "UI/UX Design",
    "PostgreSQL", "Docker", "Machine Learning", "Mobile Dev", "Solidity",
    "Rust", "Go", "AWS", "GraphQL", "Next.js",
  ];
  const domains = [
    "Web Dev", "AI/ML", "Mobile", "Blockchain", "DevOps",
    "Data Science", "Design", "Open Source", "IoT", "SaaS",
  ];

  for (const name of skills) {
    await prisma.skill.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of domains) {
    await prisma.domain.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log("Seeded skills and domains");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
