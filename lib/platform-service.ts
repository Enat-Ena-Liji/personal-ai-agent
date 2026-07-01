import { WebClient } from '@slack/web-api';
import { Client } from '@microsoft/microsoft-graph-client';
import axios from 'axios';

export interface PlatformMessage {
  id: string;
  platform: 'slack' | 'teams' | 'discord' | 'telegram';
  channel: string;
  sender: string;
  content: string;
  timestamp: Date;
  attachments?: any[];
  metadata?: Record<string, any>;
}

export interface PlatformConnection {
  platform: string;
  token: string;
  userId: string;
  teamId?: string;
  channelId?: string;
}

export class MultiPlatformService {
  private connections: Map<string, PlatformConnection> = new Map();

  // 1. SLACK INTEGRATION
  async connectSlack(token: string, userId: string): Promise<boolean> {
    try {
      const client = new WebClient(token);
      const auth = await client.auth.test();
      
      this.connections.set(userId, {
        platform: 'slack',
        token,
        userId,
        teamId: auth.team_id,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to connect Slack:', error);
      return false;
    }
  }

  async sendSlackMessage(
    userId: string,
    channel: string,
    text: string,
    blocks?: any[]
  ): Promise<boolean> {
    const connection = this.connections.get(userId);
    if (!connection || connection.platform !== 'slack') return false;

    try {
      const client = new WebClient(connection.token);
      await client.chat.postMessage({
        channel,
        text,
        blocks,
      });
      return true;
    } catch (error) {
      console.error('Failed to send Slack message:', error);
      return false;
    }
  }

  async getSlackChannels(userId: string): Promise<any[]> {
    const connection = this.connections.get(userId);
    if (!connection || connection.platform !== 'slack') return [];

    try {
      const client = new WebClient(connection.token);
      const result = await client.conversations.list({
        types: 'public_channel,private_channel',
        limit: 50,
      });
      return result.channels || [];
    } catch (error) {
      console.error('Failed to get Slack channels:', error);
      return [];
    }
  }

  // 2. MICROSOFT TEAMS INTEGRATION
  async connectTeams(accessToken: string, userId: string): Promise<boolean> {
    try {
      const client = Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        },
      });
      
      const user = await client.api('/me').get();
      
      this.connections.set(userId, {
        platform: 'teams',
        token: accessToken,
        userId: user.id,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to connect Teams:', error);
      return false;
    }
  }

  async sendTeamsMessage(
    userId: string,
    chatId: string,
    message: string
  ): Promise<boolean> {
    const connection = this.connections.get(userId);
    if (!connection || connection.platform !== 'teams') return false;

    try {
      const client = Client.init({
        authProvider: (done) => {
          done(null, connection.token);
        },
      });
      
      await client.api(`/chats/${chatId}/messages`).post({
        body: {
          content: message,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to send Teams message:', error);
      return false;
    }
  }

  // 3. DISCORD INTEGRATION (via webhook)
  async sendDiscordWebhook(webhookUrl: string, message: string): Promise<boolean> {
    try {
      await axios.post(webhookUrl, {
        content: message,
        username: 'AI Agent',
        avatar_url: 'https://ai-agent.com/avatar.png',
      });
      return true;
    } catch (error) {
      console.error('Failed to send Discord webhook:', error);
      return false;
    }
  }

  // 4. TELEGRAM INTEGRATION
  async sendTelegramMessage(botToken: string, chatId: string, message: string): Promise<boolean> {
    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      });
      return true;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  }

  // 5. BROADCAST TO ALL PLATFORMS
  async broadcastMessage(
    userId: string,
    message: string,
    platforms: string[] = ['slack', 'teams', 'discord', 'telegram']
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const platform of platforms) {
      results[platform] = await this.sendToPlatform(userId, platform, message);
    }
    
    return results;
  }

  async sendToPlatform(userId: string, platform: string, message: string): Promise<boolean> {
    const connection = this.connections.get(userId);
    if (!connection) return false;

    switch (platform) {
      case 'slack':
        return this.sendSlackMessage(userId, '#general', message);
      case 'teams':
        return this.sendTeamsMessage(userId, 'general', message);
      case 'discord':
        return this.sendDiscordWebhook(connection.token, message);
      case 'telegram':
        return this.sendTelegramMessage(connection.token, connection.userId, message);
      default:
        return false;
    }
  }

  // 6. SYNC MESSAGES FROM PLATFORMS
  async syncPlatformMessages(userId: string, platform: string): Promise<PlatformMessage[]> {
    const connection = this.connections.get(userId);
    if (!connection) return [];

    switch (platform) {
      case 'slack':
        return this.syncSlackMessages(connection);
      case 'teams':
        return this.syncTeamsMessages(connection);
      default:
        return [];
    }
  }

  private async syncSlackMessages(connection: PlatformConnection): Promise<PlatformMessage[]> {
    try {
      const client = new WebClient(connection.token);
      const result = await client.conversations.history({
        channel: '#general',
        limit: 10,
      });
      
      return (result.messages || []).map((msg: any) => ({
        id: msg.ts,
        platform: 'slack',
        channel: '#general',
        sender: msg.user || 'unknown',
        content: msg.text || '',
        timestamp: new Date(Number(msg.ts) * 1000),
        metadata: msg,
      }));
    } catch (error) {
      console.error('Failed to sync Slack messages:', error);
      return [];
    }
  }

  private async syncTeamsMessages(connection: PlatformConnection): Promise<PlatformMessage[]> {
    try {
      const client = Client.init({
        authProvider: (done) => {
          done(null, connection.token);
        },
      });
      
      const messages = await client.api('/chats/general/messages').get();
      
      return (messages.value || []).map((msg: any) => ({
        id: msg.id,
        platform: 'teams',
        channel: 'general',
        sender: msg.from?.user?.displayName || 'unknown',
        content: msg.body?.content || '',
        timestamp: new Date(msg.createdDateTime),
        metadata: msg,
      }));
    } catch (error) {
      console.error('Failed to sync Teams messages:', error);
      return [];
    }
  }

  // 7. AI-PROCESS PLATFORM MESSAGES
  async processPlatformMessages(
    messages: PlatformMessage[],
    userId: string
  ): Promise<any> {
    // Group messages by platform
    const grouped = messages.reduce((acc, msg) => {
      if (!acc[msg.platform]) acc[msg.platform] = [];
      acc[msg.platform].push(msg);
      return acc;
    }, {} as Record<string, PlatformMessage[]>);

    // Generate insights using AI
    const insights: Record<string, any> = {};
    
    for (const [platform, msgs] of Object.entries(grouped)) {
      if (msgs.length === 0) continue;
      
      // Create a summary for each platform
      insights[platform] = {
        count: msgs.length,
        latest: msgs[0]?.content || '',
        channels: [...new Set(msgs.map(m => m.channel))],
        senders: [...new Set(msgs.map(m => m.sender))],
        sentiment: await this.analyzeSentiment(msgs.map(m => m.content)),
      };
    }
    
    return insights;
  }

  private async analyzeSentiment(messages: string[]): Promise<string> {
    // Simple keyword-based sentiment analysis
    const positive = ['great', 'good', 'awesome', 'happy', 'excellent'];
    const negative = ['bad', 'terrible', 'awful', 'sad', 'frustrated'];
    
    let score = 0;
    for (const msg of messages) {
      const lower = msg.toLowerCase();
      for (const word of positive) {
        if (lower.includes(word)) score += 1;
      }
      for (const word of negative) {
        if (lower.includes(word)) score -= 1;
      }
    }
    
    if (score > 2) return 'positive';
    if (score < -2) return 'negative';
    return 'neutral';
  }
}

export const multiPlatformService = new MultiPlatformService();