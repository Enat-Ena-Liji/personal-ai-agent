import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { WhatsAppService } from "@/lib/whatsapp-service";

const connections = new Map<string, { service: WhatsAppService }>();

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { to, message } = await req.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: "Missing required fields: to and message" },
        { status: 400 }
      );
    }

    const connection = connections.get(userId);
    if (!connection) {
      return NextResponse.json(
        { error: "WhatsApp not connected" },
        { status: 400 }
      );
    }

    const success = await connection.service.sendMessage(to, message);

    if (success) {
      return NextResponse.json({ 
        success: true,
        message: "Message sent successfully" 
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    return NextResponse.json(
      { error: "Failed to send WhatsApp message" },
      { status: 500 }
    );
  }
}