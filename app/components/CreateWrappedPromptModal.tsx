"use client";

import { X } from "lucide-react";
import { signInWithGoogle } from "@/app/api/actions/auth/signin-action";

interface CreateWrappedPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateWrappedPromptModal({
  isOpen,
  onClose,
}: CreateWrappedPromptModalProps) {
  const handleCreateWrapped = async () => {
    await signInWithGoogle();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative z-10 bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">
            Create Your Own Wrapped Wall
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            Thanks for dropping a memory! Want to create your own wrapped wall
            and invite friends to share memories with you?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-bold transition-all"
          >
            Maybe Later
          </button>
          <button
            onClick={handleCreateWrapped}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 rounded-lg text-white text-sm font-bold transition-all shadow-lg shadow-pink-500/20"
          >
            Create My Wall
          </button>
        </div>
      </div>
    </div>
  );
}
