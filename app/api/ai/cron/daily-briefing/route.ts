import { NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function GET() {
  try {
    const convex = getConvexClient();
    
    // Get all users with platforms
    const users = await convex.query(api.users.getAllUsers);
    
    // Generate briefings for each user
    const results = await Promise.allSettled(
      users.map(async (user: any) => {
        const platforms = await convex.query(api.platforms.getPlatforms, { userId: user._id });
        // Generate briefing for this user
        // ... (similar to above)
      })
    );

    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      results 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}