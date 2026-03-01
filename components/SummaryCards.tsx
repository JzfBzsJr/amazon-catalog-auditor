import { AuditResult } from "@/lib/api";

interface SummaryCardsProps {
  result: AuditResult;
}

const TIER_COLORS: Record<string, string> = {
  Good: "text-green-600",
  Fair: "text-yellow-600",
  Weak: "text-orange-600",
  Critical: "text-red-600",
};

function getRufusSummary(result: AuditResult) {
  const rufusQuery = result.queries.find((q) => q.query_name === "rufus-bullets");
  if (!rufusQuery) return null;
  const summaryIssue = rufusQuery.issues.find(
    (i: any) => i.sku === "SUMMARY" && i.avg_catalog_score !== undefined
  ) as any;
  return summaryIssue ?? null;
}

export default function SummaryCards({ result }: SummaryCardsProps) {
  const criticalIssues = result.queries.reduce(
    (acc, q) =>
      acc + q.issues.filter((i: any) => i.severity === "required").length,
    0
  );

  const rufus = getRufusSummary(result);
  const avgScore: number | null = rufus?.avg_catalog_score ?? null;
  const tierDist: Record<string, number> = rufus?.tier_distribution ?? {};

  // Determine top tier for color coding
  const topTier =
    avgScore !== null
      ? avgScore >= 4
        ? "Good"
        : avgScore >= 3
        ? "Fair"
        : avgScore >= 2
        ? "Weak"
        : "Critical"
      : null;

  const cards = [
    {
      label: "Total Issues",
      value: result.total_issues.toLocaleString(),
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
    },
    {
      label: "Affected SKUs",
      value: result.total_affected_skus.toLocaleString(),
      color: "text-orange-600",
      bg: "bg-orange-50 border-orange-200",
    },
    {
      label: "Queries Run",
      value: result.total_queries.toLocaleString(),
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
    },
    {
      label: "Critical Issues",
      value: criticalIssues.toLocaleString(),
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-200",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} border rounded-xl p-6`}
          >
            <p className="text-sm text-gray-600">{card.label}</p>
            <p className={`text-4xl font-bold mt-1 ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {avgScore !== null && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                RUFUS Catalog Health Score
              </p>
              <p
                className={`text-4xl font-bold ${
                  topTier ? TIER_COLORS[topTier] : "text-gray-700"
                }`}
              >
                {avgScore.toFixed(1)}
                <span className="text-xl font-normal text-gray-400">/5</span>
              </p>
              {topTier && (
                <p
                  className={`text-sm font-medium mt-1 ${TIER_COLORS[topTier]}`}
                >
                  {topTier}
                </p>
              )}
            </div>
            {Object.keys(tierDist).length > 0 && (
              <div className="flex gap-4 flex-wrap">
                {(["Good", "Fair", "Weak", "Critical"] as const).map((tier) =>
                  tierDist[tier] != null ? (
                    <div key={tier} className="text-center">
                      <p
                        className={`text-2xl font-bold ${TIER_COLORS[tier]}`}
                      >
                        {tierDist[tier]}
                      </p>
                      <p className="text-xs text-gray-500">{tier}</p>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
