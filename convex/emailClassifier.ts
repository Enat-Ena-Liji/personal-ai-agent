import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const classifyEmail = mutation({
  args: {
    emailId: v.string(),
    subject: v.string(),
    body: v.string(),
    from: v.string(),
  },
  handler: async (ctx, args) => {
    // AI-powered classification
    const priority = await analyzePriority(args.subject, args.body, args.from);
    const category = await categorizeEmail(args.subject, args.body);
    
    await ctx.db.patch(args.emailId, {
      priority,
      category,
      classifiedAt: Date.now(),
    });
  },
});

async function analyzePriority(subject: string, body: string, from: string): Promise<'high' | 'medium' | 'low'> {
  // Use Gemini API for classification
  const prompt = `
    Classify this email priority (high/medium/low):
    Subject: ${subject}
    From: ${from}
    Body: ${body.substring(0, 500)}
    
    Consider:
    - High: urgent, action required, time-sensitive
    - Medium: important but not urgent
    - Low: newsletter, general information
    Return only the word.
  `;
  
  // Call Gemini API
  const response = await callGeminiAPI(prompt);
  return response.toLowerCase() as 'high' | 'medium' | 'low';
}

async function categorizeEmail(subject: string, body: string): Promise<string> {
  const prompt = `
    Categorize this email (work/personal/social/promotional/spam):
    Subject: ${subject}
    Body: ${body.substring(0, 300)}
    Return only the category.
  `;
  
  const response = await callGeminiAPI(prompt);
  return response.toLowerCase();
}