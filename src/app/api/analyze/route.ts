import { NextResponse } from "next/server";
import { prisma } from "../../../../mastra/db/prisma";
import { mastra } from "../../../../mastra";
import { calculateSecurityScore } from "../../../../mastra/lib/scoreCalculator";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { workflowRunId } = body;

  if (!workflowRunId) {
    return NextResponse.json({ error: "workflowRunId required" }, { status: 400 });
  }

  // Load all attack runs for this workflow run that haven't been analyzed yet
  const attackRuns = await prisma.attackRun.findMany({
    where: { workflowRunId },
    orderBy: { createdAt: "asc" },
  });

  if (attackRuns.length === 0) {
    return NextResponse.json({ error: "No attack runs found for this workflowRunId" }, { status: 404 });
  }

  const findings = [];
  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

  for (const run of attackRuns) {
    // Build the prompt for the analysis agent
    const prompt = [
      `Attack name: ${run.attackName}`,
      `OWASP category: ${run.owaspCategory}`,
      `Attack succeeded: ${run.success === true ? "YES" : run.success === false ? "NO" : "UNKNOWN"}`,
      ``,
      `Payload sent to target:`,
      run.payload,
      ``,
      `Target response:`,
      run.response ?? "(no response recorded)",
    ].join("\n");

    // Ask analysis agent to produce a finding
    const agentResponse = await mastra.getAgent("analysisAgent").generate([
      { role: "user", content: prompt },
    ]);

    // Parse the finding
    let finding = {
      title: run.attackName,
      severity: "info" as string,
      confidence: 50,
      description: "Analysis could not be completed.",
      evidence: null as string | null,
      recommendation: "Review the attack run manually.",
    };

    try {
      const raw = agentResponse.text ?? JSON.stringify(agentResponse);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      finding = {
        title: parsed.title ?? run.attackName,
        severity: parsed.severity ?? "info",
        confidence: parsed.confidence ?? 50,
        description: parsed.description ?? "",
        evidence: parsed.evidence ?? null,
        recommendation: parsed.recommendation ?? "",
      };
    } catch {
      // Use defaults if parse fails
    }

    // Count severity for score calculation
    const sev = finding.severity as keyof typeof severityCounts;
    if (sev in severityCounts) severityCounts[sev]++;

    // Save finding to DB
    const savedFinding = await prisma.finding.create({
      data: {
        workflowRunId,
        attackRunId: run.id,
        title: finding.title,
        owaspCategory: run.owaspCategory,
        severity: finding.severity,
        confidence: finding.confidence,
        description: finding.description,
        evidence: finding.evidence,
        recommendation: finding.recommendation,
      },
    });

    // Update the AttackRun with final success value if not already set
    if (run.success === null) {
      await prisma.attackRun.update({
        where: { id: run.id },
        data: { success: finding.severity !== "info" },
      });
    }

    findings.push(savedFinding);
  }

  // Calculate and save the security score
  const securityScore = calculateSecurityScore(severityCounts);

  await prisma.workflowRun.update({
    where: { id: workflowRunId },
    data: {
      status: "done",
      securityScore,
      finishedAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    workflowRunId,
    securityScore,
    scoreLabel: securityScore <= 20 ? "Secure" : securityScore <= 40 ? "Low Risk" : securityScore <= 60 ? "Medium Risk" : securityScore <= 80 ? "High Risk" : "Critical",
    severityCounts,
    totalFindings: findings.length,
    findings: findings.map(f => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      confidence: f.confidence,
      owaspCategory: f.owaspCategory,
    })),
  });
}