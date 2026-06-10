"use client";

import { ChatSession } from "./types";
import { SessionItem } from "./SessionItem";

interface Props {
  open: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  loadingSessions: boolean;
  renamingId: string | null;
  renameValue: string;
  onNewSession: () => void;
  onSelectSession: (s: ChatSession) => void;
  onRenameStart: (s: ChatSession, e: React.MouseEvent) => void;
  onRenameChange: (v: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
}

export function Sidebar({
  open, sessions, activeSessionId, loadingSessions,
  renamingId, renameValue, onNewSession, onSelectSession,
  onRenameStart, onRenameChange, onRenameCommit, onRenameCancel, onDeleteSession,
}: Props) {
  return (
    <aside
      className="flex flex-col transition-all duration-200 ease-in-out overflow-hidden"
      style={{
        borderRight: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-surface)",
        width: open ? "256px" : "0px",
        minWidth: open ? "256px" : "0px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
          <span
            className="text-[10px] font-bold tracking-[0.15em] uppercase font-mono"
            style={{ color: "var(--text-secondary)" }}
          >
            Sessions
          </span>
        </div>
        <button
          onClick={onNewSession}
          title="New session"
          className="w-6 h-6 flex items-center justify-center rounded-md text-sm font-mono transition-all"
          style={{
            border: "1px solid var(--border-mid)",
            color: "var(--accent-blue)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--accent-blue-hover)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--accent-blue)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-mid)";
          }}
        >
          +
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-1">
        {loadingSessions ? (
          <div className="flex items-center gap-2 px-4 py-4">
            <div
              className="w-1 h-1 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--text-faint)" }}
            />
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
              Loading sessions…
            </span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>No sessions yet</p>
            <p className="text-[9px] mt-1" style={{ color: "var(--border-mid)" }}>Click + to start one</p>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              isRenaming={session.id === renamingId}
              renameValue={renameValue}
              onSelect={() => onSelectSession(session)}
              onRenameStart={(e) => onRenameStart(session, e)}
              onRenameChange={onRenameChange}
              onRenameCommit={onRenameCommit}
              onRenameCancel={onRenameCancel}
              onDelete={(e) => onDeleteSession(session.id, e)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: "var(--text-faint)" }}
        />
        <span className="text-[9px] font-mono" style={{ color: "var(--text-faint)" }}>
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} · logs/sessions/
        </span>
      </div>
    </aside>
  );
}