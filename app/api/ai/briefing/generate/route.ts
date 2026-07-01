import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { aiService } from "@/lib/ai-service";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const convex = getConvexClient();
    
    // Get user's connected platforms
    const platforms = await convex.query(api.platforms.getPlatforms);
    const gmailPlatform = platforms.find(p => p.platform === "gmail" && p.isConnected);
    const whatsappPlatform = platforms.find(p => p.platform === "whatsapp" && p.isConnected);

    // Fetch data from platforms (simplified - you'd implement actual fetching)
    const emails = gmailPlatform ? await fetchGmailEmails(gmailPlatform) : [];
    const messages = whatsappPlatform ? await fetchWhatsAppMessages(whatsappPlatform) : [];

    // Generate AI briefing
    const briefing = await aiService.generateBriefing(emails, messages);

    // Store in database
    const today = new Date().toISOString().split('T')[0];
    await convex.mutation(api.briefings.createBriefing, {
      date: today,
      title: `Daily Briefing - ${new Date().toLocaleDateString()}`,
      summary: briefing.summary,
      details: briefing.insights,
      type: "daily",
      items: briefing.actionItems.map((item: any) => ({
        platform: item.source === 'email' ? 'gmail' : 'whatsapp',
        title: item.task,
        description: item.task,
        priority: item.priority,
      })),
    });

    return NextResponse.json({ success: true, briefing });
  } catch (error) {
    console.error('Briefing generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 });
  }
}

// Helper functions (simplified - you'd implement actual fetching)
async function fetchGmailEmails(platform: any) {
  // Implement Gmail API fetch
  return [];
}

async function fetchWhatsAppMessages(platform: any) {
  // Implement WhatsApp fetch
  return [];
}