import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { fetchGreenhouseJobs } from "@/lib/ats/greenhouse";
import { fetchLeverJobs } from "@/lib/ats/lever";
import { upsertJobs } from "@/lib/upsert-jobs";

const schema = z.object({
  provider: z.enum(["GREENHOUSE", "LEVER"]),
  boardSlug: z.string().min(1).max(200),
  label: z.string().max(200).optional(),
});

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const connections = await prisma.connection.findMany({
    where: { userId },
    include: { jobs: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ connections });
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a valid provider and board slug." }, { status: 400 });
  }

  const { provider, boardSlug, label } = parsed.data;

  const fetchJobs = provider === "GREENHOUSE" ? fetchGreenhouseJobs : fetchLeverJobs;

  let jobs;
  try {
    jobs = await fetchJobs(boardSlug);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not reach that job board." },
      { status: 422 }
    );
  }

  let connection;
  try {
    connection = await prisma.connection.create({
      data: { userId, provider, boardSlug, label },
    });
  } catch {
    return NextResponse.json({ error: "You've already connected this board." }, { status: 409 });
  }

  await upsertJobs(connection.id, jobs);

  return NextResponse.json({ connection, jobsFound: jobs.length });
}
