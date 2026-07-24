import { getPool } from "@/lib/db";
import type { Technique } from "@/types/technique";

export async function getTechniques(): Promise<Technique[]> {
  const pool = getPool();
  const { rows } = await pool.query(`
    select id, name, source_industry, source_company, mechanism, evidence,
           target_verticals, transfer_template, problem_type, created_at, updated_at
    from techniques
    order by name
  `);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    sourceIndustry: r.source_industry,
    sourceCompany: r.source_company,
    mechanism: r.mechanism,
    evidence: r.evidence,
    targetVerticals: r.target_verticals,
    transferTemplate: r.transfer_template,
    problemType: r.problem_type,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  }));
}
