import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

const schema = z.object({ status: z.enum(["SUBMITTED", "FAILED"]) });

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status." }, { status: 400 });

  const application = await prisma.application.findUnique({ where: { id } });
  if (!application || application.userId !== userId) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const updated = await prisma.application.update({
    where: { id },
    data: {
      status: parsed.data.status,
      submittedAt: parsed.data.status === "SUBMITTED" ? new Date() : null,
    },
  });

  return NextResponse.json({ application: updated });
}
