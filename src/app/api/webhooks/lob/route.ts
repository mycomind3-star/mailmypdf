import { NextResponse } from "next/server";
import { handleLobWebhook } from "@/lib/lob-webhook";

export async function POST(request: Request) {
  try {
    return NextResponse.json(await handleLobWebhook(request));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid Lob webhook." },
      { status: 400 },
    );
  }
}
