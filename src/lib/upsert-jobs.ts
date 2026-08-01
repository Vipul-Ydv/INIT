import { prisma } from "@/lib/prisma";
import type { BoardJob } from "@/lib/ats/greenhouse";

export async function upsertJobs(connectionId: string, jobs: BoardJob[]) {
  for (const job of jobs) {
    await prisma.job.upsert({
      where: { connectionId_externalId: { connectionId, externalId: job.externalId } },
      create: {
        connectionId,
        externalId: job.externalId,
        title: job.title,
        location: job.location,
        applyUrl: job.applyUrl,
      },
      update: {
        title: job.title,
        location: job.location,
        applyUrl: job.applyUrl,
      },
    });
  }
}
