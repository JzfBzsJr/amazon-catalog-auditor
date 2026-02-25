"use client";

import { AuditResult } from "@/lib/api";

interface ExportButtonsProps {
  result: AuditResult;
}

export default function ExportButtons({ result }: ExportButtonsProps) {
  const dateSlug = new Date().toISOString().slice(0, 10);

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalog-audit-${dateSlug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    const header = ["query", "row", "sku", "field", "severity", "details", "product_type"];
    const rows: string[][] = [header];

    for (const q of result.queries) {
      for (const issue of q.issues) {
        rows.push([
          q.query_name,
          String(issue.row ?? ""),
          issue.sku ?? "",
          issue.field ?? "",
          issue.severity ?? "",
          `"${(issue.details ?? "").replace(/"/g, '""')}"`,
          issue.product_type ?? "",
        ]);
      }
    }

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalog-audit-${dateSlug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={downloadCSV}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        ⬇ Download CSV
      </button>
      <button
        onClick={downloadJSON}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        ⬇ Download JSON
      </button>
    </div>
  );
}
