import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { advancedCalendarService } from "@/lib/advanced-calendar";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { meetingTitle, meetingNotes, participants, actionItems } = await req.json();

    if (!meetingTitle || !meetingNotes || !participants) {
      return NextResponse.json(
        { error: "Meeting title, notes, and participants are required" },
        { status: 400 }
      );
    }

    const convex = getConvexClient();
    const platforms = await convex.query(api.platforms.getPlatforms);
    const calendarPlatform = platforms.find(p => p.platform === "calendar" && p.isConnected);

    if (!calendarPlatform) {
      return NextResponse.json(
        { error: "Calendar not connected" },
        { status: 400 }
      );
    }

    const service = new advancedCalendarService(
      calendarPlatform.accessToken!,
      calendarPlatform.refreshToken!
    );

    const followUp = await service.generateFollowUp(
      meetingTitle,
      meetingNotes,
      participants,
      actionItems || []
    );

    return NextResponse.json({ success: true, followUp });
  } catch (error) {
    console.error("Failed to generate follow-up:", error);
    return NextResponse.json(
      { error: "Failed to generate follow-up" },
      { status: 500 }
    );
  }
}