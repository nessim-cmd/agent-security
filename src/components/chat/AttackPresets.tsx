"use client";

import { ATTACK_PRESETS, OWASP_META } from "./types";

interface Props {
  activePreset: string;
  onSelect: (key: string) => void;
}

export function AttackPresets({ activePreset, onSelect }: Props) {
  const grouped: Record<string, string[]> = {};

  for (const [key, val] of Object.entries(ATTACK_PRESETS)) {
    if (!grouped[val.owasp]) grouped[val.owasp] = [];
    grouped[val.owasp].push(key);
  }

  return (
    <div
      className="flex-shrink-0 px-4 py-2.5 border-b"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--bg-base)",
      }}
    >
      <p
        className="text-[9px] font-mono tracking-[0.12em] uppercase mb-2"
        style={{ color: "var(--text-faint)" }}
      >
        Attack Presets — OWASP Top 10
      </p>

      <div className="flex flex-wrap gap-1.5">
        {Object.entries(grouped).map(([owasp, keys]) => {
          const meta = OWASP_META[owasp];

          return keys.map((key) => {
            const isActive = activePreset === key;
            const label = key.split(" · ")[1] ?? key;

            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className="group relative text-[10px] font-mono px-2.5 py-1 rounded border transition-all duration-150"
                style={
                  isActive
                    ? undefined
                    : {
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-muted)",
                        backgroundColor: "transparent",
                      }
                }
              >
                <span
                  className="mr-1 text-[9px] opacity-60"
                  style={{
                    color: isActive
                      ? undefined
                      : "var(--text-faint)",
                  }}
                >
                  {owasp}
                </span>

                <span
                  className={
                    isActive
                      ? `${meta?.color ?? ""}`
                      : ""
                  }
                >
                  {label}
                </span>
              </button>
            );
          });
        })}
      </div>
    </div>
  );
}