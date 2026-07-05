import { 
  default as makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  makeInMemoryStore,
  Browsers,
  WASocket,
  WAMessage,
  proto
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import * as path from "path";
import * as fs from "fs";

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
    this.store = makeInMemoryStore({});
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
      this.store.readFromFile(path.join(this.sessionDir, "store.json"));
      
      // Update store periodically
      setInterval(() => {
        this.store.writeToFile(path.join(this.sessionDir, "store.json"));
      }, 10000);

      this.socket = makeWASocket({
        auth: state,
        browser: Browsers.macOS("Desktop"),
        printQRInTerminal: false,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true,
        defaultQueryTimeoutMs: 30000,
        patchMessageBeforeSending: (message) => {
          const patch = {
            ...message,
            mentions: message.mentions || [],
            contextInfo: message.contextInfo || {},
          };
          return patch as any;
        },
      });

      // Handle connection updates
      this.socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          console.log("QR Code generated");
          this.connectionHandlers.forEach(h => h('connecting'));
          onQR(qr);
        }

        if (connection === "close") {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
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
            // Delete session if logged out
            fs.rmSync(this.sessionDir, { recursive: true, force: true });
          }
        } else if (connection === "open") {
          this.isConnected = true;
          this.connectionHandlers.forEach(h => h('connected'));
          console.log("WhatsApp connected!");
        }
      });

      // Handle messages
      this.socket.ev.on("messages.upsert", async (m) => {
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

      // Get message content
      let body = '';
      let isMedia = false;
      let mediaType = '';
      let quotedMsg = '';

      if (message.conversation) {
        body = message.conversation;
      } else if (message.extendedTextMessage) {
        body = message.extendedTextMessage.text || '';
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

      // Check for quoted message
      if (message.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quoted = message.extendedTextMessage.contextInfo.quotedMessage;
        if (quoted.conversation) {
          quotedMsg = quoted.conversation;
        } else if (quoted.extendedTextMessage?.text) {
          quotedMsg = quoted.extendedTextMessage.text;
        }
      }

      // Get mentions
      const mentions = message.extendedTextMessage?.contextInfo?.mentionedJid || [];

      return {
        id: key.id || '',
        from,
        body,
        timestamp: msg.messageTimestamp as number || Date.now() / 1000,
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
      const message = {
        [type]: mediaBuffer,
        caption: caption || '',
        mimetype: type === 'image' ? 'image/jpeg' : type === 'video' ? 'video/mp4' : 'application/pdf',
      };

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
      const contact = await this.socket?.contactQuery?.({ 
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
      await this.socket.logout();
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