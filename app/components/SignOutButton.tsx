"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { handleSignOut } from "@/app/utils/auth";

export default function SignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => handleSignOut(router)}
      className="flex items-center gap-2 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all md:p-2 [.mobile-menu_&]:px-4 [.mobile-menu_&]:py-2 [.mobile-menu_&]:text-sm [.mobile-menu_&]:font-medium [.mobile-menu_&]:text-white [.mobile-menu_&]:hover:bg-white/10 [.mobile-menu_&]:transition-colors [.mobile-menu_&]:rounded-none [.mobile-menu_&]:border-none [.mobile-menu_&]:bg-transparent [.mobile-menu_&]:shadow-none"
      aria-label="Sign out"
    >
      <LogOut size={18} className="[.mobile-menu_&]:w-4 [.mobile-menu_&]:h-4" />
      <span className="hidden [.mobile-menu_&]:inline">Sign Out</span>
    </button>
  );
}
