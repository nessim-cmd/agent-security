import { NextResponse } from "next/server";
import { prisma } from "../../../../mastra/db/prisma";

export async function GET() {
  const targets = await prisma.target.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { workflows: true } },
    },
  });
  return NextResponse.json({ targets });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, description, type, endpoint, provider, model, apiKey, headers, templateId } = body;

  if (!name || !type) {
    return NextResponse.json({ error: "name and type are required" }, { status: 400 });
  }

  const target = await prisma.target.create({
    data: { name, description, type, endpoint, provider, model, apiKey, headers, templateId },
  });

  return NextResponse.json({ target }, { status: 201 });
}