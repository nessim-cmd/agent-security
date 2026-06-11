import { NextResponse } from "next/server";
import { prisma } from "../../../../../mastra/db/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const target = await prisma.target.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ target });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const target = await prisma.target.update({ where: { id }, data: body });
  return NextResponse.json({ target });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.target.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}