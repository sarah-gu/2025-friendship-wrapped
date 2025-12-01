import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { del } from "@vercel/blob";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the submission and verify ownership
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        wrapped: {
          select: {
            ownerId: true,
            slug: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || submission.wrapped.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You don't own this wrapped" },
        { status: 403 }
      );
    }

    // Delete the blob from Vercel Blob Store
    try {
      await del(submission.photoUrl);
    } catch (blobError) {
      // Log but don't fail if blob deletion fails (blob might already be deleted)
      console.error("Error deleting blob:", blobError);
    }

    // Delete the submission from the database
    await prisma.submission.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/w/${submission.wrapped.slug}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      { error: "Failed to delete submission" },
      { status: 500 }
    );
  }
}
