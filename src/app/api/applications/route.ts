import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

const schema = z.object({ jobId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Missing jobId." }, { status: 400 });

  const job = await prisma.job.findUnique({
    where: { id: parsed.data.jobId },
    include: { connection: true },
  });

  if (!job || job.connection.userId !== userId) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  const application = await prisma.application.upsert({
    where: { userId_jobId: { userId, jobId: job.id } },
    create: { userId, jobId: job.id, status: "REVIEW" },
    update: { status: "REVIEW" },
  });

  return NextResponse.json({ application });
}
