import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GmailService } from "@/lib/gmail-service";
import { getConvexServerClient } from "@/lib/convex-server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { threadId, originalEmail, replyBody } = await req.json();

    if (!threadId || !originalEmail || !replyBody) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const convex = getConvexServerClient();
    const platforms = await convex.query("platforms:getPlatforms");
    const gmailPlatform = platforms.find(
      (p: any) => p.platform === "gmail" && p.isConnected
    );

    if (!gmailPlatform) {
      return NextResponse.json(
        { error: "Gmail not connected" },
        { status: 400 }
      );
    }

    const gmailService = new GmailService(
      gmailPlatform.accessToken!,
      gmailPlatform.refreshToken!
    );

    const success = await gmailService.replyEmail(
      threadId,
      originalEmail,
      replyBody
    );

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to send reply" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Failed to reply to email:", error);
    return NextResponse.json(
      { error: "Failed to reply to email" },
      { status: 500 }
    );
  }
}