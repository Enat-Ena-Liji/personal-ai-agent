// lib/priority-service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface EmailClassification {
  priority: 'high' | 'medium' | 'low';
  category: 'work' | 'personal' | 'social' | 'promotional' | 'spam';
  urgency: number; // 0-100
  importance: number; // 0-100
  reason: string;
  suggestedAction: 'reply' | 'read' | 'archive' | 'delete' | 'follow-up';
}

export class PriorityService {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  async classifyEmail(
    subject: string,
    body: string,
    from: string,
    to: string[],
    previousConversations?: string[]
  ): Promise<EmailClassification> {
    const prompt = `
      You are an AI email assistant. Analyze this email and provide a classification.
      
      EMAIL DETAILS:
      From: ${from}
      To: ${to.join(', ')}
      Subject: ${subject}
      Body: ${body.substring(0, 1000)}
      ${previousConversations ? `Previous conversations: ${previousConversations.join('\n')}` : ''}
      
      Return a JSON response with:
      {
        "priority": "high/medium/low",
        "category": "work/personal/social/promotional/spam",
        "urgency": 0-100,
        "importance": 0-100,
        "reason": "Brief explanation of classification",
        "suggestedAction": "reply/read/archive/delete/follow-up"
      }
      
      Classification rules:
      - High priority: Urgent, time-sensitive, from VIP contacts, requires immediate action
      - Medium priority: Important but not urgent, requires attention today
      - Low priority: Newsletters, general updates, no action needed
      - Work: Professional communications, projects, tasks
      - Personal: Family, friends, personal matters
      - Social: Events, groups, communities
      - Promotional: Marketing, sales, offers
      - Spam: Unsolicited, suspicious, or irrelevant emails
      
      Return ONLY valid JSON.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to classify email:', error);
      return this.getFallbackClassification(subject, from);
    }
  }

  async getPriorityInbox(
    emails: any[],
    userPreferences?: { categories?: string[]; priorityThreshold?: number }
  ): Promise<any[]> {
    // Classify all emails
    const classifiedEmails = await Promise.all(
      emails.map(async (email) => {
        const classification = await this.classifyEmail(
          email.subject,
          email.body || email.snippet || '',
          email.from,
          email.to || [],
          []
        );
        return {
          ...email,
          ...classification,
          score: this.calculateScore(classification),
        };
      })
    );

    // Filter based on preferences
    const threshold = userPreferences?.priorityThreshold || 50;
    const categories = userPreferences?.categories || ['work', 'personal'];

    return classifiedEmails
      .filter(email => categories.includes(email.category))
      .filter(email => email.urgency > threshold || email.importance > threshold)
      .sort((a, b) => b.score - a.score);
  }

  private calculateScore(classification: EmailClassification): number {
    let score = 0;
    if (classification.priority === 'high') score += 40;
    else if (classification.priority === 'medium') score += 20;
    score += classification.urgency * 0.3;
    score += classification.importance * 0.3;
    return Math.min(100, score);
  }

  private getFallbackClassification(subject: string, from: string): EmailClassification {
    const isUrgent = ['urgent', 'asap', 'immediate', 'important'].some(word => 
      subject.toLowerCase().includes(word)
    );

    return {
      priority: isUrgent ? 'high' : 'medium',
      category: 'work',
      urgency: isUrgent ? 80 : 50,
      importance: 50,
      reason: 'Fallback classification',
      suggestedAction: isUrgent ? 'reply' : 'read',
    };
  }
}

export const priorityService = new PriorityService();