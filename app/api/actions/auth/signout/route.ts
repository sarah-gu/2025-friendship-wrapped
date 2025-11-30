import { signOut } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await signOut({ redirectTo: "/", redirect: false });
    return NextResponse.json({ success: true, url: "/" });
  } catch (error: any) {
    // If it's a redirect error (which NextAuth throws), return the redirect URL
    if (error?.url) {
      return NextResponse.json({ success: true, url: error.url });
    }
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}

