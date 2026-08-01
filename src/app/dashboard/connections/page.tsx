"use client";

import { useEffect, useState } from "react";

type Job = { id: string; title: string; location: string | null; applyUrl: string };
type Connection = {
  id: string;
  provider: "GREENHOUSE" | "LEVER";
  boardSlug: string;
  label: string | null;
  jobs: Job[];
};

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<"GREENHOUSE" | "LEVER">("GREENHOUSE");
  const [boardSlug, setBoardSlug] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    fetch("/api/connections")
      .then((res) => res.json())
      .then((data) => {
        setConnections(data.connections ?? []);
        setLoading(false);
      });
  }

  useEffect(load, []);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, boardSlug, label: label || undefined }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not add this board.");
      return;
    }

    setBoardSlug("");
    setLabel("");
    load();
  }

  async function onRefresh(id: string) {
    await fetch(`/api/connections/${id}`, { method: "POST" });
    load();
  }

  async function onRemove(id: string) {
    await fetch(`/api/connections/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Connections</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Connect a company&apos;s public job board (Greenhouse or Lever) to pull in open roles.
        </p>
      </div>

      <form onSubmit={onAdd} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Provider
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as "GREENHOUSE" | "LEVER")}
            className="rounded border border-black/10 px-3 py-2 dark:border-white/20"
          >
            <option value="GREENHOUSE">Greenhouse</option>
            <option value="LEVER">Lever</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Board slug (from the company&apos;s careers URL)
          <input
            value={boardSlug}
            onChange={(e) => setBoardSlug(e.target.value)}
            placeholder="e.g. airbnb"
            required
            className="rounded border border-black/10 px-3 py-2 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Label (optional)
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="rounded border border-black/10 px-3 py-2 dark:border-white/20"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {submitting ? "Adding..." : "Add board"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : connections.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">No boards connected yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {connections.map((c) => (
            <li key={c.id} className="rounded border border-black/10 p-4 dark:border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.label || c.boardSlug}</p>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    {c.provider} · {c.boardSlug} · {c.jobs.length} job(s)
                  </p>
                </div>
                <div className="flex gap-3 text-sm">
                  <button onClick={() => onRefresh(c.id)} className="underline">
                    Refresh
                  </button>
                  <button onClick={() => onRemove(c.id)} className="text-red-600 underline">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
