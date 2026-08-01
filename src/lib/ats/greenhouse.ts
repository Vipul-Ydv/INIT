export type BoardJob = {
  externalId: string;
  title: string;
  location: string | null;
  applyUrl: string;
};

export async function fetchGreenhouseJobs(boardSlug: string): Promise<BoardJob[]> {
  const res = await fetch(
    `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardSlug)}/jobs`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Greenhouse board "${boardSlug}" not found or unavailable.`);
  }

  const data = await res.json();

  return (data.jobs ?? []).map((job: { id: number; title: string; location?: { name?: string }; absolute_url: string }) => ({
    externalId: String(job.id),
    title: job.title,
    location: job.location?.name ?? null,
    applyUrl: job.absolute_url,
  }));
}
