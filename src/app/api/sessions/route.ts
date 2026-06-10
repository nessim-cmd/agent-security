import { NextResponse } from "next/server";
import { prisma } from "../../../../mastra/db/prisma";

// GET /api/sessions?agentId=securityAgent
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId") ?? "securityAgent";

  const sessions = await prisma.session.findMany({
    where: { agentId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      title: s.title,
      agentId: s.agentId,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      messageCount: s._count.messages,
    })),
  });
}

// POST /api/sessions
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const session = await prisma.session.create({
    data: {
      title: body.title ?? "New Session",
      agentId: body.agentId ?? "securityAgent",
    },
  });

  return NextResponse.json({
    session: {
      id: session.id,
      title: session.title,
      agentId: session.agentId,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      messageCount: 0,
    },
  });
}

// PATCH /api/sessions — rename
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { id, title } = body;
  if (!id || !title)
    return NextResponse.json({ error: "Missing id or title" }, { status: 400 });

  await prisma.session.update({ where: { id }, data: { title } });
  return NextResponse.json({ ok: true });
}

// DELETE /api/sessions?id=xxx
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.session.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}