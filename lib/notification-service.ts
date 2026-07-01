import { aiService } from "./ai-service";

export interface Notification {
  id: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  type: 'email' | 'whatsapp' | 'system';
  read: boolean;
  data?: any;
  createdAt: number;
}

export class NotificationService {
  private static instance: NotificationService;
  
  static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async processNewEmail(email: any) {
    // Classify priority using AI
    const priority = await aiService.classifyPriority(email.subject, email.body);
    
    // Create notification
    const notification: Notification = {
      id: crypto.randomUUID(),
      title: `📧 New Email: ${email.subject}`,
      message: `From: ${email.from}\n${email.snippet}`,
      priority,
      type: 'email',
      read: false,
      data: email,
      createdAt: Date.now()
    };

    return notification;
  }

  async processNewMessage(message: any) {
    // Quick priority check (AI for messages too)
    const priority = message.body.toLowerCase().includes('urgent') || 
                    message.body.toLowerCase().includes('important') 
                    ? 'high' : 'medium';

    const notification: Notification = {
      id: crypto.randomUUID(),
      title: `💬 New WhatsApp: ${message.senderName}`,
      message: message.body,
      priority,
      type: 'whatsapp',
      read: false,
      data: message,
      createdAt: Date.now()
    };

    return notification;
  }

  async sendBrowserNotification(notification: Notification) {
    // Check if browser supports notifications
    if (!('Notification' in window)) return;

    // Request permission if needed
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.priority === 'high' ? '🔴' : '🔵',
        tag: notification.id,
        requireInteraction: notification.priority === 'high',
      });
    }
  }
}

export const notificationService = NotificationService.getInstance();