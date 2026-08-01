"use client";

import { useEffect, useState } from "react";

type Application = { id: string; status: "DRAFT" | "REVIEW" | "SUBMITTED" | "FAILED" };
type Job = {
  id: string;
  title: string;
  location: string | null;
  applyUrl: string;
  connection: { label: string | null; boardSlug: string; provider: string };
  applications: Application[];
};
type Profile = {
  fullName?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
  coverNote?: string | null;
  resumeFileName?: string | null;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [openJobId, setOpenJobId] = useState<string | null>(null);

  function load() {
    Promise.all([
      fetch("/api/jobs").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
    ]).then(([jobsData, profileData]) => {
      setJobs(jobsData.jobs ?? []);
      setProfile(profileData.profile ?? null);
      setLoading(false);
    });
  }

  useEffect(load, []);

  async function onReview(jobId: string) {
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    setOpenJobId(jobId);
    load();
  }

  async function onMarkApplied(applicationId: string) {
    await fetch(`/api/applications/${applicationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SUBMITTED" }),
    });
    load();
  }

  if (loading) return <p>Loading...</p>;

  const missingProfile = !profile?.fullName || !profile?.resumeFileName;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Roles pulled from your connected boards. Review prefilled details, then apply on the
          company&apos;s site and mark it as applied.
        </p>
      </div>

      {missingProfile && (
        <p className="rounded border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm">
          Add your name and resume on the Profile page to prefill applications.
        </p>
      )}

      {jobs.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          No jobs yet — connect a board first.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {jobs.map((job) => {
            const application = job.applications[0];
            const isOpen = openJobId === job.id;

            return (
              <li key={job.id} className="rounded border border-black/10 p-4 dark:border-white/20">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-black/60 dark:text-white/60">
                      {job.connection.label || job.connection.boardSlug}
                      {job.location ? ` · ${job.location}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm">
                    {application?.status === "SUBMITTED" ? (
                      <span className="text-green-600">Applied</span>
                    ) : (
                      <button onClick={() => onReview(job.id)} className="underline">
                        Review & apply
                      </button>
                    )}
                  </div>
                </div>

                {isOpen && application?.status !== "SUBMITTED" && (
                  <div className="mt-4 flex flex-col gap-3 border-t border-black/10 pt-4 text-sm dark:border-white/20">
                    <p className="font-medium">Prefilled from your profile</p>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                      <dt className="text-black/60 dark:text-white/60">Name</dt>
                      <dd>{profile?.fullName || "—"}</dd>
                      <dt className="text-black/60 dark:text-white/60">Phone</dt>
                      <dd>{profile?.phone || "—"}</dd>
                      <dt className="text-black/60 dark:text-white/60">Location</dt>
                      <dd>{profile?.location || "—"}</dd>
                      <dt className="text-black/60 dark:text-white/60">LinkedIn</dt>
                      <dd>{profile?.linkedin || "—"}</dd>
                      <dt className="text-black/60 dark:text-white/60">Resume</dt>
                      <dd>{profile?.resumeFileName || "—"}</dd>
                    </dl>
                    {profile?.coverNote && (
                      <div>
                        <p className="text-black/60 dark:text-white/60">Cover note</p>
                        <p className="whitespace-pre-wrap">{profile.coverNote}</p>
                      </div>
                    )}
                    <div className="flex gap-3 pt-2">
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-black px-3 py-1.5 text-white dark:bg-white dark:text-black"
                      >
                        Open application on {job.connection.provider === "GREENHOUSE" ? "Greenhouse" : "Lever"}
                      </a>
                      {application && (
                        <button
                          onClick={() => onMarkApplied(application.id)}
                          className="rounded border border-black/20 px-3 py-1.5 dark:border-white/30"
                        >
                          Mark as applied
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
