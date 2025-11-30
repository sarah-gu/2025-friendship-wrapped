import { auth } from "@/auth";
import { redirect } from "next/navigation";
import WrappedWall from "../components/WrappedWall";
import EditableWrappedWall from "../components/EditableWrappedWall";
import { prisma } from "../lib/prisma";

export default async function Dashboard() {
  const session = await auth();

  // If user is not signed in, redirect to home
  if (!session?.user?.email) {
    redirect("/");
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

  // Check if user has a wrapped
  const wrapped = await prisma.wrapped.findFirst({
    where: {
      ownerId: user.id,
      isDeleted: false,
    },
    include: {
      submissions: {
        where: { isHidden: false },
        orderBy: { position: "asc" },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      {wrapped ? (
        <WrappedWall wrapped={wrapped} ownerName={user.name} />
      ) : (
        <EditableWrappedWall ownerName={user.name || ""} />
      )}
    </>
  );
}
