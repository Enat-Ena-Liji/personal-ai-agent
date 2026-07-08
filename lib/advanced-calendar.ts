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

export interface SuggestedTime {
  start: Date;
  end: Date;
  score: number;
  reason: string;
}

export interface MeetingAgenda {
  title: string;
  objectives: string[];
  topics: Array<{ topic: string; duration: number; presenter?: string }>;
  preparation: string[];
  questions: string[];
  materials: string[];
}

export interface FollowUpEmail {
  to: string[];
  subject: string;
  body: string;
  actionItems: Array<{ task: string; assignee: string; deadline: string }>;
}

export interface CalendarAnalytics {
  totalMeetings: number;
  averageDuration: number;
  meetingTypes: Record<string, number>;
  peakHours: number[];
  productivityScore: number;
  recommendations: string[];
  trends: {
    weekly: number;
    monthly: number;
    quarterly: number;
  };
}

export class AdvancedCalendarService {
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

  // 1. AUTO-SCHEDULING - Find optimal meeting times
  async findOptimalTimes(
    participants: string[],
    durationMinutes: number = 60,
    dateRange: { start: Date; end: Date },
    preferences?: { preferredDays?: number[]; preferredHours?: [number, number] }
  ): Promise<SuggestedTime[]> {
    const events = await this.getEvents(dateRange.start, dateRange.end);
    
    // Generate time slots (15-minute increments)
    const slots: SuggestedTime[] = [];
    let current = new Date(dateRange.start);
    
    // Adjust to nearest 15 minutes
    current.setMinutes(Math.ceil(current.getMinutes() / 15) * 15, 0, 0);
    
    while (current < dateRange.end) {
      const slotEnd = new Date(current);
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);
      
      // Check if time slot is free for all participants
      const isFree = await this.isSlotFree(events, current, slotEnd);
      
      if (isFree) {
        const score = await this.calculateScore(current, preferences);
        slots.push({
          start: new Date(current),
          end: slotEnd,
          score,
          reason: this.getScoreReason(score),
        });
      }
      
      current.setMinutes(current.getMinutes() + 15);
    }

    // Sort by score (highest first) and return top 5
    return slots.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  // 2. MEETING PREP - Generate agendas
  async generateAgenda(
    meetingTitle: string,
    participants: string[],
    context: string,
    durationMinutes: number = 60
  ): Promise<MeetingAgenda> {
    const prompt = `
      You are an AI meeting assistant. Generate a comprehensive meeting agenda.
      
      MEETING DETAILS:
      Title: ${meetingTitle}
      Participants: ${participants.join(', ')}
      Context: ${context}
      Duration: ${durationMinutes} minutes
      
      Return a JSON response with:
      {
        "title": "Meeting title",
        "objectives": ["objective 1", "objective 2", "objective 3"],
        "topics": [
          { "topic": "topic 1", "duration": 10, "presenter": "name" },
          { "topic": "topic 2", "duration": 15, "presenter": "name" }
        ],
        "preparation": ["prep item 1", "prep item 2"],
        "questions": ["question 1", "question 2"],
        "materials": ["material 1", "material 2"]
      }
      
      Ensure total duration matches the meeting length.
    `;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch (error) {
      console.error("Failed to generate agenda:", error);
      return this.getFallbackAgenda(meetingTitle, participants);
    }
  }

  // 3. FOLLOW-UP AUTOMATION - Generate follow-up emails
  async generateFollowUp(
    meetingTitle: string,
    meetingNotes: string,
    participants: string[],
    actionItems: Array<{ task: string; assignee: string }>
  ): Promise<FollowUpEmail> {
    const prompt = `
      You are an AI assistant drafting follow-up emails after meetings.
      
      MEETING: ${meetingTitle}
      
      NOTES:
      ${meetingNotes}
      
      ACTION ITEMS:
      ${actionItems.map(item => `- ${item.task} (${item.assignee})`).join('\n')}
      
      PARTICIPANTS: ${participants.join(', ')}
      
      Create a professional follow-up email. Return JSON:
      {
        "to": ["email1", "email2"],
        "subject": "Follow-up: ${meetingTitle}",
        "body": "Full email body with meeting summary and action items",
        "actionItems": [
          { "task": "task description", "assignee": "person", "deadline": "Deadline: date" }
        ]
      }
    `;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch (error) {
      console.error("Failed to generate follow-up:", error);
      return {
        to: participants,
        subject: `Follow-up: ${meetingTitle}`,
        body: `Thank you for attending ${meetingTitle}. Please review the action items below.\n\n${actionItems.map(item => `- ${item.task} (${item.assignee})`).join('\n')}`,
        actionItems: actionItems.map(item => ({ ...item, deadline: 'EOW' })),
      };
    }
  }

  // 4. CALENDAR ANALYTICS - Track patterns
  async getAnalytics(days: number = 30): Promise<CalendarAnalytics> {
    const now = new Date();
    const past = new Date();
    past.setDate(past.getDate() - days);
    
    const events = await this.getEvents(past, now);
    const meetings = events.filter(e => e.title && !e.title.includes('Block'));

    // Calculate metrics
    const totalMeetings = meetings.length;
    const totalDuration = meetings.reduce((sum, e) => 
      sum + (e.end.getTime() - e.start.getTime()) / (1000 * 60), 0
    );
    const averageDuration = totalMeetings > 0 ? totalDuration / totalMeetings : 0;

    // Meeting types
    const meetingTypes: Record<string, number> = {};
    meetings.forEach(e => {
      const type = this.classifyMeeting(e.title);
      meetingTypes[type] = (meetingTypes[type] || 0) + 1;
    });

    // Peak hours
    const peakHours = Array(24).fill(0);
    meetings.forEach(e => {
      const hour = e.start.getHours();
      peakHours[hour] = (peakHours[hour] || 0) + 1;
    });

    // Productivity score (based on meeting distribution and efficiency)
    const productivityScore = this.calculateProductivityScore(meetings, averageDuration);

    // Recommendations
    const recommendations = this.generateRecommendations(meetings, averageDuration);

    // Trends
    const trends = {
      weekly: totalMeetings / (days / 7),
      monthly: totalMeetings,
      quarterly: totalMeetings * 3,
    };

    return {
      totalMeetings,
      averageDuration: Math.round(averageDuration),
      meetingTypes,
      peakHours: peakHours.map((count, hour) => ({ hour, count })),
      productivityScore,
      recommendations,
      trends,
    };
  }

  // Helper methods
  private async getEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    const auth = this.oauth2Client;
    const calendar = google.calendar({ version: "v3", auth });

    try {
      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      return (response.data.items || []).map(this.formatEvent);
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
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
    };
  }

  private async isSlotFree(events: CalendarEvent[], start: Date, end: Date): Promise<boolean> {
    return !events.some(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return start < eventEnd && end > eventStart;
    });
  }

  private async calculateScore(slot: Date, preferences?: any): Promise<number> {
    let score = 50; // Base score
    
    // Prefer morning hours (9 AM - 12 PM)
    const hour = slot.getHours();
    if (hour >= 9 && hour <= 12) score += 20;
    else if (hour >= 14 && hour <= 16) score += 10;
    else score -= 10;

    // Prefer Tuesday, Wednesday, Thursday
    const day = slot.getDay();
    if (day >= 2 && day <= 4) score += 15;
    else if (day === 1 || day === 5) score += 5;
    else score -= 20;

    // Avoid starting on the hour (1:00, 2:00) - prefer quarter past
    const minutes = slot.getMinutes();
    if (minutes === 15 || minutes === 30) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private getScoreReason(score: number): string {
    if (score >= 80) return "Optimal time - high availability";
    if (score >= 60) return "Good time - most participants available";
    if (score >= 40) return "Decent time - some participants may be busy";
    return "Suboptimal - consider other times";
  }

  private classifyMeeting(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('sync') || lower.includes('standup')) return 'Sync';
    if (lower.includes('review') || lower.includes('check')) return 'Review';
    if (lower.includes('client') || lower.includes('customer')) return 'Client';
    if (lower.includes('brainstorm') || lower.includes('ideation')) return 'Creative';
    if (lower.includes('planning') || lower.includes('strategy')) return 'Planning';
    return 'General';
  }

  private calculateProductivityScore(meetings: CalendarEvent[], avgDuration: number): number {
    // Higher score = more productive
    let score = 70; // Base score
    
    // Penalize too many meetings
    if (meetings.length > 20) score -= 20;
    if (meetings.length > 15) score -= 10;
    
    // Penalize long meetings
    if (avgDuration > 90) score -= 15;
    if (avgDuration > 60) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(meetings: CalendarEvent[], avgDuration: number): string[] {
    const recommendations: string[] = [];
    
    if (meetings.length > 15) {
      recommendations.push("Consider consolidating meetings to reduce context switching");
    }
    
    if (avgDuration > 60) {
      recommendations.push("Try to keep meetings under 1 hour for better productivity");
    }
    
    const morningCount = meetings.filter(e => e.start.getHours() < 12).length;
    const eveningCount = meetings.filter(e => e.start.getHours() > 16).length;
    
    if (morningCount < meetings.length * 0.3) {
      recommendations.push("Schedule more meetings in the morning when energy is highest");
    }
    
    if (eveningCount > meetings.length * 0.2) {
      recommendations.push("Reduce late afternoon meetings to maintain work-life balance");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Your meeting schedule looks well-balanced!");
    }
    
    return recommendations;
  }

  private getFallbackAgenda(title: string, participants: string[]): MeetingAgenda {
    return {
      title: title || "Meeting Agenda",
      objectives: ["Review current status", "Discuss next steps", "Assign action items"],
      topics: [
        { topic: "Opening & Context", duration: 5, presenter: participants[0] || "Organizer" },
        { topic: "Main Discussion", duration: 30, presenter: "All" },
        { topic: "Action Items & Next Steps", duration: 10, presenter: "All" },
        { topic: "Q&A & Closing", duration: 5, presenter: "All" },
      ],
      preparation: ["Review previous meeting notes", "Bring relevant documents"],
      questions: ["What are the key challenges?", "What support is needed?"],
      materials: ["Agenda (this document)", "Previous meeting notes"],
    };
  }
}

export const advancedCalendarService = AdvancedCalendarService;