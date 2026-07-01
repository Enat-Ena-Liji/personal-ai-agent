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
    const { meetingTitle, participants, context, durationMinutes } = await req.json();

    if (!meetingTitle || !participants) {
      return NextResponse.json(
        { error: "Meeting title and participants are required" },
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

    const agenda = await service.generateAgenda(
      meetingTitle,
      participants,
      context || "General meeting discussion",
      durationMinutes || 60
    );

    return NextResponse.json({ success: true, agenda });
  } catch (error) {
    console.error("Failed to generate agenda:", error);
    return NextResponse.json(
      { error: "Failed to generate agenda" },
      { status: 500 }
    );
  }
}