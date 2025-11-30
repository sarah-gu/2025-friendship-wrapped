"use client";

import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/app/api/actions/auth/signin-action";

interface CreateWrappedButtonProps {
  isAuthenticated: boolean;
}

export default function CreateWrappedButton({
  isAuthenticated,
}: CreateWrappedButtonProps) {
  const router = useRouter();

  const handleClick = async () => {
    if (isAuthenticated) {
      // Redirect to dashboard
      router.push("/dashboard");
    } else {
      // Sign in with Google (same as main screen)
      await signInWithGoogle();
    }
  };

  return (
    <div className="relative inline-block">
      <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-lg blur opacity-75"></div>
      <button
        onClick={handleClick}
        className="relative px-4 py-2 bg-black rounded-lg text-sm font-bold uppercase tracking-widest text-white border border-white/10 transition-all hover:scale-[1.02] active:scale-95"
      >
        {isAuthenticated ? "See My Wrapped Wall" : "Create Wrapped Wall"}
      </button>
    </div>
  );
}
