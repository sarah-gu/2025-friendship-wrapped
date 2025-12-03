"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WrappedTheme } from "@/app/generated/prisma/enums";
import { User, Edit2, Save, Download } from "lucide-react";
import MemoryGrid from "./MemoryGrid";
import InviteButton from "./InviteButton";
import SignOutButton from "./SignOutButton";
import CollagePreviewModal from "./CollagePreviewModal";
import MemoryDetailModal from "./MemoryDetailModal";
import { getRandomDefaultTitle } from "@/app/utils/prompts";
import { DEFAULT_WRAPPED_TITLES } from "@/app/consts";
import { createWrappedCollage } from "@/app/utils/collageUtils";
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

  // Generate a random default title once (consistent across renders)
  const defaultTitle = useMemo(() => getRandomDefaultTitle(), []);

  // Initialize state from wrapped if provided, otherwise use defaults
  const [title, setTitle] = useState(wrapped?.title || defaultTitle);
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
  const [shouldShowInviteModal, setShouldShowInviteModal] = useState(false);
  const [isGeneratingCollage, setIsGeneratingCollage] = useState(false);
  const [collageBlob, setCollageBlob] = useState<Blob | null>(null);
  const [showCollagePreview, setShowCollagePreview] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Store initial values to detect changes
  const [initialValues, setInitialValues] = useState({
    title: wrapped?.title || defaultTitle,
    hostName: wrapped?.hostName || ownerName,
    theme: wrapped?.theme || WrappedTheme.SPARKLY,
    description: wrapped?.description || "",
    coverImageUrl: wrapped?.coverImageUrl || "",
  });

  // Update initial values when wrapped changes
  useEffect(() => {
    if (wrapped) {
      setInitialValues({
        title: wrapped.title,
        hostName: wrapped.hostName,
        theme: wrapped.theme,
        description: wrapped.description || "",
        coverImageUrl: wrapped.coverImageUrl || "",
      });
    }
  }, [wrapped, ownerName]);

  // Check if there are any changes (only when editing)
  const hasChanges = isEditing
    ? title !== initialValues.title ||
      hostName !== initialValues.hostName ||
      theme !== initialValues.theme ||
      description !== initialValues.description ||
      coverImageUrl !== initialValues.coverImageUrl
    : true; // Always allow submission when creating new

  const canSubmit = !!title && !!hostName && hasChanges;

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

      // Show invite modal after save
      setShouldShowInviteModal(true);

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

  const handleExportCollage = async () => {
    if (memories.length === 0) {
      alert("Add some memories first before exporting!");
      return;
    }

    setIsGeneratingCollage(true);
    try {
      const wrappedUrl = wrapped?.slug
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/w/${
            wrapped.slug
          }`
        : "";

      const blob = await createWrappedCollage(memories, hostName, wrappedUrl);
      setCollageBlob(blob);
      setShowCollagePreview(true);
    } catch (error) {
      console.error("Error generating collage:", error);
      alert("Failed to generate collage. Please try again.");
    } finally {
      setIsGeneratingCollage(false);
    }
  };

  return (
    <>
      {/* Header Content */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link
                href="/explore"
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-xs md:text-sm shadow-lg shadow-pink-500/20">
                  {currentYear.toString().slice(-2)}
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
              <div className="relative inline-block ml-2 md:ml-4">
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-lg blur opacity-75"></div>
                <span className="relative px-2 py-0.5 md:px-4 md:py-1 bg-black rounded-lg text-[10px] md:text-sm font-bold uppercase tracking-widest text-white border border-white/10">
                  <span className="md:hidden">
                    {isEditing ? "Edit" : "Create"}
                  </span>
                  <span className="hidden md:inline">
                    {isEditing
                      ? "Edit Your Wrapped Wall"
                      : "Create Your Wrapped Wall"}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              {isEditing && (
                <>
                  <InviteButton
                    slug={wrapped?.slug}
                    hostName={hostName}
                    year={currentYear}
                    shouldAutoOpen={shouldShowInviteModal}
                  />
                  <button
                    onClick={handleExportCollage}
                    disabled={isGeneratingCollage || memories.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Export collage for Instagram"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">
                      {isGeneratingCollage ? "Generating..." : "Share"}
                    </span>
                  </button>
                </>
              )}

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
        <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full pt-28 md:pt-24 px-4 pb-32">
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
                    <Edit2 size={12} className="text-pink-400/70" />
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
                  placeholder={defaultTitle}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-2xl md:text-4xl lg:text-5xl font-black"
                  autoFocus
                />
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tight cursor-pointer hover:text-slate-300 transition-colors flex items-center gap-2 group"
                >
                  {title}
                  {(DEFAULT_WRAPPED_TITLES.includes(title) || isEditing) && (
                    <Edit2 size={20} className="text-slate-400" />
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
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-lg font-medium leading-relaxed mt-4"
                  autoFocus
                />
              ) : (
                <p
                  onClick={() => setIsEditingDescription(true)}
                  className="text-slate-300 text-sm md:text-lg font-medium leading-relaxed mt-4 cursor-pointer hover:text-slate-200 transition-colors flex items-center gap-2 group"
                >
                  {description || "Click to add description"}
                  <Edit2 size={16} className="text-slate-400" />
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl md:text-4xl font-black text-white">
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
          <MemoryGrid
            memories={memories}
            isEditable={true}
            onMemoryClick={(memory) => {
              setSelectedMemory(memory);
              setIsDetailModalOpen(true);
            }}
          />
        </main>
      </form>

      {/* Collage Preview Modal */}
      <CollagePreviewModal
        isOpen={showCollagePreview}
        onClose={() => {
          setShowCollagePreview(false);
          setCollageBlob(null);
        }}
        imageBlob={collageBlob}
        filename={`friendship-wrapped-${currentYear}.png`}
      />

      {/* Memory Detail Modal */}
      <MemoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedMemory(null);
        }}
        memory={selectedMemory}
      />
    </>
  );
}
