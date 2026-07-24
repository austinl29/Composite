import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "../supabase/migrations");
const file = process.argv[2];

if (!file) {
  console.error("Usage: node scripts/migrate.mjs <migration-filename>");
  process.exit(1);
}

const sql = readFileSync(path.join(migrationsDir, file), "utf8");

const client = new Client({ connectionString: process.env.DATABASE_URL });

await client.connect();
try {
  await client.query(sql);
  console.log(`Migration applied: ${file}`);
} finally {
  await client.end();
}
