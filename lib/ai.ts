import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Model configuration
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

export interface AIBriefing {
  title: string;
  summary: string;
  details: string;
  items: Array<{
    platform: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    link?: string;
  }>;
}

export interface AIEmailDraft {
  subject: string;
  body: string;
  tone: "professional" | "friendly" | "formal";
}

export interface AISmartReply {
  replies: string[];
}

export class AIService {
  private static instance: AIService;
  private model = model;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Generate a daily briefing
   */
  async generateBriefing(
    emails: any[],
    messages: any[],
    events: any[] = []
  ): Promise<AIBriefing> {
    try {
      // Prepare context
      const emailSummary = emails.slice(0, 10).map(e => 
        `- From: ${e.from}, Subject: ${e.subject}, Snippet: ${e.snippet}`
      ).join("\n");

      const messageSummary = messages.slice(0, 10).map(m => 
        `- From: ${m.senderName}, Message: ${m.body.substring(0, 100)}`
      ).join("\n");

      const prompt = `
You are an AI personal assistant creating a daily briefing. Analyze the following data and create a comprehensive briefing:

EMAILS:
${emailSummary || "No emails"}

MESSAGES:
${messageSummary || "No messages"}

CALENDAR EVENTS:
${events.length > 0 ? events.map(e => `- ${e.title} at ${e.start}`).join("\n") : "No events"}

Please provide a briefing in the following JSON format:
{
  "title": "Brief title (max 60 chars)",
  "summary": "A 2-3 sentence executive summary",
  "details": "Detailed analysis with key insights",
  "items": [
    {
      "platform": "gmail/whatsapp/calendar",
      "title": "Item title",
      "description": "Item description",
      "priority": "high/medium/low"
    }
  ]
}

Focus on:
1. Important emails requiring action
2. Urgent messages
3. Upcoming events
4. Action items
5. Key insights from communications

Respond ONLY with valid JSON.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      try {
        const briefing = JSON.parse(text);
        return briefing;
      } catch (parseError) {
        console.error("Failed to parse AI response:", text);
        // Return a fallback briefing
        return this.getFallbackBriefing();
      }
    } catch (error) {
      console.error("Error generating briefing:", error);
      return this.getFallbackBriefing();
    }
  }

  /**
   * Draft an email reply
   */
  async draftEmailReply(
    originalEmail: string,
    tone: "professional" | "friendly" | "formal" = "professional",
    additionalContext?: string
  ): Promise<AIEmailDraft> {
    try {
      const prompt = `
You are an AI assistant drafting an email reply. Original email:

${originalEmail}

Context: ${additionalContext || "No additional context"}

Write a ${tone} reply that:
1. Acknowledges the original email
2. Addresses all key points
3. Is clear and concise
4. Has a proper email structure

Return the draft in this JSON format:
{
  "subject": "Re: [Original Subject]",
  "body": "Full email body with proper formatting",
  "tone": "${tone}"
}

Respond ONLY with valid JSON.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const draft = JSON.parse(text);
        return draft;
      } catch (parseError) {
        console.error("Failed to parse email draft:", text);
        return this.getFallbackEmailDraft(tone);
      }
    } catch (error) {
      console.error("Error drafting email:", error);
      return this.getFallbackEmailDraft(tone);
    }
  }

  /**
   * Generate smart replies for WhatsApp/chat
   */
  async generateSmartReplies(
    message: string,
    context: string = ""
  ): Promise<AISmartReply> {
    try {
      const prompt = `
You are an AI assistant generating smart replies. Original message:

${message}

Context: ${context || "No additional context"}

Generate 3-5 smart, contextual replies that:
1. Are concise (max 50 chars each)
2. Cover different tones (friendly, professional, helpful)
3. Are actionable and relevant

Return ONLY a JSON array of strings:
{
  "replies": ["Reply 1", "Reply 2", "Reply 3", ...]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const replies = JSON.parse(text);
        return replies;
      } catch (parseError) {
        console.error("Failed to parse smart replies:", text);
        return this.getFallbackSmartReplies();
      }
    } catch (error) {
      console.error("Error generating smart replies:", error);
      return this.getFallbackSmartReplies();
    }
  }

  /**
   * Summarize a conversation or email thread
   */
  async summarizeConversation(
    messages: string[],
    type: "email" | "chat" = "chat"
  ): Promise<string> {
    try {
      const prompt = `
Summarize the following ${type} conversation:

${messages.map((m, i) => `${i + 1}. ${m}`).join("\n")}

Provide a concise summary that captures:
1. Key topics discussed
2. Important decisions made
3. Action items
4. Any unresolved issues

Keep the summary under 150 words.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error summarizing conversation:", error);
      return "Unable to summarize at this time.";
    }
  }

  /**
   * Classify email priority
   */
  async classifyEmailPriority(
    subject: string,
    body: string
  ): Promise<"high" | "medium" | "low"> {
    try {
      const prompt = `
Classify the priority of this email:

Subject: ${subject}
Body: ${body.substring(0, 500)}

Respond with ONLY one word: "high", "medium", or "low".
Consider:
- High: Urgent, requires immediate action, from VIP, time-sensitive
- Medium: Important but not urgent, requires action today
- Low: Newsletter, general information, no action needed
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const priority = response.text().trim().toLowerCase();
      
      if (["high", "medium", "low"].includes(priority)) {
        return priority as "high" | "medium" | "low";
      }
      return "medium";
    } catch (error) {
      console.error("Error classifying email:", error);
      return "medium";
    }
  }

  /**
   * Extract action items from communication
   */
  async extractActionItems(
    content: string,
    type: "email" | "message" = "email"
  ): Promise<Array<{ task: string; deadline?: string; importance: string }>> {
    try {
      const prompt = `
Extract action items from this ${type}:

${content}

Return as JSON array:
[
  {
    "task": "Action description",
    "deadline": "Optional deadline",
    "importance": "high/medium/low"
  }
]

Only include clear action items, not general information.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse action items:", text);
        return [];
      }
    } catch (error) {
      console.error("Error extracting action items:", error);
      return [];
    }
  }

  // Fallback methods
  private getFallbackBriefing(): AIBriefing {
    return {
      title: "Daily Briefing",
      summary: "No new important items to review.",
      details: "Check your emails and messages for any updates.",
      items: [
        {
          platform: "system",
          title: "Welcome to AI Agent",
          description: "Connect your platforms to get started.",
          priority: "medium",
        },
      ],
    };
  }

  private getFallbackEmailDraft(tone: "professional" | "friendly" | "formal"): AIEmailDraft {
    return {
      subject: "Re: Your Message",
      body: "Thank you for your message. I will review it and get back to you soon.",
      tone,
    };
  }

  private getFallbackSmartReplies(): AISmartReply {
    return {
      replies: ["OK, thanks!", "I'll look into it.", "Let me get back to you."],
    };
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();