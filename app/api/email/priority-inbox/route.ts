import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GmailService } from "@/lib/gmail-service";
import { priorityService } from "@/lib/priority-service";
import { getConvexServerClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const category = searchParams.get("category") || "all";

    const convex = getConvexServerClient();
    const platforms = await convex.query(api.platforms.getPlatforms);
    const gmailPlatform = platforms.find(
      (p: any) => p.platform === "gmail" && p.isConnected
    );

    if (!gmailPlatform) {
      return NextResponse.json(
        { error: "Gmail not connected" },
        { status: 400 }
      );
    }

    // Fetch emails from Gmail
    const gmailService = new GmailService(
      gmailPlatform.accessToken!,
      gmailPlatform.refreshToken!
    );

    const emails = await gmailService.getEmails(limit);

    // Classify and sort emails
    const classifiedEmails = await Promise.all(
      emails.map(async (email) => {
        const classification = await priorityService.classifyEmail(
          email.subject,
          email.body || email.snippet,
          email.from,
          email.to,
          []
        );
        
        // Store classification in Convex
        await convex.mutation(api.emailDrafts.updateDraft, {
          draftId: email.id,
          priority: classification.priority,
          category: classification.category,
        });

        return {
          ...email,
          ...classification,
          score: (classification.urgency + classification.importance) / 2,
        };
      })
    );

    // Filter by category if specified
    let filteredEmails = classifiedEmails;
    if (category !== "all") {
      filteredEmails = filteredEmails.filter(e => e.category === category);
    }

    // Sort by priority and score
    const sortedEmails = filteredEmails.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.score - a.score;
    });

    // Store priority inbox state
    await convex.mutation(api.priorityInbox.store, {
      userId,
      emails: sortedEmails.slice(0, 20),
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      emails: sortedEmails,
      total: sortedEmails.length,
      categories: {
        high: sortedEmails.filter(e => e.priority === 'high').length,
        medium: sortedEmails.filter(e => e.priority === 'medium').length,
        low: sortedEmails.filter(e => e.priority === 'low').length,
      },
    });
  } catch (error) {
    console.error("Failed to get priority inbox:", error);
    return NextResponse.json(
      { error: "Failed to get priority inbox" },
      { status: 500 }
    );
  }
}