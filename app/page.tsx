import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignInButton from "./components/SignInButton";

export default async function Home() {
  const session = await auth();

  // If user is signed in, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden font-sans">
      {/* Vibrant Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 animate-gradient-xy opacity-40"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-pink-500/30 rounded-full blur-[100px] animate-float"></div>
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-[100px] animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="z-10 flex-1 flex flex-col justify-center items-center px-6 max-w-2xl mx-auto w-full text-center">
        <div className="mb-8 relative inline-block">
          <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-lg blur opacity-75"></div>
          <span className="relative px-4 py-1 bg-black rounded-lg text-sm font-bold uppercase tracking-widest text-white border border-white/10">
            End of Year Recap
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-6 drop-shadow-2xl">
          2025 <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
            Friendships
          </span>{" "}
          <br />
          Wrapped.
        </h1>

        <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed max-w-lg mx-auto mb-12">
          Share a link, let friends drop one photo and a short memory, then get
          a &ldquo;year in friendships&rdquo; you can post or keep.
        </p>

        <SignInButton />
      </div>

      <div className="z-10 py-6 text-center text-slate-500 text-sm font-medium">
        Built by sgu • 2025
      </div>
    </div>
  );
}
