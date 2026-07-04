import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getConvexServerClient } from "@/lib/convex-server";

export async function GET() {
  try {
    const { userId, getToken } = await auth();
    
    console.log("API /user/check - User ID:", userId);
    
    if (!userId) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        userId: null,
        message: "No user ID from Clerk"
      }, { status: 401 });
    }

    const token = await getToken();
    console.log("API /user/check - Token received:", token ? "Yes (length: " + token.length + ")" : "No");
    
    const convex = getConvexServerClient();
    
    // Try to get the current user
    let user = null;
    let platforms = [];
    
    try {
      user = await convex.query("auth:getCurrentUser");
      console.log("API /user/check - User found:", user ? "Yes" : "No");
      
      if (!user) {
        console.log("API /user/check - User not found, attempting to store...");
        
        const storeResult = await convex.mutation("auth:storeUser", {
          tokenIdentifier: userId,
          email: "danielayen2112@gmail.com",
          name: "Daniel Ayen",
          imageUrl: "",
        });
        console.log("API /user/check - Store result:", storeResult);
        
        user = await convex.query("auth:getCurrentUser");
        console.log("API /user/check - User after store:", user ? "Yes" : "No");
      }
      
      platforms = await convex.query("platforms:getPlatforms");
      console.log("API /user/check - Platforms found:", platforms.length);
    } catch (error) {
      console.error("API /user/check - Convex error:", error);
    }
    
    return NextResponse.json({
      user: user,
      platforms: platforms,
      clerkId: userId,
      tokenReceived: !!token,
      message: user ? "User found" : "User not found",
      debug: {
        userId,
        tokenLength: token?.length || 0,
      }
    });
  } catch (error) {
    console.error("API /user/check - Error:", error);
    return NextResponse.json(
      { error: "Failed to check user", details: String(error) },
      { status: 500 }
    );
  }
}