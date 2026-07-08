import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function POST(req: NextRequest) {
  try {
    const authObject = await auth();
    if (!authObject.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Storing token for user:", authObject.userId);
    console.log("Platform:", body.platform);
    console.log("Account:", body.accountEmail);

    // Get the session token for Convex authentication
    const sessionToken = await authObject.getToken();
    
    // Create a new Convex client for this request with auth
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
      auth: sessionToken,
    });
    
    // Call the mutation
    const result = await convex.mutation(api.platforms.connectPlatform, {
      platform: body.platform,
      accountId: body.accountId,
      accountEmail: body.accountEmail,
      accountName: body.accountName,
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
    });

    console.log("Token stored successfully:", result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Failed to store token:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}