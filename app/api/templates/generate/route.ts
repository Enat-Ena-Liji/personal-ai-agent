import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { emailTemplatesService } from "@/lib/email-templates-service";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { purpose, tone, length } = await req.json();

    if (!purpose) {
      return NextResponse.json(
        { error: "Purpose is required" },
        { status: 400 }
      );
    }

    const template = await emailTemplatesService.generateTemplate(
      purpose,
      tone || 'professional',
      length || 'medium'
    );

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error("Failed to generate template:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}