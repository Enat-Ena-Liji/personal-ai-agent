// lib/email-templates-service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string[];
  isFavorite: boolean;
  usageCount: number;
  lastUsed?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface TemplateVariable {
  name: string;
  description: string;
  defaultValue?: string;
}

export class EmailTemplatesService {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  async generateTemplate(
    purpose: string,
    tone: 'professional' | 'friendly' | 'formal' | 'casual' = 'professional',
    length: 'short' | 'medium' | 'detailed' = 'medium'
  ): Promise<{ name: string; subject: string; body: string; variables: string[] }> {
    const prompt = `
      Generate an email template for: ${purpose}
      Tone: ${tone}
      Length: ${length}
      
      Return a JSON response with:
      {
        "name": "Descriptive template name",
        "subject": "Email subject with {{variable}} placeholders",
        "body": "Email body with {{variable}} placeholders. Use {{name}}, {{company}}, {{position}}, {{date}}, {{meeting_time}}, {{link}}, etc.",
        "variables": ["name", "company", "position", "date", "meeting_time", "link"]
      }
      
      Use natural language and include placeholders for personalization.
      The body should have proper email structure with greeting, main content, and closing.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to generate template:', error);
      return this.getFallbackTemplate(purpose);
    }
  }

  async improveTemplate(
    currentBody: string,
    improvementType: 'shorter' | 'longer' | 'more_professional' | 'more_friendly' | 'add_variables' | 'better_structure'
  ): Promise<string> {
    const prompt = `
      Improve this email template:
      
      ${currentBody}
      
      Improvement: ${improvementType}
      
      Return ONLY the improved template body with variables preserved.
      Keep any {{variable}} placeholders.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Failed to improve template:', error);
      return currentBody;
    }
  }

  private getFallbackTemplate(purpose: string): { name: string; subject: string; body: string; variables: string[] } {
    return {
      name: `${purpose.charAt(0).toUpperCase() + purpose.slice(1)} Template`,
      subject: `{{subject}} - {{company}}`,
      body: `Hi {{name}},\n\nI hope this email finds you well.\n\n${purpose.charAt(0).toUpperCase() + purpose.slice(1)}\n\nBest regards,\n{{sender_name}}`,
      variables: ['name', 'company', 'sender_name'],
    };
  }
}

export const emailTemplatesService = new EmailTemplatesService();