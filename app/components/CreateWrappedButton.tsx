"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { signInWithGoogle } from "@/app/api/actions/auth/signin-action";

export default function CreateWrappedButton() {
  const handleClick = async () => {
    // Sign in with Google (same as main screen)
    await signInWithGoogle();
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm text-white shadow-[0_10px_40px_-10px_rgba(236,72,153,0.5)] border border-white/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 md:gap-2 [.mobile-menu_&]:px-4 [.mobile-menu_&]:py-2 [.mobile-menu_&]:text-sm [.mobile-menu_&]:font-medium [.mobile-menu_&]:text-white [.mobile-menu_&]:hover:bg-white/10 [.mobile-menu_&]:transition-colors [.mobile-menu_&]:rounded-none [.mobile-menu_&]:border-none [.mobile-menu_&]:bg-transparent [.mobile-menu_&]:shadow-none [.mobile-menu_&]:flex [.mobile-menu_&]:items-center [.mobile-menu_&]:gap-2 [.mobile-menu_&]:hover:scale-100 [.mobile-menu_&]:active:scale-100"
    >
      <span className="hidden sm:inline">Get My 2025 Wrapped</span>
      <span className="sm:hidden">Get Wrapped</span>
      <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
    </button>
  );
}
