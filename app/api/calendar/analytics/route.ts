import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { advancedCalendarService } from "@/lib/advanced-calendar";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");

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

    const analytics = await service.getAnalytics(days);

    // Store analytics in Convex for history
    await convex.mutation(api.analytics.store, {
      userId,
      data: analytics,
      period: days,
      createdAt: Date.now(),
    });

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error("Failed to get analytics:", error);
    return NextResponse.json(
      { error: "Failed to get analytics" },
      { status: 500 }
    );
  }
}