import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { emailService } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentDraft, improvementType } = await req.json();

    if (!currentDraft || !improvementType) {
      return NextResponse.json(
        { error: "Current draft and improvement type are required" },
        { status: 400 }
      );
    }

    const improved = await emailService.improveDraft(currentDraft, improvementType);

    return NextResponse.json({ success: true, improved });
  } catch (error) {
    console.error('Failed to improve draft:', error);
    return NextResponse.json(
      { error: 'Failed to improve draft' },
      { status: 500 }
    );
  }
}