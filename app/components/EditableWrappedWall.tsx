"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WrappedTheme } from "@/app/generated/prisma/enums";
import { User, Edit2, Save } from "lucide-react";
import MemoryGrid from "./MemoryGrid";
import InviteButton from "./InviteButton";
import SignOutButton from "./SignOutButton";
import type { Memory } from "@/app/types";
import type { WrappedGetPayload } from "@/app/generated/prisma/models/Wrapped";

const themes = [
  { value: WrappedTheme.SPARKLY, label: "Sparkly" },
  { value: WrappedTheme.FILM, label: "Film" },
  { value: WrappedTheme.MINIMAL, label: "Minimal" },
  { value: WrappedTheme.Y2K, label: "Y2K" },
  { value: WrappedTheme.CHAOTIC, label: "Chaotic" },
  { value: WrappedTheme.SOFT, label: "Soft" },
];

type WrappedWithSubmissions = WrappedGetPayload<{
  include: {
    submissions: true;
  };
}>;

interface EditableWrappedWallProps {
  ownerName: string;
  wrapped?: WrappedWithSubmissions;
}

export default function EditableWrappedWall({
  ownerName,
  wrapped,
}: EditableWrappedWallProps) {
  const router = useRouter();
  const isEditing = !!wrapped;

  // Initialize state from wrapped if provided, otherwise use defaults
  const [title, setTitle] = useState(wrapped?.title || "The Year In Review");
  const [hostName, setHostName] = useState(wrapped?.hostName || ownerName);
  const [theme, setTheme] = useState<WrappedTheme>(
    wrapped?.theme || WrappedTheme.SPARKLY
  );
  const [description, setDescription] = useState(wrapped?.description || "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    wrapped?.coverImageUrl || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingHostName, setIsEditingHostName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const canSubmit = !!title && !!hostName;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/actions/wrapped/${wrapped.id}`
        : "/api/actions/wrapped";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          hostName,
          year: wrapped?.year || new Date().getFullYear(),
          theme,
          description: description || null,
          coverImageUrl: coverImageUrl || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `Failed to ${isEditing ? "update" : "create"} wrapped`
        );
      }

      // Reset submitting state
      setIsSubmitting(false);
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} wrapped:`,
        error
      );
      setIsSubmitting(false);
      alert(
        `Failed to ${
          isEditing ? "update" : "create"
        } wrapped. Please try again.`
      );
    }
  };

  const memories: Memory[] = wrapped?.submissions || [];
  const currentYear = wrapped?.year || new Date().getFullYear();

  return (
    <>
      {/* Header Content */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg shadow-pink-500/20">
                {currentYear.toString().slice(-2)}
              </div>
              <div>
                <h1 className="font-bold text-white text-lg leading-none tracking-tight">
                  Friendships
                </h1>
                <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
                  Wrapped
                </p>
              </div>
              {
                <div className="relative inline-block ml-4">
                  <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-lg blur opacity-75"></div>
                  <span className="relative px-4 py-1 bg-black rounded-lg text-sm font-bold uppercase tracking-widest text-white border border-white/10">
                    {isEditing
                      ? "Edit Your Wrapped Wall"
                      : "Create Your Wrapped Wall"}
                  </span>
                </div>
              }
            </div>

            <div className="flex gap-3 items-center">
              {isEditing && <InviteButton slug={wrapped?.slug} />}

              <button
                type="submit"
                form="onboarding-form"
                disabled={isSubmitting || !canSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-full text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span className="hidden sm:inline">
                  {isSubmitting
                    ? isEditing
                      ? "Saving..."
                      : "Creating..."
                    : isEditing
                    ? "Save Changes"
                    : "Create Wall"}
                </span>
              </button>

              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <form
        id="onboarding-form"
        onSubmit={handleSubmit}
        className="min-h-screen bg-black text-slate-100 flex flex-col font-sans relative"
      >
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-900/10 rounded-full blur-[120px]"></div>
        </div>

        {/* Main Content */}
        <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full pt-24 px-4 pb-32">
          {/* Intro Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-2 text-pink-400 text-sm font-bold uppercase tracking-wider mb-2">
                <User size={14} />
                {isEditingHostName ? (
                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    onBlur={() => setIsEditingHostName(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsEditingHostName(false);
                      }
                    }}
                    placeholder={hostName}
                    required
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => setIsEditingHostName(true)}
                    className="cursor-pointer hover:text-pink-300 transition-colors flex items-center gap-1 group"
                  >
                    {hostName || "Your Name"}
                    {!hostName && <Edit2 size={12} />}
                    &apos;s Circle
                  </span>
                )}
              </div>
              {isEditingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsEditingTitle(false);
                    }
                  }}
                  placeholder={`e.g., ${hostName}'s 2025 Friendships Wrapped`}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-4xl md:text-5xl font-black"
                  autoFocus
                />
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className="text-4xl md:text-5xl font-black text-white tracking-tight cursor-pointer hover:text-slate-300 transition-colors flex items-center gap-2 group"
                >
                  {title}
                  {(title === "The Year In Review" || isEditing) && (
                    <Edit2
                      size={20}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </h2>
              )}
              {isEditingDescription ? (
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => setIsEditingDescription(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsEditingDescription(false);
                    }
                  }}
                  placeholder="A short description of your friendship wrapped..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-medium leading-relaxed mt-4"
                  autoFocus
                />
              ) : (
                <p
                  onClick={() => setIsEditingDescription(true)}
                  className="text-slate-300 text-lg font-medium leading-relaxed mt-4 cursor-pointer hover:text-slate-200 transition-colors flex items-center gap-2 group"
                >
                  {description || "Click to add description"}
                  {!description && (
                    <Edit2
                      size={16}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-white">
                {memories.length}
              </p>
              <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">
                Memories Dropped
              </p>
            </div>
          </div>

          {/* Theme Selector */}
          {/* <div className="mb-8">
          <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider">
            Theme
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as WrappedTheme)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-black"
          >
            {themes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div> */}

          {/* Grid */}
          <MemoryGrid memories={memories} />
        </main>
      </form>
    </>
  );
}
