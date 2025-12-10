import { auth } from "@/auth";
import { redirect } from "next/navigation";
import EditableWrappedWall from "../components/EditableWrappedWall";
import { prisma } from "../lib/prisma";
import { getRandomDefaultTitle } from "../utils/prompts";
import { WrappedTheme } from "../generated/prisma/enums";

function generateSlug(hostName: string): string {
  const base = `${hostName}-${new Date().getFullYear()}`.toLowerCase();
  // Remove special characters and replace spaces with hyphens
  return base
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50); // Limit length
}

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

  // Get or create wrapped for user
  let wrapped = await prisma.wrapped.findFirst({
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

  // If no wrapped exists, create one automatically
  if (!wrapped) {
    const hostName = user.name || "Friend";
    const title = getRandomDefaultTitle();
    const currentYear = new Date().getFullYear();

    // Generate unique slug
    let slug = generateSlug(hostName);
    let counter = 1;
    while (await prisma.wrapped.findUnique({ where: { slug } })) {
      slug = `${generateSlug(hostName)}-${counter}`;
      counter++;
    }

    wrapped = await prisma.wrapped.create({
      data: {
        title,
        hostName,
        year: currentYear,
        theme: WrappedTheme.SPARKLY,
        slug,
        description: "drop the lore, spill the tea, share the vibes",
        ownerId: user.id,
        isPublished: true,
      },
      include: {
        submissions: {
          where: { isHidden: false },
          orderBy: { position: "asc" },
        },
      },
    });
  }

  return (
    <EditableWrappedWall
      wrapped={wrapped}
      ownerName={user.name || ""}
      user={{
        name: user.name,
        image: user.image,
        email: user.email,
      }}
    />
  );
}
