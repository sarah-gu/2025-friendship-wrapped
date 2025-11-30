import React from "react";
import { Memory } from "@/app/types";
import { Trash2, Wand2, Sparkles, Quote } from "lucide-react";

interface MemoryGridProps {
  memories: Memory[];
}

const MemoryGrid: React.FC<MemoryGridProps> = ({ memories }) => {
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
            <img
              src={memory.photoUrl}
              alt={memory.mainPrompt || "Memory"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>

            {/* Top Badge */}
            {memory.mainPrompt && (
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  {memory.mainPrompt}
                </span>
              </div>
            )}

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

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(memory.id);
                      }}
                      className="p-2 bg-red-600/80 hover:bg-red-500 backdrop-blur-md rounded-full text-white transition-colors"
                    >
                      <Trash2 size={16} />
                    </button> */}
                  </div>
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
