"use client";

import { Copy, Check, X } from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  url: string;
  onClose: () => void;
  onCopy: () => void;
  copied: boolean;
}

export default function InviteModal({
  isOpen,
  url,
  onClose,
  onCopy,
  copied,
}: InviteModalProps) {
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
          <h3 className="text-xl font-bold text-white">Share Your Wrapped Wall</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-2">
            Share this URL with your friends:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm font-mono"
            />
            <button
              onClick={onCopy}
              className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-lg text-white font-bold transition-all flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

