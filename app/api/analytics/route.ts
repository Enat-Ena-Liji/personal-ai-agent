import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getConvexServerClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { analyticsService } from "@/lib/analytics-service";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");
    const refresh = searchParams.get("refresh") === "true";

    const convex = getConvexServerClient();
    
    // Get cached analytics if not refreshing
    if (!refresh) {
      const cached = await convex.query(api.analytics.getLatest, {});
      if (cached) {
        return NextResponse.json({ success: true, analytics: cached.data });
      }
    }

    // Fetch data from platforms
    const platforms = await convex.query(api.platforms.getPlatforms);
    
    let emails: any[] = [];
    let messages: any[] = [];
    let meetings: any[] = [];

    // Get Gmail emails
    const gmailPlatform = platforms.find((p: any) => p.platform === "gmail" && p.isConnected);
    if (gmailPlatform) {
      const { GmailService } = await import("@/lib/gmail-service");
      const gmailService = new GmailService(
        gmailPlatform.accessToken!,
        gmailPlatform.refreshToken!
      );
      emails = await gmailService.getEmails(100);
    }

    // Get WhatsApp messages
    const whatsappPlatform = platforms.find((p: any) => p.platform === "whatsapp" && p.isConnected);
    if (whatsappPlatform) {
      const alerts = await convex.query(api.alerts.getAlerts, { limit: 100 });
      messages = alerts.filter((a: any) => a.type === "whatsapp");
    }

    // Get Calendar events
    const calendarPlatform = platforms.find((p: any) => p.platform === "calendar" && p.isConnected);
    if (calendarPlatform) {
      // Simplified: use briefings as meeting data
      const briefings = await convex.query(api.briefings.getBriefings, { limit: 30 });
      meetings = briefings;
    }

    // Generate analytics
    const analytics = await analyticsService.generateInsights(emails, messages, meetings);

    // Store analytics in Convex
    await convex.mutation(api.analytics.store, {
      data: analytics,
      period: days,
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