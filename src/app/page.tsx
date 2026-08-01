import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Apply once, review everywhere</h1>
      <p className="max-w-lg text-lg text-black/60 dark:text-white/60">
        Upload your resume, connect the job boards you care about, and get every application
        prefilled and ready for you to review before you submit.
      </p>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="rounded bg-black px-5 py-2.5 text-white dark:bg-white dark:text-black"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded border border-black/20 px-5 py-2.5 dark:border-white/30"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
