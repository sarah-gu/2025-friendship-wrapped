"use client";

import { useState } from "react";
import { Plus, User } from "lucide-react";
import MemoryGrid from "./MemoryGrid";
import InviteButton from "./InviteButton";
import UploadPhotoModal from "./UploadPhotoModal";
import SignOutButton from "./SignOutButton";
import CreateWrappedButton from "./CreateWrappedButton";
import type { WrappedGetPayload } from "@/app/generated/prisma/models/Wrapped";
import type { Memory } from "@/app/types";

type WrappedWithSubmissions = WrappedGetPayload<{
  include: {
    submissions: true;
  };
}>;

interface WrappedWallProps {
  wrapped: WrappedWithSubmissions;
  ownerName?: string | null;
  isAuthenticated?: boolean;
}

export default function WrappedWall({
  wrapped,
  ownerName,
  isAuthenticated = false,
}: WrappedWallProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Submissions are already in Memory format (Memory = SubmissionModel)
  const memories: Memory[] = wrapped?.submissions || [];
  const currentYear = wrapped?.year || new Date().getFullYear();

  return (
    <>
      {/* Header Content */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-xs md:text-sm shadow-lg shadow-pink-500/20">
                {currentYear.toString().slice(-2)}
              </div>
              <div>
                <h1 className="font-bold text-white text-sm md:text-lg leading-none tracking-tight">
                  Friendships
                </h1>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium tracking-widest uppercase">
                  Wrapped
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <InviteButton slug={wrapped?.slug} />
              <CreateWrappedButton isAuthenticated={isAuthenticated} />
              {isAuthenticated && <SignOutButton />}
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans relative">
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-900/10 rounded-full blur-[120px]"></div>
        </div>

        {/* Main Content */}
        <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full pt-28 md:pt-24 px-4 pb-32">
          {/* Intro Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-pink-400 text-sm font-bold uppercase tracking-wider mb-2">
                <User size={14} /> {ownerName || wrapped?.hostName}&apos;s
                Circle
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {wrapped?.title}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-white">
                {memories.length}
              </p>
              <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">
                Memories Dropped
              </p>
            </div>
          </div>

          {/* Grid */}
          <MemoryGrid memories={memories} />
        </main>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-xs px-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-2xl font-bold text-lg text-white shadow-[0_10px_40px_-10px_rgba(236,72,153,0.5)] border border-white/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus size={24} strokeWidth={3} /> Drop a Memory
          </button>
        </div>
      </div>

      {/* Upload Photo Modal */}
      <UploadPhotoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wrappedId={wrapped.id}
      />
    </>
  );
}
