import { NextResponse } from "next/server";
import { prisma } from "../../../../mastra/db/prisma";

export async function GET() {
  const workflows = await prisma.workflow.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      target: { select: { id: true, name: true, type: true } },
      _count: { select: { runs: true } },
    },
  });
  return NextResponse.json({ workflows });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, description, targetId, mode, attackCategories } = body;

  if (!name || !targetId) {
    return NextResponse.json({ error: "name and targetId required" }, { status: 400 });
  }

  const workflow = await prisma.workflow.create({
    data: {
      name,
      description,
      targetId,
      mode: mode ?? "manual",
      attackCategories: attackCategories ?? ["LLM01", "LLM07"],
    },
    include: {
      target: { select: { id: true, name: true, type: true } },
    },
  });

  return NextResponse.json({ workflow }, { status: 201 });
}