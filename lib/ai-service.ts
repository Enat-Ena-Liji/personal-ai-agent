import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class AIService {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  async generateBriefing(emails: any[], messages: any[]) {
    const prompt = `
      You are an AI assistant creating a daily briefing. Analyze this data:
      
      EMAILS (${emails.length}):
      ${emails.slice(0, 10).map(e => `- ${e.subject} | From: ${e.from} | Snippet: ${e.snippet}`).join('\n')}
      
      MESSAGES (${messages.length}):
      ${messages.slice(0, 10).map(m => `- ${m.senderName}: ${m.body.substring(0, 100)}`).join('\n')}
      
      Return a JSON response with:
      {
        "summary": "2-3 sentence executive summary",
        "actionItems": [
          { "task": "description", "priority": "high/medium/low", "source": "email/whatsapp" }
        ],
        "insights": "Key patterns or important information"
      }
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  }

  async draftEmail(originalEmail: string, tone: 'professional' | 'friendly' = 'professional') {
    const prompt = `
      Draft a ${tone} reply to this email:
      ${originalEmail}
      
      Return JSON: { "subject": "...", "body": "..." }
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  }

  async classifyPriority(subject: string, body: string): Promise<'high' | 'medium' | 'low'> {
    const prompt = `
      Classify priority (high/medium/low) for:
      Subject: ${subject}
      Body: ${body.substring(0, 300)}
      
      Return only the word.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().toLowerCase() as 'high' | 'medium' | 'low';
  }
}

export const aiService = new AIService();