import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("resume");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No resume file provided." }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF resumes are supported." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Resume must be under 5MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let text = "";
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    text = result.text;
  } catch {
    return NextResponse.json({ error: "Could not read this PDF. It may be corrupted or scanned as an image." }, { status: 422 });
  }

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, resumeFileName: file.name, resumeText: text },
    update: { resumeFileName: file.name, resumeText: text },
  });

  return NextResponse.json({ profile });
}
