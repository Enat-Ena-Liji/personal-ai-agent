import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const convex = getConvexClient();
    const platforms = await convex.query(api.platforms.getPlatforms);
    const calendarPlatform = platforms.find(p => p.platform === "calendar" && p.isConnected);

    if (!calendarPlatform) {
      // Return mock events if not connected
      return NextResponse.json({
        success: true,
        events: getMockEvents(),
      });
    }

    // In production, fetch real calendar events here
    // For now, return mock events
    return NextResponse.json({
      success: true,
      events: getMockEvents(),
    });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}

function getMockEvents() {
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  return [
    {
      id: "1",
      title: "Team Sync",
      start: new Date(year, month, 15, 10, 0).toISOString(),
      end: new Date(year, month, 15, 11, 0).toISOString(),
      attendees: ["john@example.com", "sarah@example.com"],
      description: "Weekly team sync meeting",
    },
    {
      id: "2",
      title: "Project Review",
      start: new Date(year, month, 18, 14, 0).toISOString(),
      end: new Date(year, month, 18, 15, 30).toISOString(),
      attendees: ["mike@example.com", "lisa@example.com"],
      description: "Review project progress",
    },
    {
      id: "3",
      title: "Client Call",
      start: new Date(year, month, 22, 11, 0).toISOString(),
      end: new Date(year, month, 22, 12, 0).toISOString(),
      attendees: ["client@example.com"],
      description: "Discuss project requirements",
    },
  ];
}