import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership
    const existing = await prisma.wrapped.findFirst({
      where: { id: params.id, ownerId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, hostName, year, theme, description, coverImageUrl } = body;

    const wrapped = await prisma.wrapped.update({
      where: { id: params.id },
      data: {
        title,
        hostName,
        year: year || new Date().getFullYear(),
        theme: (theme as any) || "SPARKLY",
        description: description || undefined,
        coverImageUrl: coverImageUrl || undefined,
      },
    });

    revalidatePath("/dashboard");

    return NextResponse.json({ success: true, wrapped });
  } catch (error) {
    console.error("Error updating wrapped:", error);
    return NextResponse.json(
      { error: "Failed to update wrapped" },
      { status: 500 }
    );
  }
}
