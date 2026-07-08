import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { emailService } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { originalEmail, currentDraft } = await req.json();

    if (!originalEmail || !currentDraft) {
      return NextResponse.json(
        { error: "Original email and current draft are required" },
        { status: 400 }
      );
    }

    const alternatives = await emailService.suggestAlternatives(
      originalEmail,
      currentDraft
    );

    return NextResponse.json({ success: true, alternatives });
  } catch (error) {
    console.error('Failed to suggest alternatives:', error);
    return NextResponse.json(
      { error: 'Failed to suggest alternatives' },
      { status: 500 }
    );
  }
}