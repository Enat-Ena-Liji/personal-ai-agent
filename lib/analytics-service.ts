// lib/analytics-service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface AnalyticsData {
  metrics: {
    emailsReceived: number;
    emailsSent: number;
    emailsReplied: number;
    responseTime: number;
    whatsappMessages: number;
    meetingsAttended: number;
    tasksCompleted: number;
    priorityHigh: number;
    priorityMedium: number;
    priorityLow: number;
    categories: {
      work: number;
      personal: number;
      social: number;
      promotional: number;
    };
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
    productivityScore: number;
    focusTime: number;
    distractions: number;
  };
  weeklyProgress: { day: string; value: number }[];
  monthlyTrends: { week: string; emails: number; messages: number; meetings: number }[];
  recommendations: string[];
  streaks: {
    current: number;
    longest: number;
    lastActive: number;
  };
}

export class AnalyticsService {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  async generateInsights(
    emails: any[],
    messages: any[],
    meetings: any[]
  ): Promise<AnalyticsData> {
    // Calculate metrics
    const metrics = this.calculateMetrics(emails, messages, meetings);
    
    // Generate AI insights
    const recommendations = await this.generateRecommendations(
      emails,
      messages,
      meetings,
      metrics
    );

    // Calculate streaks
    const streaks = this.calculateStreaks(emails, messages);

    return {
      metrics,
      weeklyProgress: this.calculateWeeklyProgress(emails, messages),
      monthlyTrends: this.calculateMonthlyTrends(emails, messages, meetings),
      recommendations,
      streaks,
    };
  }

  private calculateMetrics(
    emails: any[],
    messages: any[],
    meetings: any[]
  ) {
    const totalEmails = emails.length;
    const readEmails = emails.filter(e => e.isRead).length;
    const repliedEmails = emails.filter(e => e.isReplied).length;
    
    // Calculate response time (average)
    let responseTime = 0;
    if (repliedEmails > 0) {
      const responseTimes = emails
        .filter(e => e.isReplied && e.repliedAt)
        .map(e => (e.repliedAt - e.createdAt) / (1000 * 60)); // minutes
      responseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    }

    // Priority distribution
    const highPriority = emails.filter(e => e.priority === 'high').length;
    const mediumPriority = emails.filter(e => e.priority === 'medium').length;
    const lowPriority = emails.filter(e => e.priority === 'low').length;

    // Category distribution
    const categories = {
      work: emails.filter(e => e.category === 'work').length,
      personal: emails.filter(e => e.category === 'personal').length,
      social: emails.filter(e => e.category === 'social').length,
      promotional: emails.filter(e => e.category === 'promotional').length,
    };

    // Sentiment analysis (simplified)
    const sentiment = {
      positive: emails.filter(e => e.sentiment === 'positive').length,
      neutral: emails.filter(e => e.sentiment === 'neutral').length,
      negative: emails.filter(e => e.sentiment === 'negative').length,
    };

    // Productivity score (0-100)
    const productivityScore = this.calculateProductivityScore(
      totalEmails,
      readEmails,
      repliedEmails,
      responseTime,
      messages.length,
      meetings.length
    );

    return {
      emailsReceived: totalEmails,
      emailsSent: emails.filter(e => e.sent).length,
      emailsReplied: repliedEmails,
      responseTime: Math.round(responseTime),
      whatsappMessages: messages.length,
      meetingsAttended: meetings.length,
      tasksCompleted: Math.floor(totalEmails * 0.3), // Placeholder
      priorityHigh: highPriority,
      priorityMedium: mediumPriority,
      priorityLow: lowPriority,
      categories,
      sentiment,
      productivityScore,
      focusTime: Math.floor(totalEmails * 5), // Placeholder
      distractions: Math.floor(totalEmails * 0.2), // Placeholder
    };
  }

  private calculateProductivityScore(
    totalEmails: number,
    readEmails: number,
    repliedEmails: number,
    responseTime: number,
    messages: number,
    meetings: number
  ): number {
    let score = 60; // Base score
    
    // Email efficiency
    if (readEmails > 0 && totalEmails > 0) {
      const readRate = readEmails / totalEmails;
      score += readRate * 10;
    }
    
    if (repliedEmails > 0 && totalEmails > 0) {
      const replyRate = repliedEmails / totalEmails;
      score += replyRate * 10;
    }
    
    // Response time
    if (responseTime < 60) score += 10;
    else if (responseTime < 120) score += 5;
    else if (responseTime > 240) score -= 5;
    
    // Communication volume
    if (messages > 10) score += 5;
    if (meetings > 2) score += 5;
    
    return Math.min(100, Math.max(0, score));
  }

  private async generateRecommendations(
    emails: any[],
    messages: any[],
    meetings: any[],
    metrics: any
  ): Promise<string[]> {
    const prompt = `
      Analyze this user's communication data and provide 5 actionable recommendations:
      
      EMAILS: ${emails.length} total (${metrics.emailsReplied} replied)
      WHATSAPP: ${messages.length} messages
      MEETINGS: ${meetings.length} meetings
      RESPONSE TIME: ${metrics.responseTime} minutes
      PRODUCTIVITY SCORE: ${metrics.productivityScore}
      
      Categories: ${JSON.stringify(metrics.categories)}
      Priority: High=${metrics.priorityHigh}, Medium=${metrics.priorityMedium}, Low=${metrics.priorityLow}
      
      Provide 5 specific, actionable recommendations to improve productivity and communication.
      Return as a JSON array of strings.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return this.getFallbackRecommendations(metrics);
    }
  }

  private getFallbackRecommendations(metrics: any): string[] {
    const recs = [];
    
    if (metrics.responseTime > 60) {
      recs.push("⏱️ Try to reduce email response time to under 1 hour");
    }
    
    if (metrics.priorityHigh > metrics.priorityMedium) {
      recs.push("🎯 Focus on clearing high-priority emails first");
    }
    
    if (metrics.categories.work < metrics.categories.personal) {
      recs.push("💼 Try to separate work and personal communications");
    }
    
    recs.push("📱 Set aside specific times for checking messages");
    recs.push("🤖 Use AI-powered templates to speed up responses");
    
    return recs;
  }

  private calculateStreaks(emails: any[], messages: any[]): {
    current: number;
    longest: number;
    lastActive: number;
  } {
    // Get all activity dates
    const emailDates = emails.map(e => new Date(e.createdAt).toDateString());
    const messageDates = messages.map(m => new Date(m.timestamp * 1000).toDateString());
    const allDates = [...emailDates, ...messageDates];
    
    if (allDates.length === 0) {
      return { current: 0, longest: 0, lastActive: 0 };
    }

    // Get unique dates
    const uniqueDates = [...new Set(allDates)];
    const sortedDates = uniqueDates.sort();

    // Calculate longest streak
    let currentStreak = 1;
    let longestStreak = 1;
    let lastActive = new Date(sortedDates[sortedDates.length - 1]).getTime();

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    // Check if current streak is still active (today)
    const today = new Date().toDateString();
    if (sortedDates[sortedDates.length - 1] !== today) {
      currentStreak = 0;
    } else {
      // Count from the end
      currentStreak = 1;
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const prevDate = new Date(sortedDates[i]);
        const currDate = new Date(sortedDates[i + 1]);
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      current: currentStreak,
      longest: longestStreak,
      lastActive: lastActive,
    };
  }

  private calculateWeeklyProgress(emails: any[], messages: any[]): { day: string; value: number }[] {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayMap: Record<string, number> = {};
    
    // Initialize days
    days.forEach(day => dayMap[day] = 0);
    
    // Count activities per day
    [...emails, ...messages].forEach(item => {
      const date = new Date(item.createdAt || item.timestamp * 1000);
      const day = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
      dayMap[day] = (dayMap[day] || 0) + 1;
    });

    return days.map(day => ({
      day,
      value: dayMap[day] || 0,
    }));
  }

  private calculateMonthlyTrends(
    emails: any[],
    messages: any[],
    meetings: any[]
  ): { week: string; emails: number; messages: number; meetings: number }[] {
    const weeks = 4;
    const trends = [];
    
    for (let i = weeks - 1; i >= 0; i--) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i * 7 + 6));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      const weekLabel = `Week ${weeks - i}`;
      
      const weekEmails = emails.filter(e => {
        const date = new Date(e.createdAt);
        return date >= startDate && date <= endDate;
      });
      
      const weekMessages = messages.filter(m => {
        const date = new Date(m.timestamp * 1000);
        return date >= startDate && date <= endDate;
      });
      
      const weekMeetings = meetings.filter(m => {
        const date = new Date(m.createdAt);
        return date >= startDate && date <= endDate;
      });
      
      trends.push({
        week: weekLabel,
        emails: weekEmails.length,
        messages: weekMessages.length,
        meetings: weekMeetings.length,
      });
    }
    
    return trends;
  }
}

export const analyticsService = new AnalyticsService();