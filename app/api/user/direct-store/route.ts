import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getConvexServerClient } from "@/lib/convex-server";

export async function POST(req: NextRequest) {
  try {
    const { userId, getToken } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, name, imageUrl } = await req.json();
    
    console.log("Direct store - User ID:", userId);
    console.log("Direct store - Email:", email);
    console.log("Direct store - Name:", name);

    const convex = getConvexServerClient();
    
    // Store user in Convex
    const result = await convex.mutation("auth:storeUser", {
      tokenIdentifier: userId,
      email: email || "user@example.com",
      name: name || "User",
      imageUrl: imageUrl || "",
    });

    console.log("Direct store - Result:", result);

    // Verify user was created
    const user = await convex.query("auth:getCurrentUser");
    console.log("Direct store - User after store:", user ? "Found" : "Not found");

    return NextResponse.json({ 
      success: true, 
      userId: result,
      user: user,
      message: "User stored successfully" 
    });
  } catch (error) {
    console.error("Direct store - Error:", error);
    return NextResponse.json(
      { error: "Failed to store user", details: String(error) },
      { status: 500 }
    );
  }
}