import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const isAuthenticated = !!session?.user?.email;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const wrappedId = formData.get("wrappedId") as string;
    const mainPrompt = formData.get("mainPrompt") as string;
    const mainText = formData.get("mainText") as string;
    const friendName = formData.get("friendName") as string | null;

    if (!file || !wrappedId || !mainPrompt || !mainText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify wrapped exists and user has access
    const wrapped = await prisma.wrapped.findUnique({
      where: { id: wrappedId },
    });

    if (!wrapped) {
      return NextResponse.json({ error: "Wrapped not found" }, { status: 404 });
    }

    // Get or create user if authenticated
    let user = null;
    if (isAuthenticated && session?.user?.email) {
      user = await prisma.user.findUnique({
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
    }

    // Upload image to Vercel Blob Store
    const blob = await put(
      `submissions/${wrappedId}/${Date.now()}-${file.name}`,
      file,
      {
        access: "public",
      }
    );

    // Get the next position for this wrapped
    const lastSubmission = await prisma.submission.findFirst({
      where: { wrappedId },
      orderBy: { position: "desc" },
    });

    const nextPosition = lastSubmission ? lastSubmission.position + 1 : 0;

    // Create submission in database
    const submission = await prisma.submission.create({
      data: {
        wrappedId,
        authorId: user?.id || null,
        photoUrl: blob.url,
        mainPrompt,
        mainText,
        friendName: friendName || undefined,
        position: nextPosition,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/w/${wrapped.slug}`);

    return NextResponse.json(
      { success: true, submission, isAuthenticated },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}
