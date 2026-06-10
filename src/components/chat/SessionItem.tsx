"use client";

import { useEffect, useRef } from "react";
import { ChatSession, formatDate } from "./types";

interface Props {
  session: ChatSession;
  isActive: boolean;
  isRenaming: boolean;
  renameValue: string;
  onSelect: () => void;
  onRenameStart: (e: React.MouseEvent) => void;
  onRenameChange: (v: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function SessionItem({
  session,
  isActive,
  isRenaming,
  renameValue,
  onSelect,
  onRenameStart,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
  onDelete,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
    }
  }, [isRenaming]);

  return (
    <div
      onClick={onSelect}
      className="group relative flex flex-col gap-0.5 px-3 py-2.5 mx-2 my-0.5 rounded-md cursor-pointer transition-all duration-150"
      style={{
        backgroundColor: isActive
          ? "var(--bg-elevated)"
          : "transparent",
        border: `1px solid ${
          isActive
            ? "var(--border-mid)"
            : "transparent"
        }`,
      }}
    >
      {isActive && (
        <span className="absolute left-0 top-3 bottom-3 w-[3px] bg-rose-500 rounded-r-full" />
      )}

      {isRenaming ? (
        <input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => onRenameChange(e.target.value)}
          onBlur={onRenameCommit}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRenameCommit();
            if (e.key === "Escape") onRenameCancel();
            e.stopPropagation();
          }}
          className="w-full rounded px-2 py-1 text-xs font-mono focus:outline-none"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-mid)",
            color: "var(--text-primary)",
          }}
        />
      ) : (
        <>
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="text-[9px] flex-shrink-0"
              style={{
                color: isActive
                  ? "#f43f5e"
                  : "var(--text-faint)",
              }}
            >
              {isActive ? "▶" : "▷"}
            </span>

            <span
              className="text-xs truncate leading-snug"
              style={{
                color: isActive
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              }}
            >
              {session.title}
            </span>
          </div>

          <div className="flex items-center justify-between pl-4">
            <span
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              {session.messageCount > 0
                ? `${session.messageCount} msg`
                : "empty"}
              {" · "}
              {formatDate(session.updatedAt)}
            </span>

            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onRenameStart}
                title="Rename"
                className="w-5 h-5 flex items-center justify-center rounded text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                ✎
              </button>

              <button
                onClick={onDelete}
                title="Delete"
                className="w-5 h-5 flex items-center justify-center rounded text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}