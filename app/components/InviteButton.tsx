"use client";

import { useState, useEffect } from "react";
import { Share2 } from "lucide-react";
import InviteModal from "./InviteModal";
import { handleCopyUrl } from "@/app/utils/auth";

interface InviteButtonProps {
  slug: string | undefined;
  hostName?: string;
  year?: number;
  shouldAutoOpen?: boolean;
}

export default function InviteButton({
  slug,
  hostName,
  year,
  shouldAutoOpen = false,
}: InviteButtonProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-open modal if shouldAutoOpen prop is true
  useEffect(() => {
    if (shouldAutoOpen && slug) {
      setIsInviteModalOpen(true);
    }
  }, [shouldAutoOpen, slug]);

  const wrappedUrl = slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/w/${slug}`
    : "";

  if (!slug) return null;

  return (
    <>
      <button
        onClick={() => setIsInviteModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold text-white transition-all"
      >
        <Share2 size={16} />
        <span className="hidden sm:inline">Invite</span>
      </button>

      <InviteModal
        isOpen={isInviteModalOpen}
        url={wrappedUrl}
        onClose={() => setIsInviteModalOpen(false)}
        onCopy={() => handleCopyUrl(wrappedUrl, setCopied, hostName, year)}
        copied={copied}
      />
    </>
  );
}
