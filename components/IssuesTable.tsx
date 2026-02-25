"use client";

import { useState, useMemo } from "react";
import { AuditResult, AuditIssue } from "@/lib/api";

interface IssuesTableProps {
  result: AuditResult;
}

type FlatIssue = AuditIssue & { query_name: string };

const SEVERITY_ORDER: Record<string, number> = {
  required: 0,
  conditional: 1,
  warning: 2,
  info: 3,
};

const SEVERITY_BADGE: Record<string, string> = {
  required: "bg-red-100 text-red-700",
  conditional: "bg-yellow-100 text-yellow-800",
  warning: "bg-orange-100 text-orange-700",
  info: "bg-blue-100 text-blue-700",
};

const PAGE_SIZE = 100;

export default function IssuesTable({ result }: IssuesTableProps) {
  const [severityFilter, setSeverityFilter] = useState("");
  const [queryFilter, setQueryFilter] = useState("");
  const [page, setPage] = useState(0);

  const queryNames = useMemo(
    () => result.queries.map((q) => q.query_name),
    [result]
  );

  const allIssues = useMemo<FlatIssue[]>(() => {
    const flat: FlatIssue[] = [];
    for (const q of result.queries) {
      for (const issue of q.issues) {
        flat.push({ ...issue, query_name: q.query_name });
      }
    }
    return flat;
  }, [result]);

  const filtered = useMemo(() => {
    let issues = allIssues;
    if (severityFilter) issues = issues.filter((i) => i.severity === severityFilter);
    if (queryFilter) issues = issues.filter((i) => i.query_name === queryFilter);
    return [...issues].sort(
      (a, b) =>
        (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99)
    );
  }, [allIssues, severityFilter, queryFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const resetPage = (cb: () => void) => {
    cb();
    setPage(0);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <select
          value={severityFilter}
          onChange={(e) => resetPage(() => setSeverityFilter(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All severities</option>
          <option value="required">🔴 Critical (required)</option>
          <option value="conditional">🟡 Conditional</option>
          <option value="warning">🟠 Warning</option>
          <option value="info">🔵 Info</option>
        </select>

        <select
          value={queryFilter}
          onChange={(e) => resetPage(() => setQueryFilter(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All queries</option>
          {queryNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <span className="text-sm text-gray-500">
          {filtered.length.toLocaleString()} issues
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Query</th>
              <th className="px-4 py-3 font-medium text-gray-600">SKU</th>
              <th className="px-4 py-3 font-medium text-gray-600">Field</th>
              <th className="px-4 py-3 font-medium text-gray-600">Severity</th>
              <th className="px-4 py-3 font-medium text-gray-600">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((issue, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {issue.query_name}
                </td>
                <td className="px-4 py-3 font-mono font-medium text-gray-900">
                  {issue.sku}
                </td>
                <td className="px-4 py-3 text-gray-700">{issue.field}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      SEVERITY_BADGE[issue.severity] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {issue.severity}
                  </span>
                </td>
                <td
                  className="px-4 py-3 text-gray-600 max-w-xs truncate"
                  title={issue.details}
                >
                  {issue.details}
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  No issues match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page + 1} of {totalPages} &nbsp;·&nbsp;{" "}
            {filtered.length.toLocaleString()} total issues
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
