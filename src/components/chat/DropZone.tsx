"use client";

import { useRef } from "react";

interface Props {
  uploadedFile: { name: string; path: string } | null;
  uploading: boolean;
  onFile: (file: File) => void;
}

export function DropZone({
  uploadedFile,
  uploading,
  onFile,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div className="flex-shrink-0 px-4 pb-2">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="group flex items-center gap-3 px-4 py-2.5 rounded-lg border border-dashed cursor-pointer transition-all duration-150"
        style={
          uploading
            ? {
                borderColor: "var(--border-mid)",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-muted)",
              }
            : uploadedFile
            ? {
                borderColor: "#15803d",
                backgroundColor: "rgba(34,197,94,0.08)",
                color: "#22c55e",
              }
            : {
                borderColor: "var(--border-subtle)",
                backgroundColor: "transparent",
                color: "var(--text-muted)",
              }
        }
      >
        <span className="text-sm flex-shrink-0">
          {uploading ? "⏳" : uploadedFile ? "✓" : "📎"}
        </span>

        <span className="text-[10px] font-mono truncate">
          {uploading
            ? "Uploading file…"
            : uploadedFile
            ? `${uploadedFile.name} ready — triggers Indirect Injection test (LLM01)`
            : "Drop a file to test Indirect Prompt Injection (LLM01) · .txt .md .json"}
        </span>

        {!uploading && !uploadedFile && (
          <span
            className="text-[9px] font-mono ml-auto flex-shrink-0"
            style={{ color: "var(--text-faint)" }}
          >
            click or drag
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.json,.log,.csv"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}