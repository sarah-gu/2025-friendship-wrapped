"use client";

import { ArrowRight } from "lucide-react";
import { signInWithGoogle } from "@/app/api/actions/auth/signin-action";

export default function SignInButton() {
  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <button
      onClick={handleSignIn}
      className="glass-panel px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-purple-900/50 transform transition-all hover:scale-[1.02] bg-white text-black hover:bg-slate-200 font-bold text-lg"
    >
      <span>Get Started</span>
      <ArrowRight size={24} />
    </button>
  );
}
