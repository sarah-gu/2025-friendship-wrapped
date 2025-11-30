"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { signInWithGoogle } from "@/app/api/actions/auth/signin-action";

export default function SignInButton() {
  const [nameInput, setNameInput] = useState("");

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signInWithGoogle();
  };

  return (
    <form onSubmit={handleSignIn} className="w-full max-w-sm">
      <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 shadow-2xl shadow-purple-900/50 transform transition-all hover:scale-[1.02]">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Your Name"
          className="flex-1 bg-transparent border-none px-4 py-3 text-white placeholder-slate-400 focus:outline-none font-medium text-lg"
          onKeyDown={(e) => {
            if (e.key === "Enter" && nameInput.trim()) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button
          type="submit"
          disabled={!nameInput.trim()}
          className="bg-white text-black hover:bg-slate-200 font-bold p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight size={24} />
        </button>
      </div>
    </form>
  );
}
