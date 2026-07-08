import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { calendarService } from "@/lib/calendar-service";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { meetingTitle, meetingDate, attendees, meetingNotes } = await req.json();

    if (!meetingNotes) {
      return NextResponse.json(
        { error: "Meeting notes are required" },
        { status: 400 }
      );
    }

    // Get user's calendar platform
    const convex = getConvexClient();
    const platforms = await convex.query(api.platforms.getPlatforms);
    const calendarPlatform = platforms.find(p => p.platform === "calendar" && p.isConnected);

    let summary;
    
    if (calendarPlatform) {
      // Use the real calendar service
      const service = new calendarService(
        calendarPlatform.accessToken!,
        calendarPlatform.refreshToken!
      );
      summary = await service.generateMeetingSummary(
        meetingTitle || "Meeting",
        meetingDate || new Date().toISOString(),
        attendees || "No attendees listed",
        meetingNotes
      );
    } else {
      // Use AI directly without calendar service
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      
      const prompt = `
        You are an AI assistant creating a professional meeting summary.
        
        MEETING DETAILS:
        Title: ${meetingTitle || "Meeting"}
        Date: ${meetingDate || new Date().toISOString()}
        Attendees: ${attendees || "No attendees listed"}
        
        MEETING NOTES:
        ${meetingNotes}
        
        Return a JSON response with:
        {
          "title": "Meeting title",
          "date": "Date in readable format",
          "duration": "Estimated duration from notes",
          "attendees": ["attendee 1", "attendee 2"],
          "keyPoints": ["key point 1", "key point 2", "key point 3"],
          "decisions": ["decision 1", "decision 2"],
          "actionItems": [
            { "task": "action task", "assignee": "person", "deadline": "date or null" }
          ],
          "nextSteps": ["next step 1", "next step 2"],
          "fullSummary": "A comprehensive summary of the meeting"
        }
      `;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      summary = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    }

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("Failed to generate meeting summary:", error);
    return NextResponse.json(
      { error: "Failed to generate meeting summary" },
      { status: 500 }
    );
  }
}