import { signIn } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Use NextAuth's signIn function - it will throw a redirect
    const result = await signIn("google", { 
      redirectTo: "/dashboard",
      redirect: true 
    });
    
    // If we get here, return success (shouldn't happen with redirect: true)
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // NextAuth signIn throws a redirect error - we need to return it
    // Check if it's a redirect error
    if (error?.type === "redirect" || error?.url) {
      return NextResponse.redirect(error.url || "/api/auth/signin");
    }
    
    // Fallback: redirect to NextAuth sign-in endpoint
    const origin = request.headers.get("origin") || 
                   request.headers.get("host") || 
                   "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || 
                     (origin.includes("localhost") ? "http" : "https");
    const baseUrl = origin.startsWith("http") ? origin : `${protocol}://${origin}`;
    
    // Try the standard NextAuth sign-in endpoint with provider in body
    return NextResponse.redirect(new URL("/api/auth/signin", baseUrl));
  }
}
