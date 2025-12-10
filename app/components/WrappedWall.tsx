"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import UploadPhotoModal from "./UploadPhotoModal";
import MemoryDetailModal from "./MemoryDetailModal";
import WrappedWallHeader from "./WrappedWallHeader";
import WrappedWallLayout from "./WrappedWallLayout";
import WrappedWallIntro from "./WrappedWallIntro";
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
  user?: {
    name?: string | null;
    image?: string | null;
    email?: string | null;
  } | null;
}

export default function WrappedWall({
  wrapped,
  ownerName,
  user = null,
}: WrappedWallProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Submissions are already in Memory format (Memory = SubmissionModel)
  const memories: Memory[] = wrapped?.submissions || [];
  const currentYear = wrapped?.year || new Date().getFullYear();

  return (
    <div className="h-screen bg-black text-slate-100 flex flex-col font-sans relative overflow-hidden">
      <WrappedWallHeader
        year={currentYear}
        slug={wrapped?.slug}
        showExploreHint={true}
        user={user}
        rightContent={<></>}
      />

      <WrappedWallLayout
        memories={memories}
        onMemoryClick={(memory) => {
          setSelectedMemory(memory);
          setIsDetailModalOpen(true);
        }}
        hostName={ownerName || wrapped?.hostName || ""}
        footer={
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-xs px-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-2xl font-bold text-sm md:text-lg text-white shadow-[0_10px_40px_-10px_rgba(236,72,153,0.5)] border border-white/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus size={24} strokeWidth={3} /> Drop a Memory
            </button>
          </div>
        }
      >
        <WrappedWallIntro
          hostName={ownerName || wrapped?.hostName || ""}
          title={wrapped?.title || ""}
          description={wrapped?.description}
          memoryCount={memories.length}
        />
      </WrappedWallLayout>

      {/* Upload Photo Modal */}
      <UploadPhotoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wrappedId={wrapped.id}
      />

      {/* Memory Detail Modal */}
      <MemoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedMemory(null);
        }}
        memory={selectedMemory}
      />
    </div>
  );
}
