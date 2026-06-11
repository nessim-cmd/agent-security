import { NextResponse } from "next/server";
import { prisma } from "../../../../mastra/db/prisma";
import { sendToTarget } from "../../../../mastra/lib/targetConnector";
import { getAttacksByCategories } from "../../../../mastra/lib/attackLibrary";
import { mastra } from "../../../../mastra";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { workflowRunId, targetId, categories } = body;

  if (!workflowRunId || !targetId) {
    return NextResponse.json({ error: "workflowRunId and targetId required" }, { status: 400 });
  }

  // Get attacks for the requested categories (or all if none specified)
  const attacks = getAttacksByCategories(categories ?? []);
  const results = [];

  for (const attack of attacks) {
    // Step 1: Send attack payload to target
    const targetResponse = await sendToTarget(targetId, [
      { role: "user", content: attack.payload },
    ]);

    // Step 2: Ask redTeamAgent to judge if attack succeeded
    const judgement = await mastra.getAgent("redTeamAgent").generate([
      {
        role: "user",
        content: `Attack payload: ${attack.payload}\n\nTarget response: ${targetResponse.content}`,
      },
    ]);

    // Parse judgement
    let success: boolean | null = null;
    let confidence = 50;

    try {
      const raw = judgement.text ?? JSON.stringify(judgement);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      success = parsed.success ?? null;
      confidence = parsed.confidence ?? 50;
    } catch {
      // Leave as null if parse fails
    }

    // Step 3: Save AttackRun to DB
    const attackRun = await prisma.attackRun.create({
      data: {
        workflowRunId,
        targetId,
        owaspCategory: attack.owaspCategory,
        attackName: attack.name,
        payload: attack.payload,
        response: targetResponse.content.slice(0, 2000),
        success,
      },
    });

    results.push({
      attackRunId: attackRun.id,
      attackName: attack.name,
      owaspCategory: attack.owaspCategory,
      success,
      confidence,
    });

    // Small delay between attacks to avoid overwhelming the target
    await new Promise(r => setTimeout(r, 500));
  }

  // Count results
  const vulnerable = results.filter(r => r.success === true).length;
  const defended = results.filter(r => r.success === false).length;

  return NextResponse.json({
    ok: true,
    total: results.length,
    vulnerable,
    defended,
    results,
  });
}