"use client";

import { ReactNode } from "react";
import MemoryGrid from "./MemoryGrid";
import MemoryDetailModal from "./MemoryDetailModal";
import type { Memory } from "@/app/types";

interface WrappedWallLayoutProps {
  memories: Memory[];
  isEditable?: boolean;
  onMemoryClick?: (memory: Memory) => void;
  children?: ReactNode;
  footer?: ReactNode;
  emptyState?: ReactNode;
  hostName?: string;
}

export default function WrappedWallLayout({
  memories,
  isEditable = false,
  onMemoryClick,
  children,
  footer,
  emptyState,
  hostName,
}: WrappedWallLayoutProps) {
  return (
    <div className="flex-1 bg-black text-slate-100 flex flex-col font-sans relative min-h-0">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full pt-28 md:pt-24 px-4 pb-8 overflow-y-auto min-h-0">
        {children}

        {/* Empty State or Grid */}
        {memories.length === 0 && emptyState ? (
          emptyState
        ) : (
          <MemoryGrid
            memories={memories}
            isEditable={isEditable}
            onMemoryClick={onMemoryClick}
            hostName={hostName}
          />
        )}
      </main>

      {footer}
    </div>
  );
}

