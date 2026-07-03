import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

export interface Email {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  snippet: string;
  body: string;
  bodyHtml?: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface EmailDraft {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  bodyHtml?: string;
}

export class GmailService {
  private oauth2Client: OAuth2Client;
  private gmail: any;

  constructor(accessToken: string, refreshToken: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    this.gmail = google.gmail({ version: "v1", auth: this.oauth2Client });
  }

  async getEmails(maxResults: number = 50, query: string = "in:inbox"): Promise<Email[]> {
    try {
      await this.refreshTokenIfNeeded();

      const response = await this.gmail.users.messages.list({
        userId: "me",
        maxResults,
        q: query,
      });

      const messages = response.data.messages || [];
      const emails: Email[] = [];

      for (const message of messages) {
        const email = await this.getEmailDetails(message.id);
        if (email) emails.push(email);
      }

      return emails;
    } catch (error) {
      console.error("Error fetching emails:", error);
      return [];
    }
  }

  async getEmailDetails(messageId: string): Promise<Email | null> {
    try {
      await this.refreshTokenIfNeeded();

      const response = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      const message = response.data;
      const headers = message.payload?.headers || [];

      const getHeader = (name: string) => {
        const header = headers.find((h: any) => h.name === name);
        return header?.value || "";
      };

      // Parse body
      let body = "";
      let bodyHtml = "";
      const attachments: Attachment[] = [];

      if (message.payload) {
        const parts = this.getParts(message.payload);
        for (const part of parts) {
          if (part.mimeType === "text/plain" && part.body?.data) {
            body = Buffer.from(part.body.data, "base64").toString("utf-8");
          } else if (part.mimeType === "text/html" && part.body?.data) {
            bodyHtml = Buffer.from(part.body.data, "base64").toString("utf-8");
          } else if (part.filename && part.body?.attachmentId) {
            attachments.push({
              id: part.body.attachmentId,
              filename: part.filename,
              mimeType: part.mimeType,
              size: parseInt(part.body.size || "0"),
            });
          }
        }
      }

      return {
        id: message.id || "",
        threadId: message.threadId || "",
        from: getHeader("From"),
        to: getHeader("To").split(",").map((s: string) => s.trim()),
        cc: getHeader("Cc")?.split(",").map((s: string) => s.trim()),
        bcc: getHeader("Bcc")?.split(",").map((s: string) => s.trim()),
        subject: getHeader("Subject"),
        snippet: message.snippet || "",
        body,
        bodyHtml,
        date: getHeader("Date"),
        isRead: !message.labelIds?.includes("UNREAD"),
        isStarred: message.labelIds?.includes("STARRED") || false,
        labels: message.labelIds || [],
        attachments,
      };
    } catch (error) {
      console.error("Error fetching email details:", error);
      return null;
    }
  }

  async sendEmail(email: EmailDraft): Promise<boolean> {
    try {
      await this.refreshTokenIfNeeded();

      const message = this.createEmailMessage(email);

      await this.gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: message,
        },
      });

      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  async replyEmail(threadId: string, originalEmail: Email, replyBody: string): Promise<boolean> {
    try {
      await this.refreshTokenIfNeeded();

      const email: EmailDraft = {
        to: [originalEmail.from],
        cc: originalEmail.cc,
        subject: originalEmail.subject.startsWith("Re:")
          ? originalEmail.subject
          : `Re: ${originalEmail.subject}`,
        body: `${replyBody}\n\nOn ${originalEmail.date}, ${originalEmail.from} wrote:\n${originalEmail.body
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n")}`,
      };

      const message = this.createEmailMessage(email);

      await this.gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: message,
          threadId: threadId,
        },
      });

      return true;
    } catch (error) {
      console.error("Error replying to email:", error);
      return false;
    }
  }

  private createEmailMessage(email: EmailDraft): string {
    const lines = [];
    lines.push(`To: ${email.to.join(", ")}`);
    if (email.cc && email.cc.length > 0) {
      lines.push(`Cc: ${email.cc.join(", ")}`);
    }
    if (email.bcc && email.bcc.length > 0) {
      lines.push(`Bcc: ${email.bcc.join(", ")}`);
    }
    lines.push(`Subject: ${email.subject}`);
    lines.push("MIME-Version: 1.0");
    lines.push("Content-Type: text/html; charset=UTF-8");
    lines.push("");
    lines.push(email.body);

    const message = lines.join("\n");
    return Buffer.from(message).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
  }

  private getParts(payload: any): any[] {
    const parts: any[] = [];
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.parts) {
          parts.push(...this.getParts(part));
        } else {
          parts.push(part);
        }
      }
    } else {
      parts.push(payload);
    }
    return parts;
  }

  private async refreshTokenIfNeeded() {
    try {
      await this.oauth2Client.getAccessToken();
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  }
}