import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getConvexServerClient } from "@/lib/convex-server";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, name, imageUrl } = await req.json();

    const convex = getConvexServerClient();
    
    // Store user in Convex
    const result = await convex.mutation("auth:storeUser", {
      tokenIdentifier: clerkUserId,
      email: email || "",
      name: name || "User",
      imageUrl: imageUrl || "",
    });

    console.log("User stored in Convex:", result);

    return NextResponse.json({ 
      success: true, 
      userId: result,
      message: "User stored successfully" 
    });
  } catch (error) {
    console.error("Failed to store user:", error);
    return NextResponse.json(
      { error: "Failed to store user" },
      { status: 500 }
    );
  }
}