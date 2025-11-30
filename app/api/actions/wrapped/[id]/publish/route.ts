import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    const existing = await prisma.wrapped.findFirst({
      where: { id, ownerId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const wrapped = await prisma.wrapped.update({
      where: { id },
      data: {
        isPublished: true,
      },
    });

    revalidatePath("/dashboard");

    return NextResponse.json({ success: true, wrapped });
  } catch (error) {
    console.error("Error publishing wrapped:", error);
    return NextResponse.json(
      { error: "Failed to publish wrapped" },
      { status: 500 }
    );
  }
}

