import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // For now, return a mock briefing
    // We'll implement the actual AI logic later
    return NextResponse.json({
      success: true,
      briefing: {
        title: "Daily Briefing",
        summary: "No new important items to review.",
        details: "Check your emails and messages for any updates.",
        items: [
          {
            platform: "system",
            title: "Welcome to AI Agent",
            description: "Connect your platforms to get started.",
            priority: "medium",
          },
        ],
      },
      metadata: {
        emailsCount: 0,
        messagesCount: 0,
        platformsConnected: 0,
      },
    });
  } catch (error) {
    console.error("Failed to generate briefing:", error);
    return NextResponse.json(
      { error: "Failed to generate briefing" },
      { status: 500 }
    );
  }
}