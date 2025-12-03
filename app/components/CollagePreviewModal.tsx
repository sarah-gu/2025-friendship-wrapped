"use client";

import React from "react";
import Image from "next/image";
import { X, Download } from "lucide-react";

interface CollagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageBlob: Blob | null;
  filename: string;
}

const CollagePreviewModal: React.FC<CollagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageBlob,
  filename,
}) => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob);
      setImageUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [imageBlob]);

  const handleDownload = () => {
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="relative bg-slate-900 w-full max-w-2xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-black text-white">
            Collage Preview
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Preview Image */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide flex items-center justify-center bg-black relative">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt="Collage preview"
              width={1080}
              height={1080}
              className="max-w-full max-h-[60vh] w-auto h-auto object-contain"
              unoptimized
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-slate-900">
          <button
            onClick={handleDownload}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-indigo-600 rounded-2xl font-bold text-white text-sm md:text-lg shadow-lg shadow-pink-900/20 hover:shadow-pink-900/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Save to Device
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollagePreviewModal;
