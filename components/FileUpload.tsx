"use client";

import { useCallback } from "react";

interface FileUploadProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

export default function FileUpload({ file, onFileSelect }: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (
        dropped &&
        (dropped.name.endsWith(".xlsx") || dropped.name.endsWith(".xlsm"))
      ) {
        onFileSelect(dropped);
      }
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) onFileSelect(selected);
    },
    [onFileSelect]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => document.getElementById("clr-file-input")?.click()}
      className="border-2 border-dashed border-gray-300 rounded-xl p-14 text-center hover:border-orange-400 transition-colors cursor-pointer select-none"
    >
      <input
        id="clr-file-input"
        type="file"
        accept=".xlsx,.xlsm"
        onChange={handleChange}
        className="hidden"
      />

      {file ? (
        <div>
          <div className="text-5xl mb-3">📄</div>
          <p className="text-lg font-semibold text-gray-900">{file.name}</p>
          <p className="text-sm text-gray-500 mt-1">
            {(file.size / 1024 / 1024).toFixed(2)} MB — click to change
          </p>
        </div>
      ) : (
        <div>
          <div className="text-6xl mb-4">📁</div>
          <p className="text-lg font-medium text-gray-700">
            Drag &amp; drop your CLR file here
          </p>
          <p className="text-gray-500 mt-1">or click to browse</p>
          <p className="text-sm text-gray-400 mt-3">
            Supports .xlsx and .xlsm — up to 50 MB
          </p>
        </div>
      )}
    </div>
  );
}
