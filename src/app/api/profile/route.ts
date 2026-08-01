import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  linkedin: z.string().max(300).optional(),
  github: z.string().max(300).optional(),
  website: z.string().max(300).optional(),
  coverNote: z.string().max(5000).optional(),
});

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId } });
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
  }

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({ profile });
}
