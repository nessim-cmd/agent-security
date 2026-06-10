import { NextResponse } from "next/server";
import { prisma } from "../../../../../../mastra/db/prisma";

type MessagePart = {
  type: string;
  text?: string;
};

type IncomingMessage = {
  id?: string;
  role?: string;
  parts?: unknown;
  content?: string;
};

// GET /api/sessions/[id]/messages
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const messages = await prisma.message.findMany({
    where: { sessionId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      parts: m.parts,
      content: m.content,
    })),
  });
}

// POST /api/sessions/[id]/messages
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json().catch(() => ({}));
    const { messages } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages must be array" },
        { status: 400 }
      );
    }

    // Remove invalid messages coming from useChat()
    const validMessages: IncomingMessage[] = messages.filter(
      (m: IncomingMessage) =>
        m &&
        typeof m.role === "string" &&
        ["user", "assistant", "system"].includes(m.role)
    );

    console.log(
      `[Session ${id}] Received ${messages.length} messages, saving ${validMessages.length}`
    );

    // Replace all messages for this session
    await prisma.message.deleteMany({
      where: { sessionId: id },
    });

    if (validMessages.length > 0) {
      await prisma.message.createMany({
        data: validMessages.map((m) => ({
          id: m.id,
          sessionId: id,
          role: m.role!,
          content:
            typeof m.content === "string"
              ? m.content
              : Array.isArray(m.parts)
              ? (m.parts as MessagePart[])
                  .filter((p) => p.type === "text")
                  .map((p) => p.text ?? "")
                  .join("")
              : "",
          parts: Array.isArray(m.parts) ? m.parts : [],
        })),
      });
    }

    await prisma.session.update({
      where: { id },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      saved: validMessages.length,
    });
  } catch (error) {
    console.error("Failed to save session messages:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to save messages",
      },
      { status: 500 }
    );
  }
}