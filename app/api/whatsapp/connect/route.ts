import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { WhatsAppService } from "@/lib/whatsapp-service";
import { getConvexServerClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";

// Store active WhatsApp connections
const connections = new Map<string, { 
  service: WhatsAppService; 
  qr: string;
  status: 'connecting' | 'connected' | 'disconnected';
}>();

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const service = new WhatsAppService(userId);
    
    // Check if connection already exists
    const existing = connections.get(userId);
    if (existing && existing.status === 'connected') {
      return NextResponse.json({ 
        message: "Already connected",
        status: 'connected',
        qr: null 
      });
    }

    // Create a promise to get QR code
    const qrPromise = new Promise<string>((resolve) => {
      const connection = connections.get(userId);
      
      service.connect(
        (qr) => {
          // Store connection
          connections.set(userId, { 
            service, 
            qr,
            status: 'connecting' 
          });
          resolve(qr);
        },
        async (msg) => {
          // Store incoming messages in Convex
          try {
            const convex = getConvexServerClient();
            await convex.mutation(api.alerts.createAlert, {
              title: `📱 WhatsApp: ${msg.senderName || msg.sender}`,
              message: msg.body.substring(0, 100),
              type: "whatsapp",
              priority: msg.body.toLowerCase().includes('urgent') ? 'high' : 'medium',
              data: msg,
            });
          } catch (error) {
            console.error("Failed to store WhatsApp message:", error);
          }
        },
        (status) => {
          // Update connection status
          const conn = connections.get(userId);
          if (conn) {
            conn.status = status;
          }
        }
      );
    });

    // Wait for QR code (with timeout)
    const qr = await Promise.race([
      qrPromise,
      new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout waiting for QR")), 60000)
      ),
    ]);

    return NextResponse.json({ 
      qr,
      status: 'connecting',
      message: "QR code generated successfully"
    });
  } catch (error) {
    console.error("WhatsApp connection error:", error);
    return NextResponse.json(
      { error: "Failed to connect WhatsApp", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const connection = connections.get(userId);
    if (connection) {
      await connection.service.disconnect();
      connections.delete(userId);
    }

    // Also disconnect from Convex
    const convex = getConvexServerClient();
    await convex.mutation(api.platforms.disconnectPlatform, {
      platform: "whatsapp",
    });

    return NextResponse.json({ 
      success: true,
      message: "WhatsApp disconnected successfully" 
    });
  } catch (error) {
    console.error("Failed to disconnect WhatsApp:", error);
    return NextResponse.json(
      { error: "Failed to disconnect WhatsApp" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connection = connections.get(userId);
  
  return NextResponse.json({
    connected: connection?.status === 'connected',
    status: connection?.status || 'disconnected',
    qr: connection?.qr || null,
  });
}