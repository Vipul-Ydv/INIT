"use client";

import { useEffect, useState } from "react";

type Profile = {
  fullName?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
  coverNote?: string | null;
  resumeFileName?: string | null;
  resumeText?: string | null;
};

const emptyProfile: Profile = {
  fullName: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  website: "",
  coverNote: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
        setLoading(false);
      });
  }, []);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save profile.");
      return;
    }

    setMessage("Profile saved.");
  }

  async function onResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData();
    formData.append("resume", file);

    const res = await fetch("/api/profile/resume", { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not upload resume.");
      return;
    }

    const data = await res.json();
    setProfile((p) => ({ ...p, resumeFileName: data.profile.resumeFileName, resumeText: data.profile.resumeText }));
    setMessage("Resume uploaded and parsed.");
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Fill this in once — it&apos;s used to prefill job applications for your review.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Resume</h2>
        <input type="file" accept="application/pdf" onChange={onResumeChange} disabled={uploading} />
        {uploading && <p className="text-sm text-black/60 dark:text-white/60">Parsing resume...</p>}
        {profile.resumeFileName && (
          <p className="text-sm">
            Current: <span className="font-medium">{profile.resumeFileName}</span>
          </p>
        )}
      </section>

      <form onSubmit={onSave} className="flex flex-col gap-4">
        <Field label="Full name" value={profile.fullName} onChange={(v) => update("fullName", v)} />
        <Field label="Phone" value={profile.phone} onChange={(v) => update("phone", v)} />
        <Field label="Location" value={profile.location} onChange={(v) => update("location", v)} />
        <Field label="LinkedIn URL" value={profile.linkedin} onChange={(v) => update("linkedin", v)} />
        <Field label="GitHub URL" value={profile.github} onChange={(v) => update("github", v)} />
        <Field label="Website" value={profile.website} onChange={(v) => update("website", v)} />

        <label className="flex flex-col gap-1 text-sm">
          Default cover note
          <textarea
            value={profile.coverNote ?? ""}
            onChange={(e) => update("coverNote", e.target.value)}
            rows={5}
            className="rounded border border-black/10 px-3 py-2 dark:border-white/20"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-fit rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-black/10 px-3 py-2 dark:border-white/20"
      />
    </label>
  );
}
