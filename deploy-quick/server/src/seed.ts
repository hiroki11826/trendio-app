import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required to run the seed script.");
}

const baselineUsers = [
  { email: "owner@nekocafe.com", name: "ねこカフェオーナー", password: "NekoCafe123!" },
  { email: "sales@nekocafe.com", name: "営業担当A", password: "SalesStrong#1" },
  { email: "ops@nekocafe.com", name: "運用担当B", password: "OpsSecure!2" },
];

async function main() {
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    for (const user of baselineUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await pool.query(
        `
          INSERT INTO "User" ("email", "name", "password", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, NOW(), NOW())
          ON CONFLICT ("email") DO UPDATE
          SET "name" = EXCLUDED."name", "password" = EXCLUDED."password", "updatedAt" = NOW();
        `,
        [user.email, user.name, hashedPassword],
      );
      console.log(`Ensured ${user.email}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Failed to seed login users", error);
  process.exit(1);
});
