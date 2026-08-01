import type { BoardJob } from "./greenhouse";

export async function fetchLeverJobs(boardSlug: string): Promise<BoardJob[]> {
  const res = await fetch(
    `https://api.lever.co/v0/postings/${encodeURIComponent(boardSlug)}?mode=json`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Lever board "${boardSlug}" not found or unavailable.`);
  }

  const data = await res.json();

  if (!Array.isArray(data)) {
    throw new Error(`Lever board "${boardSlug}" not found or unavailable.`);
  }

  return data.map((job: { id: string; text: string; categories?: { location?: string }; hostedUrl: string }) => ({
    externalId: job.id,
    title: job.text,
    location: job.categories?.location ?? null,
    applyUrl: job.hostedUrl,
  }));
}
