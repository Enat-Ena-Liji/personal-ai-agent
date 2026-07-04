import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, getToken } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken();
    const { email, name, imageUrl } = await req.json();
    
    console.log("API /user/store - User ID:", userId);
    console.log("API /user/store - Email:", email);
    
    // Use fetch directly with the token in the Authorization header
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
    }
    
    // Store user using fetch with token
    const storeResponse = await fetch(`${url}/api/mutation/auth:storeUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        tokenIdentifier: userId,
        email: email || "user@example.com",
        name: name || "User",
        imageUrl: imageUrl || "",
      }),
    });
    
    if (!storeResponse.ok) {
      const errorText = await storeResponse.text();
      console.error("Store error:", errorText);
      return NextResponse.json({
        error: "Failed to store user",
        details: errorText,
      }, { status: storeResponse.status });
    }
    
    const result = await storeResponse.json();
    console.log("API /user/store - Result:", result);

    return NextResponse.json({ 
      success: true, 
      userId: result,
      message: "User stored successfully" 
    });
  } catch (error) {
    console.error("API /user/store - Error:", error);
    return NextResponse.json(
      { error: "Failed to store user", details: String(error) },
      { status: 500 }
    );
  }
}