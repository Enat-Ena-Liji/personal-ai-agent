import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getConvexServerClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import type { User, Platform, CheckUserResponse } from "@/types";

export async function GET() {
  try {
    const { userId, getToken } = await auth();
    
    console.log("API /user/check - User ID:", userId);
    
    if (!userId) {
      return NextResponse.json<CheckUserResponse>({ 
        error: "Unauthorized",
        user: null,
        platforms: [],
        clerkId: "",
        tokenReceived: false,
        message: "No user ID from Clerk"
      }, { status: 401 });
    }

    const token = await getToken();
    console.log("API /user/check - Token received:", token ? "Yes (length: " + token.length + ")" : "No");
    
    if (!token) {
      return NextResponse.json<CheckUserResponse>({
        user: null,
        platforms: [],
        clerkId: userId,
        tokenReceived: false,
        message: "No token received from Clerk",
      }, { status: 401 });
    }
    
    const convex = getConvexServerClient();
    
    // Set auth on the client
    convex.setAuth(async () => token);
    
    let user: User | null = null;
    let platforms: Platform[] = [];
    
    try {
      user = await convex.query(api.auth.getCurrentUser, {});
      console.log("API /user/check - User found:", user ? "Yes" : "No");
      
      if (!user) {
        console.log("API /user/check - User not found, attempting to store...");
        
        const storeResult = await convex.mutation(api.auth.storeUser, {
          tokenIdentifier: userId,
          email: "danielayen2112@gmail.com",
          name: "Daniel Ayen",
          imageUrl: "",
        });
        
        console.log("API /user/check - Store result:", storeResult);
        
        user = await convex.query(api.auth.getCurrentUser, {});
        console.log("API /user/check - User after store:", user ? "Yes" : "No");
      }
      
      platforms = await convex.query(api.platforms.getPlatforms, {});
      console.log("API /user/check - Platforms found:", platforms.length);
    } catch (error) {
      console.error("API /user/check - Convex error:", error);
      return NextResponse.json<CheckUserResponse>({
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
    
    return NextResponse.json<CheckUserResponse>({
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
    return NextResponse.json<CheckUserResponse>(
      { 
        error: "Failed to check user",
        user: null,
        platforms: [],
        clerkId: "",
        tokenReceived: false,
        details: String(error),
      },
      { status: 500 }
    );
  }
}