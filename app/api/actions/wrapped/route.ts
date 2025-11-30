import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";

function generateSlug(title: string, hostName: string): string {
  const base = `${hostName}-${new Date().getFullYear()}`.toLowerCase();
  // Remove special characters and replace spaces with hyphens
  return base
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50); // Limit length
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, hostName, year, theme, description, coverImageUrl } = body;

    if (!title || !hostName) {
      return NextResponse.json(
        { error: "Title and hostName are required" },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || undefined,
          image: session.user.image || undefined,
        },
      });
    }

    // Generate unique slug
    let slug = generateSlug(title, hostName);
    let counter = 1;
    while (await prisma.wrapped.findUnique({ where: { slug } })) {
      slug = `${generateSlug(title, hostName)}-${counter}`;
      counter++;
    }

    const wrapped = await prisma.wrapped.create({
      data: {
        title,
        hostName,
        year: year || new Date().getFullYear(),
        theme: (theme as any) || "SPARKLY",
        description: description || undefined,
        coverImageUrl: coverImageUrl || undefined,
        slug,
        ownerId: user.id,
        isPublished: true,
      },
    });

    revalidatePath("/dashboard");

    return NextResponse.json({ success: true, wrapped }, { status: 201 });
  } catch (error) {
    console.error("Error creating wrapped:", error);
    return NextResponse.json(
      { error: "Failed to create wrapped" },
      { status: 500 }
    );
  }
}
