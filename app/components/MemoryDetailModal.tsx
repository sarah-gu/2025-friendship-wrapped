"use client";

import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { Memory } from "@/app/types";

interface MemoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: Memory | null;
}

const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  isOpen,
  onClose,
  memory,
}) => {
  if (!isOpen || !memory) return null;

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop with liquid glass effect */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-indigo-900/20 backdrop-blur-xl"
        onClick={onClose}
      >
        {/* Additional blur layers for liquid effect */}
        <div className="absolute inset-0 backdrop-blur-2xl bg-black/30"></div>
        <div className="absolute inset-0 backdrop-blur-md bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      {/* Close Button - Floating */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-colors border border-white/10"
        aria-label="Close modal"
      >
        <X size={24} />
      </button>

      {/* Photo - Takes up most space */}
      <div className="flex-1 relative min-h-0">
        <Image
          src={memory.photoUrl}
          alt={memory.mainPrompt || "Memory"}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      {/* Black Footer with Rainbow Border */}
      <div className="relative p-1">
        {/* Rainbow gradient blur effect - thinner border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-lg blur opacity-75"></div>
        {/* Footer content */}
        <div className="relative bg-black border border-white/10 rounded-lg p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Date in corner */}
            {memory.createdAt && (
              <div className="absolute top-4 right-4 md:top-6 md:right-6">
                <p className="text-xs text-slate-400 font-medium">
                  {formatDate(memory.createdAt)}
                </p>
              </div>
            )}

            {/* Main Content */}
            <div className="space-y-3 pr-20 md:pr-32">
              {/* Prompt */}
              {memory.mainPrompt && (
                <div>
                  <span className="inline-block px-3 py-1 bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-full">
                    {memory.mainPrompt}
                  </span>
                </div>
              )}

              {/* Friend Name */}
              <div>
                <p className="text-sm text-slate-400 font-medium">
                  {memory.friendName || "anonymous"}
                </p>
              </div>

              {/* Main Text */}
              {memory.mainText && (
                <div>
                  <p className="text-white text-sm md:text-base lg:text-lg font-medium leading-relaxed">
                    {memory.mainText}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryDetailModal;
