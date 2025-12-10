"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Menu, X, User as UserIcon } from "lucide-react";
import Image from "next/image";
import SignOutButton from "./SignOutButton";
import CreateWrappedButton from "./CreateWrappedButton";
import CopyLinkButton from "./CopyLinkButton";

interface WrappedWallHeaderProps {
  year: number;
  leftContent?: React.ReactNode;
  rightContent: React.ReactNode;
  showExploreHint?: boolean;
  slug?: string;
  user?: {
    name?: string | null;
    image?: string | null;
    email?: string | null;
  } | null;
  exploreButton?: React.ReactNode;
}

export default function WrappedWallHeader({
  year,
  leftContent,
  rightContent,
  slug,
  showExploreHint = false,
  user = null,
  exploreButton,
}: WrappedWallHeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Logo and left content */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className={`flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity ${
                showExploreHint ? "group relative" : ""
              }`}
              title="Homepage"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-xs md:text-sm shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                {year.toString().slice(-2)}
              </div>
              <div>
                <h1 className="font-bold text-white text-sm md:text-lg leading-none tracking-tight">
                  Friendships
                </h1>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium tracking-widest uppercase">
                  Wrapped
                </p>
              </div>
            </Link>
            {leftContent}
          </div>

          {/* Right side - Desktop view */}
          <div className="hidden md:flex gap-3 items-center">
            {/* Explore button */}
            {exploreButton || (
              <Link
                href="/explore"
                className="flex items-center gap-2 text-white text-sm font-medium hover:text-pink-400 transition-colors"
              >
                <Compass size={16} />
                <span>Explore</span>
              </Link>
            )}

            {rightContent}

            {/* User indicator - Far right */}
            {user ? (
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => router.push("/dashboard")}
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <UserIcon size={14} className="text-white" />
                  </div>
                )}
                <span className="text-white text-sm font-medium">
                  {user.name || "You"}
                </span>
              </div>
            ) : (
              <CreateWrappedButton />
            )}
            {user && <SignOutButton />}
          </div>

          {/* Mobile menu button and dropdown */}
          <div className="md:hidden relative flex flex-row" ref={menuRef}>
            {rightContent}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-all"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile dropdown menu */}
            {isMobileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-2 z-50 w-auto">
                <div className="flex flex-col gap-1">
                  {/* Explore button - Mobile */}
                  {exploreButton || (
                    <Link
                      href="/explore"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium hover:bg-white/10 transition-colors whitespace-nowrap"
                    >
                      <Compass size={16} />
                      <span>Explore</span>
                    </Link>
                  )}

                  {/* User indicator - Mobile */}
                  {user && (
                    <div
                      className="flex items-center gap-2 px-4 py-2 border-t border-white/10 mt-1 cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => {
                        router.push("/dashboard");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || "User"}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-5 h-5 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <UserIcon size={12} className="text-white" />
                        </div>
                      )}
                      <span className="text-white text-xs font-medium">
                        {user.name || "You"}
                      </span>
                      {user && <SignOutButton />}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
