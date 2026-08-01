import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await prisma.job.findMany({
    where: { connection: { userId } },
    include: {
      connection: true,
      applications: { where: { userId } },
    },
    orderBy: { fetchedAt: "desc" },
  });

  return NextResponse.json({ jobs });
}
