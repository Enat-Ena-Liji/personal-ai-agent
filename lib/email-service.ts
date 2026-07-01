import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type EmailTone = 'professional' | 'friendly' | 'formal' | 'casual' | 'persuasive';
export type EmailLength = 'short' | 'medium' | 'detailed';

export interface EmailDraft {
  subject: string;
  body: string;
  tone: EmailTone;
  length: EmailLength;
  keyPoints: string[];
  suggestedActions: string[];
}

export class EmailService {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  async generateDraft(
    originalEmail: string,
    tone: EmailTone = 'professional',
    length: EmailLength = 'medium',
    customInstructions?: string
  ): Promise<EmailDraft> {
    const prompt = `
      You are an expert email writer. Generate a ${tone} email reply.
      
      ORIGINAL EMAIL:
      ${originalEmail}
      
      INSTRUCTIONS:
      - Tone: ${tone}
      - Length: ${length} (short=2-3 sentences, medium=4-6 sentences, detailed=7-10 sentences)
      ${customInstructions ? `- Additional instructions: ${customInstructions}` : ''}
      
      Return a JSON response with:
      {
        "subject": "Clear and relevant subject line",
        "body": "Full email body with proper formatting and paragraphs",
        "tone": "${tone}",
        "length": "${length}",
        "keyPoints": ["key point 1", "key point 2", "key point 3"],
        "suggestedActions": ["action 1", "action 2"]
      }
      
      IMPORTANT: 
      - Be concise and clear
      - Match the tone perfectly
      - Address all points from the original email
      - Include a proper greeting and closing
      - Return ONLY valid JSON
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response (remove markdown code blocks if present)
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const draft = JSON.parse(cleanedText);
      
      return {
        ...draft,
        tone,
        length,
      };
    } catch (error) {
      console.error('Failed to generate email draft:', error);
      return this.getFallbackDraft(tone, length);
    }
  }

  async improveDraft(
    currentDraft: string,
    improvementType: 'make_shorter' | 'make_longer' | 'more_professional' | 'more_friendly' | 'add_urgency'
  ): Promise<string> {
    const prompt = `
      Improve this email draft:
      
      ${currentDraft}
      
      Improvement: ${improvementType}
      
      Return ONLY the improved email body text, nothing else.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Failed to improve draft:', error);
      return currentDraft;
    }
  }

  async suggestAlternatives(
    originalEmail: string,
    currentDraft: string
  ): Promise<string[]> {
    const prompt = `
      Original email:
      ${originalEmail}
      
      Current draft:
      ${currentDraft}
      
      Suggest 3 alternative ways to start this email. 
      Return a JSON array of strings: ["option 1", "option 2", "option 3"]
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to suggest alternatives:', error);
      return [
        "Thank you for your email...",
        "I hope this email finds you well...",
        "Following up on your message..."
      ];
    }
  }

  private getFallbackDraft(tone: EmailTone, length: EmailLength): EmailDraft {
    const templates = {
      professional: {
        short: {
          subject: "Re: Your Inquiry",
          body: "Thank you for your message. I will review your request and get back to you shortly.",
        },
        medium: {
          subject: "Re: Your Inquiry",
          body: "Thank you for your message. I have received your request and will review it in detail. I will provide you with a comprehensive response within 24 hours.",
        },
        detailed: {
          subject: "Re: Your Inquiry",
          body: "Thank you for your message. I have received your request and will review it in detail. I will provide you with a comprehensive response within 24 hours. In the meantime, please let me know if you have any additional questions or need any clarification.",
        },
      },
      friendly: {
        short: {
          subject: "Re: Your Message",
          body: "Thanks for reaching out! I'll take a look and get back to you soon.",
        },
        medium: {
          subject: "Re: Your Message",
          body: "Thanks so much for reaching out! I've received your message and will review everything. I'll get back to you as soon as possible with some ideas.",
        },
        detailed: {
          subject: "Re: Your Message",
          body: "Thanks so much for reaching out! I've received your message and will review everything in detail. I'll get back to you as soon as possible with some ideas and suggestions. Looking forward to working together!",
        },
      },
    };

    const template = templates[tone] || templates.professional;
    const lengthChoice = template[length] || template.medium;

    return {
      subject: lengthChoice.subject,
      body: lengthChoice.body,
      tone,
      length,
      keyPoints: ["Acknowledged receipt", "Will review and respond"],
      suggestedActions: ["Review request", "Prepare response"],
    };
  }
}

export const emailService = new EmailService();