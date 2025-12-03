import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import CreateWrappedButton from "@/app/components/CreateWrappedButton";
import SignOutButton from "@/app/components/SignOutButton";

export default async function ExplorePage() {
  const session = await auth();

  // Get current user if authenticated
  let currentUserId: string | null = null;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    currentUserId = user?.id || null;
  }

  // Fetch all published wrapped walls
  const allWrappeds = await prisma.wrapped.findMany({
    where: {
      isPublished: true,
      isDeleted: false,
    },
    include: {
      owner: {
        select: {
          name: true,
        },
      },
      submissions: {
        where: { isHidden: false },
        take: 1, // Just get one for preview
        orderBy: { position: "asc" },
      },
      _count: {
        select: {
          submissions: {
            where: { isHidden: false },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Separate user's wall and others
  const userWall = currentUserId
    ? allWrappeds.find((w) => w.ownerId === currentUserId)
    : null;
  const otherWalls = allWrappeds.filter(
    (w) => !currentUserId || w.ownerId !== currentUserId
  );

  // Shuffle and take 10 random walls
  const shuffled = [...otherWalls].sort(() => Math.random() - 0.5);
  const randomWalls = shuffled.slice(0, 10);

  // Combine: user's wall first, then random 10
  const wallsToShow = userWall ? [userWall, ...randomWalls] : randomWalls;

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans relative">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/explore"
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-xs md:text-sm shadow-lg shadow-pink-500/20">
                {new Date().getFullYear().toString().slice(-2)}
              </div>
              <div>
                <h1 className="font-bold text-white text-sm md:text-lg leading-none tracking-tight">
                  Friendships
                </h1>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium tracking-widest uppercase">
                  Wrapped
                </p>
              </div>
            </Link>

            <div className="flex gap-3 items-center">
              <CreateWrappedButton isAuthenticated={!!session?.user} />
              {session?.user && <SignOutButton />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full pt-28 md:pt-24 px-4 pb-32">
        <div className="mb-12">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Explore Walls
          </h2>
          <p className="text-slate-400 text-sm md:text-lg">
            Discover friendship wrapped walls from the community
          </p>
        </div>

        {/* Grid of Wall Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wallsToShow.map((wrapped) => (
            <Link
              key={wrapped.id}
              href={`/w/${wrapped.slug}`}
              className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5 transition-all duration-300 hover:border-pink-500/50 hover:shadow-pink-900/20 hover:-translate-y-1"
            >
              {/* Preview Image */}
              <div className="aspect-[4/5] relative bg-black overflow-hidden">
                {wrapped.submissions[0] ? (
                  <Image
                    src={wrapped.submissions[0].photoUrl}
                    alt={wrapped.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                    <p className="text-slate-500 text-sm">No memories yet</p>
                  </div>
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>

                {/* Badge if it's user's wall */}
                {currentUserId && wrapped.ownerId === currentUserId && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 bg-pink-600/90 backdrop-blur-md border border-pink-500/50 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                      Your Wall
                    </span>
                  </div>
                )}
              </div>

              {/* Card Info */}
              <div className="p-5">
                <h3 className="text-white font-bold text-sm md:text-lg mb-2 line-clamp-2">
                  {wrapped.title}
                </h3>
                <p className="text-slate-400 text-sm mb-3">
                  {wrapped.owner?.name || wrapped.hostName}&apos;s Circle
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{wrapped._count.submissions} memories</span>
                  <span>{wrapped.year}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {wallsToShow.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <p className="text-base md:text-xl font-bold text-slate-300">
              No walls to explore yet
            </p>
            <p className="text-slate-500 mt-2">
              Be the first to create a wrapped wall!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
