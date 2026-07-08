import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { aiService } from "@/lib/ai";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { originalEmail, tone, context } = await req.json();
    
    if (!originalEmail) {
      return NextResponse.json(
        { error: "Original email is required" },
        { status: 400 }
      );
    }

    const draft = await aiService.draftEmailReply(
      originalEmail,
      tone || "professional",
      context
    );

    // Store the draft in Convex
    const convex = getConvexClient();
    await convex.mutation(api.emailDrafts.create, {
      platform: "gmail",
      subject: draft.subject,
      body: draft.body,
      to: [], // Will be filled by user
      status: "draft",
    });

    return NextResponse.json({
      success: true,
      draft,
    });
  } catch (error) {
    console.error("Failed to draft email:", error);
    return NextResponse.json(
      { error: "Failed to draft email" },
      { status: 500 }
    );
  }
}