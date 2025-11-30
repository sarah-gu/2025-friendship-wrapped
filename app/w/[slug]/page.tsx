import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import WrappedWall from "@/app/components/WrappedWall";

export default async function WrappedPage({
  params,
}: {
  params: { slug: string };
}) {
  const wrapped = await prisma.wrapped.findUnique({
    where: {
      slug: params.slug,
      isPublished: true,
      isDeleted: false,
    },
    include: {
      submissions: {
        where: { isHidden: false },
        orderBy: { position: "asc" },
      },
      owner: {
        select: {
          name: true,
        },
      },
    },
  });
  console.log("slug", params.slug);
  if (!wrapped) {
    notFound();
  }

  return <WrappedWall wrapped={wrapped} ownerName={wrapped.owner?.name} />;
}
