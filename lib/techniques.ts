import { getPool } from "@/lib/db";
import type { Technique } from "@/types/technique";

const SELECT_FIELDS = `
  id, name, source_industry, source_company, mechanism, evidence, source_type,
  target_verticals, transfer_template, problem_type, source_url,
  created_at, updated_at
`;

function toTechnique(r: any): Technique {
  return {
    id: r.id,
    name: r.name,
    sourceIndustry: r.source_industry,
    sourceCompany: r.source_company,
    mechanism: r.mechanism,
    evidence: r.evidence,
    sourceType: r.source_type,
    targetVerticals: r.target_verticals,
    transferTemplate: r.transfer_template,
    problemType: r.problem_type,
    sourceUrl: r.source_url,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  };
}

export async function getTechniques(): Promise<Technique[]> {
  const pool = getPool();
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from techniques order by name`);
  return rows.map(toTechnique);
}

export async function getTechniqueById(id: string): Promise<Technique | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `select ${SELECT_FIELDS} from techniques where id = $1`,
    [id]
  );
  return rows[0] ? toTechnique(rows[0]) : null;
}
