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
    const { participants, durationMinutes, dateRange, preferences } = await req.json();

    if (!participants || !dateRange) {
      return NextResponse.json(
        { error: "Participants and date range are required" },
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

    const suggestedTimes = await service.findOptimalTimes(
      participants,
      durationMinutes || 60,
      {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end),
      },
      preferences
    );

    return NextResponse.json({ success: true, suggestedTimes });
  } catch (error) {
    console.error("Failed to find optimal times:", error);
    return NextResponse.json(
      { error: "Failed to find optimal times" },
      { status: 500 }
    );
  }
}