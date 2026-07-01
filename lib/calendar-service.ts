import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  attendees?: string[];
  location?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  hangoutLink?: string;
}

export interface MeetingSummary {
  title: string;
  date: string;
  duration: string;
  attendees: string[];
  keyPoints: string[];
  actionItems: Array<{ task: string; assignee: string; deadline?: string }>;
  decisions: string[];
  nextSteps: string[];
  fullSummary: string;
}

export class CalendarService {
  private oauth2Client: OAuth2Client;

  constructor(accessToken: string, refreshToken: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI
    );
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  async getEvents(
    timeMin: Date = new Date(),
    timeMax?: Date,
    maxResults: number = 50
  ): Promise<CalendarEvent[]> {
    const auth = await this.getAuth();
    const calendar = google.calendar({ version: "v3", auth });

    try {
      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: timeMin.toISOString(),
        timeMax: timeMax?.toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = response.data.items || [];
      return events.map(this.formatEvent);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      return [];
    }
  }

  async getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    return this.getEvents(now, future);
  }

  async getTodayEvents(): Promise<CalendarEvent[]> {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return this.getEvents(now, end);
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent | null> {
    const auth = await this.getAuth();
    const calendar = google.calendar({ version: "v3", auth });

    try {
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: event.title,
          description: event.description,
          start: { dateTime: event.start.toISOString() },
          end: { dateTime: event.end.toISOString() },
          location: event.location,
          attendees: event.attendees?.map(email => ({ email })),
        },
      });

      return this.formatEvent(response.data);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      return null;
    }
  }

  async findFreeSlots(
    durationMinutes: number = 60,
    dateRange: { start: Date; end: Date }
  ): Promise<Date[]> {
    const events = await this.getEvents(dateRange.start, dateRange.end);
    
    // Generate all 15-minute slots in the date range
    const slots: Date[] = [];
    let current = new Date(dateRange.start);
    
    while (current < dateRange.end) {
      const slotEnd = new Date(current);
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);
      
      // Check if slot overlaps with any event
      const isFree = !events.some(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return current < eventEnd && slotEnd > eventStart;
      });
      
      if (isFree) {
        slots.push(new Date(current));
      }
      
      current.setMinutes(current.getMinutes() + 15);
    }
    
    return slots;
  }

  async generateMeetingSummary(
    meetingTitle: string,
    meetingDate: string,
    attendees: string,
    meetingNotes: string
  ): Promise<MeetingSummary> {
    const prompt = `
      You are an AI assistant creating a professional meeting summary.
      
      MEETING DETAILS:
      Title: ${meetingTitle}
      Date: ${meetingDate}
      Attendees: ${attendees}
      
      MEETING NOTES:
      ${meetingNotes}
      
      Return a JSON response with:
      {
        "title": "Meeting title",
        "date": "Date in readable format",
        "duration": "Duration of meeting",
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

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch (error) {
      console.error("Failed to generate meeting summary:", error);
      return this.getFallbackSummary(meetingTitle);
    }
  }

  async analyzeMeetingSchedule(
    events: CalendarEvent[]
  ): Promise<{ insights: string; suggestions: string }> {
    const prompt = `
      Analyze these calendar events and provide insights:
      
      ${events.map(e => `- ${e.title} (${e.start.toLocaleTimeString()} - ${e.end.toLocaleTimeString()})`).join('\n')}
      
      Return JSON:
      {
        "insights": "Key insights about the schedule",
        "suggestions": "Suggestions for better time management"
      }
    `;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch (error) {
      return {
        insights: "Your schedule looks balanced. Consider blocking time for focused work.",
        suggestions: "Try to group similar meetings together to improve flow.",
      };
    }
  }

  private async getAuth(): Promise<OAuth2Client> {
    try {
      await this.oauth2Client.getAccessToken();
    } catch (error) {
      console.error("Failed to refresh calendar token:", error);
    }
    return this.oauth2Client;
  }

  private formatEvent(event: any): CalendarEvent {
    return {
      id: event.id,
      title: event.summary || "Untitled Event",
      description: event.description,
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
      attendees: event.attendees?.map((a: any) => a.email),
      location: event.location,
      status: event.status,
      hangoutLink: event.hangoutLink,
    };
  }

  private getFallbackSummary(title: string): MeetingSummary {
    return {
      title: title || "Meeting Summary",
      date: new Date().toLocaleDateString(),
      duration: "1 hour",
      attendees: ["Attendee list not available"],
      keyPoints: ["Meeting took place", "Topics were discussed"],
      decisions: ["Decisions were made"],
      actionItems: [],
      nextSteps: ["Follow up on action items"],
      fullSummary: "A meeting was held. Please refer to the meeting notes for details.",
    };
  }
}

export const calendarService = CalendarService;