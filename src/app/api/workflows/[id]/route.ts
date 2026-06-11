import { NextResponse } from "next/server";
import { prisma } from "../../../../../mastra/db/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workflow = await prisma.workflow.findUnique({
    where: { id },
    include: {
      target: true,
      runs: { orderBy: { startedAt: "desc" }, take: 10 },
    },
  });
  if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ workflow });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.workflow.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}