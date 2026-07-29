/**
 * Search diagnose_sessions by keyword and optional date range — a local,
 * read-only research tool for reviewing real usage before drafting a
 * proposal for a specific prospect (e.g. every flower-shop-related session
 * before pitching a florist).
 *
 * Not exposed anywhere in the live app — run on demand via Claude Code / node.
 * Requires DATABASE_URL, so run with --env-file:
 *
 *   node --env-file=.env.local scripts/search-sessions.mjs --keyword flower
 *   node --env-file=.env.local scripts/search-sessions.mjs --keyword hvac --after 2026-07-01 --before 2026-07-31
 *   node --env-file=.env.local scripts/search-sessions.mjs --keyword flower --leads-only
 *
 * Flags:
 *   --keyword <term>   required. Case-insensitive substring match (SQL ILIKE,
 *                       no fuzzy search/ranking) across: problem description,
 *                       business_context, matched technique name, and the
 *                       matched technique's current mechanism text.
 *   --after <date>     optional. YYYY-MM-DD. Only sessions on/after this date.
 *   --before <date>    optional. YYYY-MM-DD. Only sessions on/before this date.
 *   --leads-only       optional flag. Only sessions that converted to a lead.
 *
 * Read-only: never writes to diagnose_sessions, leads, or any other table.
 */
import { Client } from "pg";

function parseArgs(argv) {
  const args = { after: null, before: null, leadsOnly: false, keyword: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--keyword") {
      args.keyword = argv[++i];
    } else if (arg === "--after") {
      args.after = argv[++i];
    } else if (arg === "--before") {
      args.before = argv[++i];
    } else if (arg === "--leads-only") {
      args.leadsOnly = true;
    } else {
      console.error(`Unrecognized argument: ${arg}`);
      printUsageAndExit(1);
    }
  }
  return args;
}

function printUsageAndExit(code) {
  console.error(`
Usage: node --env-file=.env.local scripts/search-sessions.mjs --keyword <term> [--after YYYY-MM-DD] [--before YYYY-MM-DD] [--leads-only]

  --keyword <term>   required. Case-insensitive substring match across problem,
                      business_context, matched technique name, and mechanism.
  --after <date>      optional. Only sessions on/after this date (YYYY-MM-DD).
  --before <date>     optional. Only sessions on/before this date (YYYY-MM-DD).
  --leads-only        optional. Only sessions that converted to a lead.
`);
  process.exit(code);
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validateDate(label, value) {
  if (value === null) return;
  if (!DATE_PATTERN.test(value)) {
    console.error(`Invalid ${label} date "${value}" — expected YYYY-MM-DD.`);
    printUsageAndExit(1);
  }
}

const args = parseArgs(process.argv.slice(2));

if (!args.keyword || !args.keyword.trim()) {
  console.error("Missing required --keyword argument.");
  printUsageAndExit(1);
}
validateDate("--after", args.after);
validateDate("--before", args.before);

function truncate(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

function formatDate(d) {
  return new Date(d).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  const conditions = [
    "(s.problem ilike $1 or s.business_context ilike $1 or s.technique_name ilike $1 or t.mechanism ilike $1)",
  ];
  const params = [`%${args.keyword}%`];

  if (args.after) {
    params.push(args.after);
    conditions.push(`s.created_at::date >= $${params.length}::date`);
  }
  if (args.before) {
    params.push(args.before);
    conditions.push(`s.created_at::date <= $${params.length}::date`);
  }
  if (args.leadsOnly) {
    conditions.push("exists (select 1 from leads l where l.session_id = s.id)");
  }

  const { rows: sessions } = await client.query(
    `select
       s.id, s.created_at, s.problem, s.business_context, s.technique_name,
       s.confidence, s.grounded_plan_text, s.composite_insight_text, s.path_forward_text,
       t.mechanism as technique_mechanism
     from diagnose_sessions s
     left join techniques t on t.id = s.technique_id
     where ${conditions.join(" and ")}
     order by s.created_at desc`,
    params
  );

  let leadsBySession = new Map();
  if (sessions.length > 0) {
    const sessionIds = sessions.map((s) => s.id);
    const { rows: leads } = await client.query(
      `select session_id, id, name, email from leads where session_id = any($1::uuid[])`,
      [sessionIds]
    );
    leadsBySession = new Map(leads.map((l) => [l.session_id, l]));
  }

  const leadCount = sessions.filter((s) => leadsBySession.has(s.id)).length;
  const distinctTechniques = [...new Set(sessions.map((s) => s.technique_name))].sort();

  console.log("=".repeat(72));
  console.log(`Keyword: "${args.keyword}"${args.after ? `  after: ${args.after}` : ""}${args.before ? `  before: ${args.before}` : ""}${args.leadsOnly ? "  (leads only)" : ""}`);
  console.log(`${sessions.length} matching session${sessions.length === 1 ? "" : "s"} found, ${leadCount} converted to a lead.`);
  if (distinctTechniques.length > 0) {
    console.log(`Techniques matched: ${distinctTechniques.join(", ")}`);
  }
  console.log("=".repeat(72));

  if (sessions.length === 0) {
    console.log("\nNo sessions matched.");
  }

  for (const s of sessions) {
    const lead = leadsBySession.get(s.id);
    console.log("\n" + "-".repeat(72));
    console.log(`Date: ${formatDate(s.created_at)}`);
    console.log(`Problem: ${s.problem}`);
    console.log(`Business context: ${s.business_context ? s.business_context : "(none provided)"}`);
    console.log(`Matched technique: ${s.technique_name} (${s.confidence} confidence)`);
    console.log(`Grounded plan: ${truncate(s.grounded_plan_text, 220)}`);
    console.log(
      `Composite Insight: ${s.composite_insight_text ? "\n" + s.composite_insight_text : "(none — suppressed this session)"}`
    );
    console.log(`Path forward: ${s.path_forward_text ? s.path_forward_text : "(none)"}`);
    console.log(
      lead
        ? `Lead: YES — ${lead.name} <${lead.email}>`
        : "Lead: no"
    );
  }
  console.log("\n" + "=".repeat(72));
} finally {
  await client.end();
}
