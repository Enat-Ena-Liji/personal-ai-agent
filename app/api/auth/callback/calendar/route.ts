import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  process.env.GOOGLE_CALENDAR_REDIRECT_URI
);

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  
  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const calendarList = await calendar.calendarList.list();
    const primaryCalendar = calendarList.data.items?.find(c => c.primary);

    const convex = getConvexClient();
    await convex.mutation(api.platforms.connectPlatform, {
      platform: "calendar",
      accountId: primaryCalendar?.id || "primary",
      accountEmail: primaryCalendar?.id || "primary",
      accountName: primaryCalendar?.summary || "Google Calendar",
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
    });

    return NextResponse.redirect(new URL("/dashboard/calendar?connected=true", req.url));
  } catch (error) {
    console.error("Calendar OAuth error:", error);
    return NextResponse.redirect(new URL("/dashboard/calendar?error=true", req.url));
  }
}