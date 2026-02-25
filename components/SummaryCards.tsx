import { AuditResult } from "@/lib/api";

interface SummaryCardsProps {
  result: AuditResult;
}

export default function SummaryCards({ result }: SummaryCardsProps) {
  const criticalIssues = result.queries.reduce(
    (acc, q) => acc + q.issues.filter((i) => i.severity === "required").length,
    0
  );

  const cards = [
    {
      label: "Total Issues",
      value: result.total_issues,
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
    },
    {
      label: "Affected SKUs",
      value: result.total_affected_skus,
      color: "text-orange-600",
      bg: "bg-orange-50 border-orange-200",
    },
    {
      label: "Queries Run",
      value: result.total_queries,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
    },
    {
      label: "Critical Issues",
      value: criticalIssues,
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} border rounded-xl p-6`}
        >
          <p className="text-sm text-gray-600">{card.label}</p>
          <p className={`text-4xl font-bold mt-1 ${card.color}`}>
            {card.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
