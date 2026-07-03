import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(req: NextRequest) {
  console.log("Gmail callback received!");
  
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  
  // Check for Google errors
  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/dashboard/gmail?error=${error}`, req.url)
    );
  }
  
  if (!code || !state) {
    console.error("Missing code or state:", { code, state });
    return NextResponse.redirect(
      new URL("/dashboard/gmail?error=missing_params", req.url)
    );
  }

  try {
    console.log("Exchanging code for tokens...");
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Tokens received:", {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
    });
    
    oauth2Client.setCredentials(tokens);

    // Get user profile
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: "me" });
    console.log("Gmail profile fetched:", profile.data.emailAddress);

    // Store tokens using a simpler approach - direct fetch to your API
    const storeResponse = await fetch(`${req.nextUrl.origin}/api/gmail/store-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward the session cookie
        cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        platform: "gmail",
        accountId: profile.data.emailAddress!,
        accountEmail: profile.data.emailAddress!,
        accountName: profile.data.emailAddress!,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
      }),
    });

    const storeResult = await storeResponse.json();
    console.log("Token storage result:", storeResult);

    if (!storeResult.success) {
      throw new Error(storeResult.error || "Failed to store token");
    }

    // Redirect to Gmail page with success
    return NextResponse.redirect(
      new URL("/dashboard/gmail?connected=true", req.url)
    );
  } catch (error) {
    console.error("Gmail OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/dashboard/gmail?error=${encodeURIComponent(String(error))}`, req.url)
    );
  }
}