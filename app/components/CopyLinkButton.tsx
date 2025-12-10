"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { handleCopyUrl } from "@/app/utils/auth";
import InviteModal from "./InviteModal";

interface CopyLinkButtonProps {
  slug: string;
  hostName?: string;
  year?: number;
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  onCopied?: () => void;
}

export default function CopyLinkButton({
  slug,
  hostName,
  year,
  variant = "primary",
  size = "md",
  showText = true,
  onCopied,
}: CopyLinkButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const wrappedUrl = slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/w/${slug}`
    : "";

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleCopy = async () => {
    await handleCopyUrl(wrappedUrl, setCopied, hostName, year);
    if (onCopied) {
      onCopied();
    }
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setCopied(false);
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-pink-500/20",
    ghost:
      "bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium",
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 ${sizeClasses[size]} ${variantClasses[variant]} rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed [.mobile-menu_&]:px-4 [.mobile-menu_&]:py-2 [.mobile-menu_&]:text-sm [.mobile-menu_&]:font-medium [.mobile-menu_&]:text-white [.mobile-menu_&]:hover:bg-white/10 [.mobile-menu_&]:transition-colors [.mobile-menu_&]:rounded-none [.mobile-menu_&]:border-none [.mobile-menu_&]:bg-transparent [.mobile-menu_&]:shadow-none`}
      >
        <Copy size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
        {showText && <span>Copy link</span>}
      </button>

      <InviteModal
        isOpen={isModalOpen}
        url={wrappedUrl}
        onClose={handleClose}
        onCopy={handleCopy}
        copied={copied}
      />
    </>
  );
}
