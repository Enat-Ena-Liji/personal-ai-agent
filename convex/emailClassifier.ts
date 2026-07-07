import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple priority analysis without external API
function analyzePriority(subject: string, body: string, from: string): 'high' | 'medium' | 'low' {
  const combinedText = (subject + ' ' + body + ' ' + from).toLowerCase();
  
  // High priority keywords
  const highKeywords = ['urgent', 'asap', 'emergency', 'critical', 'important', 'deadline', 'time-sensitive'];
  // Low priority keywords
  const lowKeywords = ['newsletter', 'unsubscribe', 'promotion', 'sale', 'offer', 'discount'];
  
  if (highKeywords.some(kw => combinedText.includes(kw))) {
    return 'high';
  }
  if (lowKeywords.some(kw => combinedText.includes(kw))) {
    return 'low';
  }
  return 'medium';
}

// Simple category analysis without external API
function categorizeEmail(subject: string, body: string): 'work' | 'personal' | 'social' | 'promotional' | 'spam' {
  const combinedText = (subject + ' ' + body).toLowerCase();
  
  if (combinedText.includes('work') || combinedText.includes('meeting') || combinedText.includes('project')) {
    return 'work';
  }
  if (combinedText.includes('social') || combinedText.includes('linkedin') || combinedText.includes('twitter')) {
    return 'social';
  }
  if (combinedText.includes('promotion') || combinedText.includes('sale') || combinedText.includes('offer')) {
    return 'promotional';
  }
  if (combinedText.includes('spam') || combinedText.includes('unsubscribe')) {
    return 'spam';
  }
  return 'personal';
}

export const classifyEmail = mutation({
  args: {
    emailId: v.id("emailDrafts"),
    subject: v.string(),
    body: v.string(),
    from: v.string(),
  },
  handler: async (ctx, args) => {
    // AI-powered classification
    const priority = analyzePriority(args.subject, args.body, args.from);
    const category = categorizeEmail(args.subject, args.body);
    
    await ctx.db.patch(args.emailId, {
      priority,
      category,
      updatedAt: Date.now(),
    });
  },
});
