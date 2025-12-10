"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WrappedTheme } from "@/app/generated/prisma/enums";
import {
  User,
  Edit2,
  Save,
  Share2,
  Compass,
  Sparkles,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import CopyLinkButton from "./CopyLinkButton";
import CollagePreviewModal from "./CollagePreviewModal";
import MemoryDetailModal from "./MemoryDetailModal";
import WrappedWallHeader from "./WrappedWallHeader";
import WrappedWallLayout from "./WrappedWallLayout";
import WrappedWall from "./WrappedWall";
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
  wrapped: WrappedWithSubmissions;
  user?: {
    name?: string | null;
    image?: string | null;
    email?: string | null;
  } | null;
}

export default function EditableWrappedWall({
  ownerName,
  wrapped,
  user = null,
}: EditableWrappedWallProps) {
  const router = useRouter();
  const isEditing = true; // wrapped is always provided now

  // Initialize state from wrapped
  const [title, setTitle] = useState(wrapped.title);
  const [hostName, setHostName] = useState(wrapped.hostName || ownerName);
  const [theme, setTheme] = useState<WrappedTheme>(
    wrapped.theme || WrappedTheme.SPARKLY
  );
  const [description, setDescription] = useState(wrapped.description || "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    wrapped.coverImageUrl || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingHostName, setIsEditingHostName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isGeneratingCollage, setIsGeneratingCollage] = useState(false);
  const [collageBlob, setCollageBlob] = useState<Blob | null>(null);
  const [showCollagePreview, setShowCollagePreview] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Store initial values to detect changes
  const [initialValues, setInitialValues] = useState({
    title: wrapped.title,
    hostName: wrapped.hostName || ownerName,
    theme: wrapped.theme || WrappedTheme.SPARKLY,
    description: wrapped.description || "",
    coverImageUrl: wrapped.coverImageUrl || "",
  });

  // Update initial values when wrapped changes
  useEffect(() => {
    setInitialValues({
      title: wrapped.title,
      hostName: wrapped.hostName,
      theme: wrapped.theme,
      description: wrapped.description || "",
      coverImageUrl: wrapped.coverImageUrl || "",
    });
  }, [wrapped, ownerName]);

  // Check if there are any changes
  const hasChanges =
    title !== initialValues.title ||
    hostName !== initialValues.hostName ||
    theme !== initialValues.theme ||
    description !== initialValues.description ||
    coverImageUrl !== initialValues.coverImageUrl;

  const canSubmit = !!title && !!hostName && hasChanges;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/actions/wrapped/${wrapped.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          hostName,
          year: wrapped.year || new Date().getFullYear(),
          theme,
          description: description || null,
          coverImageUrl: coverImageUrl || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update wrapped");
      }

      // Reset submitting state
      setIsSubmitting(false);

      // Update initial values to reflect saved state
      setInitialValues({
        title,
        hostName,
        theme,
        description,
        coverImageUrl,
      });

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Error updating wrapped:", error);
      setIsSubmitting(false);
      alert("Failed to update wrapped. Please try again.");
    }
  };

  const memories: Memory[] = wrapped.submissions || [];
  const currentYear = wrapped.year || new Date().getFullYear();

  const handleExportCollage = async () => {
    if (memories.length === 0) {
      alert("Add some memories first before exporting!");
      return;
    }

    setIsGeneratingCollage(true);
    try {
      const wrappedUrl = wrapped.slug
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

  const editableTitle = isEditingTitle ? (
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
      placeholder={DEFAULT_WRAPPED_TITLES[0]}
      required
      data-wall-title
      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xl md:text-3xl lg:text-4xl font-black"
      autoFocus
    />
  ) : (
    <h2
      onClick={() => setIsEditingTitle(true)}
      data-wall-title
      className="text-xl md:text-3xl lg:text-4xl font-black text-white tracking-tight cursor-pointer hover:text-slate-300 transition-colors flex items-center gap-2 group"
    >
      {title}
      {(DEFAULT_WRAPPED_TITLES.includes(title) || isEditing) && (
        <Edit2 size={20} className="text-slate-400" />
      )}
    </h2>
  );

  const editableDescription = isEditingDescription ? (
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
      placeholder="drop the lore, spill the tea, share the vibes"
      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base font-medium leading-relaxed mt-3"
      autoFocus
    />
  ) : (
    <p
      onClick={() => setIsEditingDescription(true)}
      className="text-slate-300 text-sm md:text-base font-medium leading-relaxed mt-3 cursor-pointer hover:text-slate-200 transition-colors flex items-center gap-2 group"
    >
      {description || "drop the lore, spill the tea, share the vibes"}
      <Edit2 size={16} className="text-slate-400" />
    </p>
  );

  const editableHostName = (
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
  );

  // Create a preview wrapped object from current state
  const previewWrapped: WrappedWithSubmissions | undefined =
    isPreviewMode && wrapped
      ? ({
          ...wrapped,
          title,
          hostName,
          description: description || null,
          theme,
          coverImageUrl: coverImageUrl || null,
          submissions: memories,
        } as WrappedWithSubmissions)
      : undefined;

  // If in preview mode, render WrappedWall with exit button
  if (isPreviewMode && previewWrapped && wrapped) {
    return (
      <div className="relative">
        {/* Exit Preview Button - Fixed bottom right */}
        <button
          onClick={() => setIsPreviewMode(false)}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-full text-sm font-bold text-white shadow-lg shadow-pink-500/30 border border-white/20 transition-all"
        >
          <EyeOff size={18} />
          <span>Exit Preview</span>
        </button>
        <WrappedWall
          wrapped={previewWrapped}
          ownerName={hostName}
          user={user}
        />
      </div>
    );
  }

  return (
    <>
      <WrappedWallHeader
        year={currentYear}
        user={user}
        slug={wrapped.slug}
        rightContent={
          <>
            <CopyLinkButton
              slug={wrapped.slug}
              hostName={user?.name || ""}
              year={currentYear}
              variant="primary"
              size="md"
              showText={true}
            />
            {isEditing && wrapped.slug && memories.length && (
              <button
                onClick={handleExportCollage}
                disabled={isGeneratingCollage || memories.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed [.mobile-menu_&]:px-4 [.mobile-menu_&]:py-2 [.mobile-menu_&]:text-sm [.mobile-menu_&]:font-medium [.mobile-menu_&]:text-white [.mobile-menu_&]:hover:bg-white/10 [.mobile-menu_&]:transition-colors [.mobile-menu_&]:rounded-none [.mobile-menu_&]:border-none [.mobile-menu_&]:bg-transparent [.mobile-menu_&]:shadow-none"
                title="Export collage for Instagram"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline [.mobile-menu_&]:inline">
                  {isGeneratingCollage ? "Generating..." : "Post"}
                </span>
              </button>
            )}
          </>
        }
      />

      <form
        id="onboarding-form"
        onSubmit={handleSubmit}
        className="min-h-screen bg-black text-slate-100 flex flex-col font-sans relative"
      >
        {/* Preview Button - Fixed bottom right */}
        {isEditing && (
          <button
            onClick={() => setIsPreviewMode(true)}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-full text-sm font-bold text-white shadow-lg shadow-pink-500/30 border border-white/20 transition-all"
          >
            <Eye size={18} />
            <span>Preview</span>
          </button>
        )}
        {/* Save button at bottom when there are unsaved changes */}
        {isEditing && hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none">
            <div className="max-w-7xl mx-auto flex justify-center pointer-events-auto">
              <button
                type="submit"
                form="onboarding-form"
                disabled={isSubmitting || !canSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white rounded-full text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/20"
              >
                <Save size={18} />
                <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        )}
        <WrappedWallLayout
          memories={memories}
          isEditable={true}
          onMemoryClick={(memory) => {
            setSelectedMemory(memory);
            setIsDetailModalOpen(true);
          }}
          hostName={hostName}
          emptyState={
            memories.length === 0 && isEditing ? (
              <div className="relative flex flex-col items-center justify-center py-8 md:py-16 text-center">
                {/* Ghost grid background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto h-full">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white/5 rounded-lg border border-white/10 aspect-[4/5]"
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500/20 to-indigo-600/20 rounded-full flex items-center justify-center mb-6 border border-pink-500/30 mx-auto">
                    <Sparkles className="text-pink-400" size={32} />
                  </div>

                  <h3 className="text-xl md:text-2xl font-black text-white mb-3">
                    time to fill this wall! ✨
                  </h3>

                  <p className="text-slate-300 text-sm md:text-base font-medium max-w-lg mx-auto mb-6 leading-relaxed">
                    Share this wall link in your group chat and let your besties
                    upload their fave pics. The more memories you drop, the
                    better the vibes! 🎉
                  </p>

                  {/* Primary CTA Section */}
                  {wrapped.slug && (
                    <div className="mb-6 flex flex-col items-center">
                      <p className="text-slate-400 text-xs md:text-sm font-medium mb-3">
                        Share this wall link so friends can drop photos:
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                        <CopyLinkButton
                          slug={wrapped.slug}
                          hostName={hostName}
                          year={currentYear}
                          variant="primary"
                          size="lg"
                          onCopied={() => setLinkCopied(true)}
                        />
                        <Link
                          href="/explore"
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium text-white transition-all"
                        >
                          <Compass size={16} />
                          <span>Browse example walls</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Progress nudge after copying */}
                  {linkCopied && (
                    <div className="mb-4 animate-fade-in text-center">
                      <p className="text-pink-400 text-sm font-medium">
                        Now sit back and wait for the chaos 📸
                      </p>
                    </div>
                  )}

                  {/* Education hint */}
                  <p className="text-slate-500 text-xs mt-4">
                    Friends don&apos;t need an account to drop photos
                  </p>
                </div>
              </div>
            ) : undefined
          }
        >
          <div className="flex flex-col gap-6 mb-12 border-b border-white/10 pb-8">
            {/* Header section */}
            <div className="flex flex-row items-end justify-between gap-6">
              <div className="space-y-2">
                {editableHostName}
                {editableTitle}
                {editableDescription}
              </div>
              <div className="text-right">
                <p className="font-black text-white">{memories.length}</p>
                <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">
                  Memories Dropped
                </p>
              </div>
            </div>

            {
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                    1
                  </div>
                  <span className="text-white text-sm font-medium">
                    Share this link with your friends
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                    2
                  </div>
                  <span className="text-white text-sm font-medium">
                    Everyone drops their favorite pics
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                    3
                  </div>
                  <span className="text-white text-sm font-medium">
                    Unlock your 2025 Friendship Wrapped collage to post ✨
                  </span>
                </div>
              </div>
            }
          </div>
        </WrappedWallLayout>
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
