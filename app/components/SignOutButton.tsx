"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { handleSignOut } from "@/app/utils/auth";

export default function SignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => handleSignOut(router)}
      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
      aria-label="Sign out"
    >
      <LogOut size={18} />
    </button>
  );
}

