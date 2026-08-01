import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { fetchGreenhouseJobs } from "@/lib/ats/greenhouse";
import { fetchLeverJobs } from "@/lib/ats/lever";
import { upsertJobs } from "@/lib/upsert-jobs";

async function getOwnedConnection(userId: string, id: string) {
  const connection = await prisma.connection.findUnique({ where: { id } });
  if (!connection || connection.userId !== userId) return null;
  return connection;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const connection = await getOwnedConnection(userId, id);
  if (!connection) return NextResponse.json({ error: "Connection not found." }, { status: 404 });

  const fetchJobs = connection.provider === "GREENHOUSE" ? fetchGreenhouseJobs : fetchLeverJobs;

  let jobs;
  try {
    jobs = await fetchJobs(connection.boardSlug);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not reach that job board." },
      { status: 422 }
    );
  }

  await upsertJobs(connection.id, jobs);

  return NextResponse.json({ jobsFound: jobs.length });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const connection = await getOwnedConnection(userId, id);
  if (!connection) return NextResponse.json({ error: "Connection not found." }, { status: 404 });

  await prisma.connection.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
