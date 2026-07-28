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
  // Upsert by `name` (verified unique across all candidate files) rather than
  // delete-all-and-reinsert: `leads.technique_id` and `diagnose_sessions.technique_id`
  // are NOT NULL foreign keys with ON DELETE NO ACTION, so a full table wipe
  // fails outright the moment any real lead or session references a technique
  // that's about to be deleted. Upserting preserves existing ids (and therefore
  // those references) for every technique that's still approved, and only
  // removes rows that fell out of the approved set — skipping (not crashing on)
  // any of those still referenced elsewhere.
  const { rows: existingRows } = await client.query("select id, name from techniques");
  const approvedNames = new Set(approved.map((c) => c.name));

  let inserted = 0;
  let updated = 0;

  for (const c of approved) {
    const isExisting = existingRows.some((r) => r.name === c.name);
    if (isExisting) {
      await client.query(
        `update techniques
           set source_industry = $1, source_company = $2, mechanism = $3, evidence = $4,
               source_type = $5, target_verticals = $6, transfer_template = $7,
               problem_type = $8, source_url = $9, updated_at = now()
         where name = $10`,
        [
          c.sourceIndustry,
          c.sourceCompany,
          c.mechanism,
          c.evidence,
          c.sourceType,
          c.targetVerticals,
          c.transferTemplate,
          c.problemType,
          c.sourceUrl,
          c.name,
        ]
      );
      updated++;
      console.log(`Updated: ${c.name}`);
    } else {
      await client.query(
        `insert into techniques
          (name, source_industry, source_company, mechanism, evidence, source_type, target_verticals, transfer_template, problem_type, source_url)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          c.name,
          c.sourceIndustry,
          c.sourceCompany,
          c.mechanism,
          c.evidence,
          c.sourceType,
          c.targetVerticals,
          c.transferTemplate,
          c.problemType,
          c.sourceUrl,
        ]
      );
      inserted++;
      console.log(`Inserted: ${c.name}`);
    }
  }

  const staleRows = existingRows.filter((r) => !approvedNames.has(r.name));
  let removed = 0;
  let skipped = 0;
  for (const row of staleRows) {
    try {
      await client.query("delete from techniques where id = $1", [row.id]);
      removed++;
      console.log(`Removed (no longer approved): ${row.name}`);
    } catch (err) {
      skipped++;
      console.warn(
        `Skipped removing "${row.name}" — still referenced by a lead or diagnose session: ${err.message}`
      );
    }
  }

  const { rows } = await client.query("select count(*)::int as count from techniques");
  console.log(
    `\n${inserted} inserted, ${updated} updated, ${removed} removed, ${skipped} skipped (still referenced).`
  );
  console.log(`Live table now has ${rows[0].count} rows.`);
} finally {
  await client.end();
}
