"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuditResult } from "@/lib/api";
import SummaryCards from "@/components/SummaryCards";
import IssuesTable from "@/components/IssuesTable";
import ExportButtons from "@/components/ExportButtons";

const PRIORITY_GROUPS = [
  {
    label: "🔴 Critical",
    severity: "required",
    description: "Must fix — Amazon rejects listings",
    border: "border-red-400",
    bg: "bg-red-50",
    text: "text-red-700",
  },
  {
    label: "🟡 Conditional",
    severity: "conditional",
    description: "Fix based on product type",
    border: "border-yellow-400",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  {
    label: "🟠 Warning",
    severity: "warning",
    description: "Best practice (RUFUS, title length)",
    border: "border-orange-400",
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  {
    label: "🔵 Info",
    severity: "info",
    description: "Suggestions (unused fields, variations)",
    border: "border-blue-400",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
];

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AuditResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auditResult");
    if (!stored) {
      router.replace("/");
      return;
    }
    setResult(JSON.parse(stored));
  }, [router]);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Loading results…</p>
      </div>
    );
  }

  // Severity counts
  const severityCounts: Record<string, number> = {};
  for (const q of result.queries) {
    for (const issue of q.issues) {
      severityCounts[issue.severity] =
        (severityCounts[issue.severity] || 0) + 1;
    }
  }

  // Top problematic SKUs
  const skuCounts: Record<string, number> = {};
  for (const q of result.queries) {
    for (const issue of q.issues) {
      if (issue.sku) skuCounts[issue.sku] = (skuCounts[issue.sku] || 0) + 1;
    }
  }
  const topSkus = Object.entries(skuCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const maxCount = topSkus[0]?.[1] ?? 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Results</h2>
          <p className="text-sm text-gray-500 mt-1">
            Generated {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons result={result} />
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            New Audit
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards result={result} />

      {/* Priority Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Priority Breakdown</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PRIORITY_GROUPS.map((group) => (
            <div
              key={group.severity}
              className={`border-l-4 ${group.border} ${group.bg} rounded-r-lg p-4`}
            >
              <p className="font-medium text-gray-900 text-sm">{group.label}</p>
              <p className={`text-3xl font-bold mt-1 ${group.text}`}>
                {(severityCounts[group.severity] ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">{group.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">All Issues</h3>
        <IssuesTable result={result} />
      </div>

      {/* Top Problematic SKUs */}
      {topSkus.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Top Problematic SKUs
          </h3>
          <div className="space-y-2">
            {topSkus.map(([sku, count]) => (
              <div key={sku} className="flex items-center gap-3">
                <span className="font-mono text-sm w-44 truncate shrink-0 text-gray-700">
                  {sku}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-orange-400 h-full rounded-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  >
                    <span className="text-xs text-white font-semibold">
                      {count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
