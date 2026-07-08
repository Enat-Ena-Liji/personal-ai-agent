import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GmailService } from "@/lib/gmail-service";
import { getConvexServerClient } from "@/lib/convex-server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const maxResults = parseInt(searchParams.get("maxResults") || "20");
    const query = searchParams.get("query") || "in:inbox";

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

    const emails = await gmailService.getEmails(maxResults, query);

    return NextResponse.json({ success: true, emails });
  } catch (error) {
    console.error("Failed to fetch emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}