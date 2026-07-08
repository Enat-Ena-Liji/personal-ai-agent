import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getConvexServerClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const favorite = searchParams.get("favorite") === "true";

    const convex = getConvexServerClient();
    const templates = await convex.query(api.emailTemplates.getTemplates, {
      category: category || undefined,
      favoriteOnly: favorite,
    });

    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error("Failed to get templates:", error);
    return NextResponse.json(
      { error: "Failed to get templates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, subject, body, category, variables, isFavorite } = await req.json();

    if (!name || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const convex = getConvexServerClient();
    const templateId = await convex.mutation(api.emailTemplates.create, {
      name,
      subject,
      body,
      category: category || "other",
      variables: variables || [],
      isFavorite: isFavorite || false,
    });

    return NextResponse.json({ success: true, templateId });
  } catch (error) {
    console.error("Failed to create template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { templateId } = await req.json();

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID required" },
        { status: 400 }
      );
    }

    const convex = getConvexServerClient();
    await convex.mutation(api.emailTemplates.delete, { templateId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}