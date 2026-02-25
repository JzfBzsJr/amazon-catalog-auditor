// Empty string → relative paths (/api/audit, /api/queries)
// Works on Vercel (same origin) and with `vercel dev` locally
const API_URL = "";

export interface AuditIssue {
  row: number;
  sku: string;
  field: string;
  severity: "required" | "conditional" | "warning" | "info";
  details: string;
  product_type?: string;
}

export interface QueryResult {
  query_name: string;
  description: string;
  total_issues: number;
  affected_skus: number;
  issues: AuditIssue[];
  metadata: Record<string, unknown>;
}

export interface AuditResult {
  timestamp: string;
  total_queries: number;
  total_issues: number;
  total_affected_skus: number;
  queries: QueryResult[];
}

export async function runAudit(file: File): Promise<AuditResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/audit`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

export async function getQueries(): Promise<{ name: string; description: string }[]> {
  const response = await fetch(`${API_URL}/queries`);
  return response.json();
}
