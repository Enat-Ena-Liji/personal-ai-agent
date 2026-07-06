// lib/whatsapp-service.ts
import { 
  default as makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  WASocket,
  WAMessage,
  proto,
  makeInMemoryStore // Imported directly from the main package
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import * as path from "path";
import * as fs from "fs";

type MessageContext = {
  mentionedJid?: string[];
  quotedMessage?: any;
};

export interface WhatsAppMessage {
  id: string;
  from: string;
  body: string;
  timestamp: number;
  isGroup: boolean;
  sender: string;
  senderName?: string;
  isMedia: boolean;
  mediaType?: string;
  quotedMsg?: string;
  mentions?: string[];
}

export interface WhatsAppContact {
  id: string;
  name?: string;
  number: string;
  isGroup: boolean;
  groupName?: string;
  participants?: string[];
}

export class WhatsAppService {
  private socket: WASocket | null = null;
  private isConnected: boolean = false;
  private sessionDir: string;
  private store: any;
  private messageHandlers: ((msg: WhatsAppMessage) => void)[] = [];
  private connectionHandlers: ((status: 'connecting' | 'connected' | 'disconnected') => void)[] = [];

  constructor(userId: string) {
    this.sessionDir = path.join(process.cwd(), "sessions", userId);
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
    // Create store with proper options using the imported makeInMemoryStore
    this.store = makeInMemoryStore({
      logger: console,
    });
  }

  async connect(
    onQR: (qr: string) => void,
    onMessage?: (msg: WhatsAppMessage) => void,
    onConnection?: (status: 'connecting' | 'connected' | 'disconnected') => void
  ): Promise<boolean> {
    try {
      if (onMessage) {
        this.messageHandlers.push(onMessage);
      }
      if (onConnection) {
        this.connectionHandlers.push(onConnection);
      }

      const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);
      
      // Load store from file
      try {
        this.store.readFromFile(path.join(this.sessionDir, "store.json"));
      } catch (error) {
        console.log("No existing store found, starting fresh");
      }
      
      // Update store periodically
      setInterval(() => {
        try {
          this.store.writeToFile(path.join(this.sessionDir, "store.json"));
        } catch (error) {
          console.error("Failed to write store:", error);
        }
      }, 10000);

      this.socket = makeWASocket({
        auth: state,
        browser: Browsers.macOS("Desktop"),
        printQRInTerminal: false,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true,
        defaultQueryTimeoutMs: 30000,
        patchMessageBeforeSending: (message: any) => {
          const patch = {
            ...message,
            mentions: message.mentions || [],
          };
          return patch;
        },
      });

      // Handle connection updates
      this.socket.ev.on("connection.update", async (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          console.log("QR Code generated");
          this.connectionHandlers.forEach(h => h('connecting'));
          onQR(qr);
        }

        if (connection === "close") {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          console.log("Connection closed. Reconnecting:", shouldReconnect);
          
          if (shouldReconnect) {
            this.connectionHandlers.forEach(h => h('connecting'));
            setTimeout(() => {
              this.connect(onQR, onMessage, onConnection);
            }, 5000);
          } else {
            this.isConnected = false;
            this.connectionHandlers.forEach(h => h('disconnected'));
            console.log("Logged out. Please reconnect.");
            try {
              fs.rmSync(this.sessionDir, { recursive: true, force: true });
            } catch (error) {
              console.error("Failed to remove session:", error);
            }
          }
        } else if (connection === "open") {
          this.isConnected = true;
          this.connectionHandlers.forEach(h => h('connected'));
          console.log("WhatsApp connected!");
        }
      });

      // Handle messages
      this.socket.ev.on("messages.upsert", async (m: any) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const parsedMsg = await this.parseMessage(msg);
        if (parsedMsg) {
          this.messageHandlers.forEach(handler => handler(parsedMsg));
        }
      });

      // Save credentials
      this.socket.ev.on("creds.update", saveCreds);

      return true;
    } catch (error) {
      console.error("Failed to connect WhatsApp:", error);
      return false;
    }
  }

  async parseMessage(msg: WAMessage): Promise<WhatsAppMessage | null> {
    try {
      const key = msg.key;
      const message = msg.message;
      
      if (!key || !message) return null;

      const from = key.remoteJid || '';
      const isGroup = from.includes('@g.us');
      const sender = isGroup ? key.participant || from : from;
      const senderName = await this.getContactName(sender);

      let body = '';
      let isMedia = false;
      let mediaType = '';
      let quotedMsg = '';

      if (message.conversation) {
        body = message.conversation;
      } else if (message.extendedTextMessage) {
        body = message.extendedTextMessage.text || '';
        const contextInfo = (message.extendedTextMessage as any).contextInfo;
        if (contextInfo?.quotedMessage) {
          const quoted = contextInfo.quotedMessage;
          if (quoted.conversation) {
            quotedMsg = quoted.conversation;
          } else if (quoted.extendedTextMessage?.text) {
            quotedMsg = quoted.extendedTextMessage.text;
          }
        }
      } else if (message.imageMessage) {
        body = message.imageMessage.caption || '';
        isMedia = true;
        mediaType = 'image';
      } else if (message.videoMessage) {
        body = message.videoMessage.caption || '';
        isMedia = true;
        mediaType = 'video';
      } else if (message.audioMessage) {
        body = message.audioMessage.ptt ? 'Voice message' : 'Audio message';
        isMedia = true;
        mediaType = 'audio';
      } else if (message.documentMessage) {
        body = message.documentMessage.fileName || 'Document';
        isMedia = true;
        mediaType = 'document';
      } else if (message.stickerMessage) {
        body = 'Sticker';
        isMedia = true;
        mediaType = 'sticker';
      }

      const contextInfo = (message.extendedTextMessage as any)?.contextInfo;
      const mentions = contextInfo?.mentionedJid || [];

      return {
        id: key.id || '',
        from,
        body,
        timestamp: typeof msg.messageTimestamp === 'number' ? msg.messageTimestamp : Date.now() / 1000,
        isGroup,
        sender,
        senderName: senderName || sender.split('@')[0],
        isMedia,
        mediaType,
        quotedMsg,
        mentions,
      };
    } catch (error) {
      console.error("Error parsing message:", error);
      return null;
    }
  }

  async sendMessage(to: string, text: string, options?: any): Promise<boolean> {
    if (!this.socket || !this.isConnected) {
      console.error("WhatsApp not connected");
      return false;
    }

    try {
      const result = await this.socket.sendMessage(to, { 
        text,
        ...options 
      });
      return !!result;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  async sendMediaMessage(
    to: string, 
    mediaBuffer: Buffer, 
    type: 'image' | 'video' | 'document',
    caption?: string
  ): Promise<boolean> {
    if (!this.socket || !this.isConnected) {
      console.error("WhatsApp not connected");
      return false;
    }

    try {
      const message: any = {
        [type]: mediaBuffer,
        caption: caption || '',
      };
      
      if (type === 'image') message.mimetype = 'image/jpeg';
      else if (type === 'video') message.mimetype = 'video/mp4';
      else if (type === 'document') message.mimetype = 'application/pdf';

      const result = await this.socket.sendMessage(to, message);
      return !!result;
    } catch (error) {
      console.error("Error sending media:", error);
      return false;
    }
  }

  async getContacts(): Promise<WhatsAppContact[]> {
    if (!this.socket || !this.isConnected) {
      return [];
    }

    try {
      const contacts = await this.socket.groupMetadata('g.us');
      return contacts.participants.map((p: any) => ({
        id: p.id,
        number: p.id.split('@')[0],
        isGroup: true,
        groupName: contacts.subject,
        participants: contacts.participants.map((pp: any) => pp.id),
      }));
    } catch (error) {
      console.error("Error getting contacts:", error);
      return [];
    }
  }

  async getGroups(): Promise<any[]> {
    if (!this.socket || !this.isConnected) {
      return [];
    }

    try {
      const groups = await this.socket.groupMetadata('g.us');
      return [groups];
    } catch (error) {
      console.error("Error getting groups:", error);
      return [];
    }
  }

  private async getContactName(jid: string): Promise<string | undefined> {
    if (!this.socket) return undefined;
    
    try {
      const contact = await this.socket.contactQuery?.({
        jid,
        timeout: 10000
      });
      return contact?.name;
    } catch (error) {
      return undefined;
    }
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      try {
        await this.socket.logout();
      } catch (error) {
        console.error("Error during logout:", error);
      }
      this.isConnected = false;
      this.socket = null;
      this.connectionHandlers.forEach(h => h('disconnected'));
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getSocket(): WASocket | null {
    return this.socket;
  }
}