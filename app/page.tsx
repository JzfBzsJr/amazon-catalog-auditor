"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import { runAudit } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const result = await runAudit(file);
      localStorage.setItem("auditResult", JSON.stringify(result));
      router.push("/results");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }, [file, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh]">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Your CLR File
          </h2>
          <p className="text-gray-500">
            Upload an Amazon Category Listing Report (.xlsx or .xlsm) to run a
            full catalog health audit across 9 checks.
          </p>
        </div>

        <FileUpload file={file} onFileSelect={setFile} />

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        <button
          onClick={handleAudit}
          disabled={!file || loading}
          className="mt-6 w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing 9 queries…
            </>
          ) : (
            "Run Audit"
          )}
        </button>

        {loading && (
          <p className="mt-2 text-center text-sm text-gray-400">
            Large CLRs (1000+ SKUs) may take 10–15 seconds. Please wait…
          </p>
        )}
      </div>
    </div>
  );
}
