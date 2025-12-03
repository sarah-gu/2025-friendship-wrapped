export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Converts HEIC/HEIF images to JPEG format
 * @param file - The HEIC file to convert
 * @returns A Promise that resolves to a JPEG File
 */
export const convertHeicToJpeg = async (file: File): Promise<File> => {
  // Dynamically import heic2any to avoid SSR issues
  const heic2any =
    (await import("heic2any")).default || (await import("heic2any"));

  try {
    // Convert HEIC to JPEG
    // heic2any accepts a blob and returns a blob or array of blobs
    const convertedBlob = (await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    })) as Blob | Blob[];

    // heic2any returns an array, get the first item
    const blob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    if (!blob) {
      throw new Error("Conversion returned no blob");
    }

    // Create a new File object with JPEG type
    const jpegFile = new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, ".jpg"),
      {
        type: "image/jpeg",
        lastModified: Date.now(),
      }
    );

    return jpegFile;
  } catch (error) {
    console.error("HEIC conversion failed:", error);
    throw new Error(
      "Failed to convert HEIC image. Please try a different format."
    );
  }
};

export const resizeImage = async (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error("Failed to resize image"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
