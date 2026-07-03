import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getConvexServerClient } from "@/lib/convex-server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Storing token for user:", userId);
    console.log("Platform:", body.platform);
    console.log("Account:", body.accountEmail);

    const convex = getConvexServerClient();
    
    // Call the mutation
    const result = await convex.mutation("platforms:connectPlatform", {
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