import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { emailService, EmailTone, EmailLength } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { originalEmail, tone, length, instructions } = await req.json();

    if (!originalEmail) {
      return NextResponse.json(
        { error: "Original email is required" },
        { status: 400 }
      );
    }

    const draft = await emailService.generateDraft(
      originalEmail,
      tone as EmailTone || 'professional',
      length as EmailLength || 'medium',
      instructions
    );

    return NextResponse.json({ success: true, draft });
  } catch (error) {
    console.error('Failed to generate draft:', error);
    return NextResponse.json(
      { error: 'Failed to generate email draft' },
      { status: 500 }
    );
  }
}