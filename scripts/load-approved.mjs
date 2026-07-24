import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidatesDir = path.join(__dirname, "../research/candidates");

const files = readdirSync(candidatesDir).filter((f) => f.endsWith(".json"));

const approved = [];
for (const file of files) {
  const data = JSON.parse(readFileSync(path.join(candidatesDir, file), "utf8"));
  for (const candidate of data.candidates) {
    if (candidate.status === "approved") {
      approved.push({ ...candidate, problemType: data.problemType });
    }
  }
}

console.log(`Found ${approved.length} approved candidates across ${files.length} files.`);

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  await client.query("delete from techniques");

  for (const c of approved) {
    await client.query(
      `insert into techniques
        (name, source_industry, source_company, mechanism, evidence, target_verticals, transfer_template, problem_type)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        c.name,
        c.sourceIndustry,
        c.sourceCompany,
        c.mechanism,
        c.evidence,
        c.targetVerticals,
        c.transferTemplate,
        c.problemType,
      ]
    );
    console.log(`Inserted: ${c.name}`);
  }

  const { rows } = await client.query("select count(*)::int as count from techniques");
  console.log(`Live table now has ${rows[0].count} rows.`);
} finally {
  await client.end();
}
