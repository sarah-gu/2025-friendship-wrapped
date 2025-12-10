import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Loader2,
  Sparkles,
  RefreshCcw,
  ArrowRight,
} from "lucide-react";
import { resizeImage, convertHeicToJpeg } from "../utils/imageUtils";
import { getRandomTaglines } from "../utils/prompts";
import { useRouter } from "next/navigation";
import CreateWrappedPromptModal from "./CreateWrappedPromptModal";

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  wrappedId: string;
}

const AddMemoryModal: React.FC<AddMemoryModalProps> = ({
  isOpen,
  onClose,
  wrappedId,
}) => {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [caption, setCaption] = useState("");
  const [friendName, setFriendName] = useState("");
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateWrappedModal, setShowCreateWrappedModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setImageFile(null);
      setPreview(null);
      setCaption("");
      setSelectedPrompt("");
      setFriendName("");
      loadPrompts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadPrompts = () => {
    setLoadingPrompts(true);
    // Get 6 random unique taglines
    const newPrompts = getRandomTaglines(6, false);
    setPrompts(newPrompts);
    setLoadingPrompts(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        let fileToProcess = file;

        // Check if file is HEIC/HEIF and convert it
        const isHeic =
          file.type === "image/heic" ||
          file.type === "image/heif" ||
          file.name.toLowerCase().endsWith(".heic") ||
          file.name.toLowerCase().endsWith(".heif");

        if (isHeic) {
          // Convert HEIC to JPEG
          fileToProcess = await convertHeicToJpeg(file);
        }

        // Resize the image
        const resizedFile = await resizeImage(fileToProcess, 1200, 1200, 0.8);
        setImageFile(resizedFile);

        // Create preview using FileReader
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(resizedFile);

        setStep(2);
      } catch (err) {
        console.error("Image processing failed", err);
        alert(
          err instanceof Error
            ? err.message
            : "Failed to process image. Please try again."
        );
      }
    }
  };

  const handleSubmit = async () => {
    if (imageFile && selectedPrompt && caption) {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("wrappedId", wrappedId);
        formData.append("mainPrompt", selectedPrompt);
        formData.append("mainText", caption);
        if (friendName.trim()) {
          formData.append("friendName", friendName.trim());
        }

        const response = await fetch("/api/actions/submissions", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to submit memory");
        }

        const data = await response.json();

        // If user is not authenticated, show the create wrapped prompt modal
        if (!data.isAuthenticated) {
          setIsSubmitting(false);
          setShowCreateWrappedModal(true);
        } else {
          // Refresh the page to show the new submission
          setIsSubmitting(false);
          router.refresh();
          onClose();
        }
      } catch (error) {
        console.error("Error submitting memory:", error);
        alert("Failed to submit memory. Please try again.");
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="relative bg-slate-900 w-full max-w-md rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-float"
        style={{ animationDuration: "0s" }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-black text-white">
            {step === 1 ? "Drop a Photo" : "Add the Vibe"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {step === 1 ? (
            <div className="h-80 border-2 border-dashed border-slate-700 rounded-3xl hover:border-pink-500 hover:bg-slate-800/30 transition-all cursor-pointer relative group flex flex-col items-center justify-center text-center p-8">
              <input
                type="file"
                accept="image/*,.heic,.heif"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-pink-600 transition-all duration-300">
                <Upload
                  size={32}
                  className="text-pink-500 group-hover:text-white"
                />
              </div>
              <p className="text-base md:text-xl font-bold text-white mb-2">
                Tap to upload
              </p>
              <p className="text-slate-500 text-sm">PNG, JPG, HEIC up to 5MB</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Image Preview */}
              <div className="w-full h-56 bg-black rounded-3xl overflow-hidden relative shadow-lg">
                {preview && (
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                )}
                <button
                  onClick={() => setStep(1)}
                  className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold hover:bg-black/70 border border-white/10"
                >
                  Change Photo
                </button>
              </div>

              {/* Prompt Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">
                    Choose a Category
                  </label>
                  <button
                    onClick={loadPrompts}
                    disabled={loadingPrompts}
                    className="text-xs text-pink-400 font-bold flex items-center gap-1 hover:text-pink-300"
                  >
                    <RefreshCcw
                      size={12}
                      className={loadingPrompts ? "animate-spin" : ""}
                    />{" "}
                    REFRESH
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {loadingPrompts ? (
                    <span className="text-xs text-slate-500 animate-pulse">
                      Summoning ideas...
                    </span>
                  ) : (
                    prompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPrompt(p)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          selectedPrompt === p
                            ? "bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-900/40 scale-105"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wide mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="drop your @ or stay mysterious ✨"
                  className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors placeholder-slate-600"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wide mb-2">
                  Memory
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What was happening? (e.g., 'We thought we could finish the pizza... we could not.')"
                  className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors h-28 resize-none placeholder-slate-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
          <div className="p-6 border-t border-white/5 bg-slate-900">
            <button
              onClick={handleSubmit}
              disabled={!selectedPrompt || !caption || isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-indigo-600 rounded-2xl font-bold text-white text-sm md:text-lg shadow-lg shadow-pink-900/20 hover:shadow-pink-900/40 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  Add to Wrapped <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Create Wrapped Prompt Modal */}
      <CreateWrappedPromptModal
        isOpen={showCreateWrappedModal}
        onClose={() => {
          setShowCreateWrappedModal(false);
          // Refresh the page to show the new submission
          router.refresh();
          onClose();
        }}
      />
    </div>
  );
};

export default AddMemoryModal;
