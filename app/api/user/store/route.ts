import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getConvexServerClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import type { ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { userId, getToken } = await auth();
    
    if (!userId) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken();
    const body = await req.json();
    const { email, name, imageUrl } = body;
    
    console.log("API /user/store - User ID:", userId);
    console.log("API /user/store - Email:", email);
    
    const convex = getConvexServerClient();
    
    if (token) {
      convex.setAuth(async () => token);
    }
    
    const result = await convex.mutation(api.auth.storeUser, {
      tokenIdentifier: userId,
      email: email || "user@example.com",
      name: name || "User",
      imageUrl: imageUrl || "",
    });

    console.log("API /user/store - Result:", result);

    return NextResponse.json<ApiResponse>({ 
      success: true, 
      userId: result,
      message: "User stored successfully" 
    });
  } catch (error) {
    console.error("API /user/store - Error:", error);
    return NextResponse.json<ApiResponse>(
      { error: "Failed to store user", details: String(error) },
      { status: 500 }
    );
  }
}