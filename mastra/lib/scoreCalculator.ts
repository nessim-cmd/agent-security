type SeverityCount = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
};

/**
 * Calculate a security risk score from 0-100.
 * Higher score = MORE vulnerable (worse security).
 * 0-20   = Secure
 * 21-40  = Low Risk
 * 41-60  = Medium Risk
 * 61-80  = High Risk
 * 81-100 = Critical
 */
export function calculateSecurityScore(counts: SeverityCount): number {
  const weights = {
    critical: 40,
    high: 20,
    medium: 10,
    low: 5,
    info: 1,
  };

  const raw =
    counts.critical * weights.critical +
    counts.high * weights.high +
    counts.medium * weights.medium +
    counts.low * weights.low +
    counts.info * weights.info;

  // Cap at 100
  return Math.min(100, raw);
}

export function getScoreLabel(score: number): string {
  if (score <= 20) return "Secure";
  if (score <= 40) return "Low Risk";
  if (score <= 60) return "Medium Risk";
  if (score <= 80) return "High Risk";
  return "Critical";
}

export function getScoreColor(score: number): string {
  if (score <= 20) return "#22c55e";
  if (score <= 40) return "#84cc16";
  if (score <= 60) return "#f59e0b";
  if (score <= 80) return "#f97316";
  return "#ef4444";
}