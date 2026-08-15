import mongoose from "mongoose";
import "dotenv/config";

const MONGODB_URI = process.env.DATABASE_URL!;

const SkillSchema = new mongoose.Schema({ name: { type: String, unique: true } });
const DomainSchema = new mongoose.Schema({ name: { type: String, unique: true } });

const Skill = mongoose.models.Skill || mongoose.model("Skill", SkillSchema);
const Domain = mongoose.models.Domain || mongoose.model("Domain", DomainSchema);

const skills = [
  "React", "TypeScript", "Python", "Node.js", "UI/UX Design",
  "PostgreSQL", "MongoDB", "Docker", "Machine Learning", "Mobile Dev",
  "Solidity", "Rust", "Go", "AWS", "GraphQL", "Next.js",
];

const domains = [
  "Web Dev", "AI/ML", "Mobile", "Blockchain", "DevOps",
  "Data Science", "Design", "Open Source", "IoT", "SaaS",
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  for (const name of skills) {
    await Skill.updateOne({ name }, { name }, { upsert: true });
  }
  for (const name of domains) {
    await Domain.updateOne({ name }, { name }, { upsert: true });
  }
  console.log("Seeded skills and domains");
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
