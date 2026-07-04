import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

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
    
    if (!token) {
      return NextResponse.json({
        user: null,
        platforms: [],
        clerkId: userId,
        tokenReceived: false,
        message: "No token received from Clerk",
      }, { status: 401 });
    }
    
    // Use fetch directly with the token in the Authorization header
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
    }
    
    let user = null;
    let platforms = [];
    
    try {
      // Query user using fetch with token
      const userResponse = await fetch(`${url}/api/query/auth:getCurrentUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      
      if (userResponse.ok) {
        user = await userResponse.json();
        console.log("API /user/check - User found via fetch:", user ? "Yes" : "No");
      } else {
        console.log("API /user/check - User query failed:", userResponse.status);
        const errorText = await userResponse.text();
        console.log("Error response:", errorText);
      }
      
      // If user not found, try to store them
      if (!user) {
        console.log("API /user/check - User not found, attempting to store...");
        
        const storeResponse = await fetch(`${url}/api/mutation/auth:storeUser`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            tokenIdentifier: userId,
            email: "danielayen2112@gmail.com",
            name: "Daniel Ayen",
            imageUrl: "",
          }),
        });
        
        if (storeResponse.ok) {
          const storeData = await storeResponse.json();
          console.log("API /user/check - Store result:", storeData);
        } else {
          console.log("API /user/check - Store failed:", storeResponse.status);
          const errorText = await storeResponse.text();
          console.log("Store error:", errorText);
        }
        
        // Try to get the user again
        const retryResponse = await fetch(`${url}/api/query/auth:getCurrentUser`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });
        
        if (retryResponse.ok) {
          user = await retryResponse.json();
          console.log("API /user/check - User after store:", user ? "Yes" : "No");
        }
      }
      
      // Get platforms
      const platformsResponse = await fetch(`${url}/api/query/platforms:getPlatforms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      
      if (platformsResponse.ok) {
        platforms = await platformsResponse.json();
        console.log("API /user/check - Platforms found:", platforms.length);
      }
    } catch (error) {
      console.error("API /user/check - Convex error:", error);
      return NextResponse.json({
        user: null,
        platforms: [],
        clerkId: userId,
        tokenReceived: !!token,
        message: "Convex error: " + (error as Error).message,
        debug: {
          userId,
          tokenLength: token?.length || 0,
        }
      }, { status: 500 });
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