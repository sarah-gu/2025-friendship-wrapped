"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Memory } from "@/app/types";
import { Trash2, Sparkles, Quote } from "lucide-react";

interface MemoryGridProps {
  memories: Memory[];
  isEditable?: boolean;
}

const MemoryGrid: React.FC<MemoryGridProps> = ({
  memories,
  isEditable = false,
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (memoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this memory?")) {
      return;
    }

    setDeletingId(memoryId);
    try {
      const response = await fetch(`/api/actions/submissions/${memoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete memory");
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Error deleting memory:", error);
      alert("Failed to delete memory. Please try again.");
      setDeletingId(null);
    }
  };
  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="text-slate-400" size={32} />
        </div>
        <p className="text-xl font-bold text-slate-300">
          It&apos;s quiet in here...
        </p>
        <p className="text-slate-500 mt-2">Be the first to drop a photo.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {memories.map((memory) => (
        <div
          key={memory.id}
          className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5 transition-all duration-300 hover:border-pink-500/50 hover:shadow-pink-900/20 hover:-translate-y-1"
        >
          {/* Image */}
          <div className="aspect-[4/5] relative bg-black overflow-hidden">
            <Image
              src={memory.photoUrl}
              alt={memory.mainPrompt || "Memory"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>

            {/* Top Badge */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
              {memory.mainPrompt && (
                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  {memory.mainPrompt}
                </span>
              )}
              {isEditable && (
                <button
                  onClick={(e) => handleDelete(memory.id, e)}
                  disabled={deletingId === memory.id}
                  className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                  aria-label="Delete memory"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Bottom Content overlaid on image for a 'Story' feel */}
            <div className="absolute bottom-0 left-0 right-0 p-5 pt-12">
              <div className="relative z-10">
                {memory.mainText && (
                  <>
                    <Quote
                      className="text-pink-500 mb-2 opacity-80"
                      size={20}
                    />
                    <p className="text-white text-lg font-bold leading-tight font-['Space_Grotesk'] drop-shadow-md">
                      {memory.mainText}
                    </p>
                  </>
                )}

                <div className="flex justify-between items-end mt-4">
                  {memory.friendName && (
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Added by {memory.friendName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemoryGrid;
