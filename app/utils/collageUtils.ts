/**
 * Creates an Instagram-ready collage from memory photos
 * Instagram Story format: 1080x1920px
 */

interface Memory {
  photoUrl: string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export async function createWrappedCollage(
  memories: Memory[],
  hostName: string,
  url: string
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Instagram Story dimensions (vertical)
  const CANVAS_WIDTH = 1080;
  const CANVAS_HEIGHT = 1920;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // No background - photos will fill the entire canvas

  if (memories.length === 0) {
    // Just show text if no memories
    const centerY = CANVAS_HEIGHT / 2;

    // Add text shadow for better visibility
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;

    // Draw host name above (smaller)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const displayName = hostName ? `${hostName}'s` : "";
    ctx.fillText(displayName, CANVAS_WIDTH / 2, centerY - 80);

    // Draw "2025 FRIENDS WRAPPED" below (bigger)
    ctx.font = "bold 112px system-ui, -apple-system, sans-serif";
    ctx.fillText("2025 WRAPPED", CANVAS_WIDTH / 2, centerY + 20);

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.font = "24px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(url, CANVAS_WIDTH - 40, CANVAS_HEIGHT - 40);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, "image/png");
    });
  }

  // Randomly select memories if we have more than the max
  const MAX_MEMORIES = 24; // Higher cap for Instagram Story format
  let selectedMemories = [...memories];

  if (memories.length > MAX_MEMORIES) {
    // Shuffle and take random selection
    selectedMemories = [...memories]
      .sort(() => Math.random() - 0.5)
      .slice(0, MAX_MEMORIES);
  }

  const memoryCount = selectedMemories.length;

  // Calculate grid layout based on number of memories
  // For vertical format, we can fit more rows
  let cols = 3;
  let rows = Math.ceil(memoryCount / cols);

  // Adjust for better layouts
  if (memoryCount <= 1) {
    cols = 1;
    rows = 1;
  } else if (memoryCount <= 2) {
    cols = 2;
    rows = 1;
  } else if (memoryCount <= 4) {
    cols = 2;
    rows = 2;
  } else if (memoryCount <= 6) {
    cols = 3;
    rows = 2;
  } else if (memoryCount <= 9) {
    cols = 3;
    rows = 3;
  } else if (memoryCount <= 12) {
    cols = 3;
    rows = 4;
  } else if (memoryCount <= 15) {
    cols = 3;
    rows = 5;
  } else if (memoryCount <= 18) {
    cols = 3;
    rows = 6;
  } else if (memoryCount <= 21) {
    cols = 3;
    rows = 7;
  } else {
    cols = 3;
    rows = 8; // Max 24 photos (3x8)
  }

  const padding = 0; // No padding for edge-to-edge photos
  const gap = 0; // No gaps between photos
  const availableWidth = CANVAS_WIDTH;
  const availableHeight = CANVAS_HEIGHT;
  const cellWidth = availableWidth / cols;
  const cellHeight = availableHeight / rows;

  // Load and draw images
  const images: HTMLImageElement[] = [];
  for (let i = 0; i < memoryCount; i++) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Image load timeout"));
        }, 10000); // 10 second timeout

        img.onload = () => {
          clearTimeout(timeout);
          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            images.push(img);
            resolve(img);
          } else {
            reject(new Error("Invalid image"));
          }
        };
        img.onerror = () => {
          clearTimeout(timeout);
          // Create a placeholder if image fails to load
          const placeholderCanvas = document.createElement("canvas");
          placeholderCanvas.width = 200;
          placeholderCanvas.height = 200;
          const placeholderCtx = placeholderCanvas.getContext("2d");
          if (placeholderCtx) {
            placeholderCtx.fillStyle = "#374151";
            placeholderCtx.fillRect(0, 0, 200, 200);
            placeholderCtx.fillStyle = "#9ca3af";
            placeholderCtx.font = "20px system-ui";
            placeholderCtx.textAlign = "center";
            placeholderCtx.textBaseline = "middle";
            placeholderCtx.fillText("Photo", 100, 100);
          }
          const placeholder = new Image();
          placeholder.onload = () => {
            images.push(placeholder);
            resolve(placeholder);
          };
          placeholder.onerror = reject;
          placeholder.src = placeholderCanvas.toDataURL();
        };
        img.src = selectedMemories[i].photoUrl;
      });
    } catch (error) {
      console.error(`Failed to load image ${i}:`, error);
      // Create a simple placeholder
      const placeholderCanvas = document.createElement("canvas");
      placeholderCanvas.width = 200;
      placeholderCanvas.height = 200;
      const placeholderCtx = placeholderCanvas.getContext("2d");
      if (placeholderCtx) {
        placeholderCtx.fillStyle = "#374151";
        placeholderCtx.fillRect(0, 0, 200, 200);
      }
      const placeholder = new Image();
      placeholder.src = placeholderCanvas.toDataURL();
      await new Promise((resolve) => {
        placeholder.onload = resolve;
      });
      images.push(placeholder);
    }
  }

  // Draw images in grid (no gaps, edge-to-edge)
  for (let i = 0; i < Math.min(images.length, memoryCount); i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = col * cellWidth;
    const y = row * cellHeight;

    // Draw image (fill entire cell, may crop to fit)
    const img = images[i];
    const imgAspect = img.width / img.height;
    const cellAspect = cellWidth / cellHeight;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = img.width;
    let sourceHeight = img.height;

    if (imgAspect > cellAspect) {
      // Image is wider - crop sides to fit
      sourceWidth = img.height * cellAspect;
      sourceX = (img.width - sourceWidth) / 2;
    } else {
      // Image is taller - crop top/bottom to fit
      sourceHeight = img.width / cellAspect;
      sourceY = (img.height - sourceHeight) / 2;
    }

    // Draw image cropped to fill cell
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      cellWidth,
      cellHeight
    );
  }

  // Add dark overlay gradient for text readability
  const overlayGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  overlayGradient.addColorStop(0, "rgba(0, 0, 0, 0.2)");
  overlayGradient.addColorStop(0.4, "rgba(0, 0, 0, 0.1)");
  overlayGradient.addColorStop(0.6, "rgba(0, 0, 0, 0.1)");
  overlayGradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");
  ctx.fillStyle = overlayGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Add host name and "2025 WRAPPED" text in the center (overlaying photos)
  const centerY = CANVAS_HEIGHT / 2; // Center of the vertical canvas
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Add text shadow for better visibility
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 5;

  // Draw host name above (smaller)
  if (hostName && hostName.length > 0) {
    ctx.font = "bold 64px system-ui, -apple-system, sans-serif";
    const displayName = `${hostName}'s`;
    ctx.fillText(displayName, CANVAS_WIDTH / 2, centerY - 80);
  }

  // Draw "2025 WRAPPED" in the center (bigger)
  ctx.font = "bold 112px system-ui, -apple-system, sans-serif";
  ctx.fillText("2025 WRAPPED", CANVAS_WIDTH / 2, centerY + 20);

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Add URL in bottom right (with background for readability)
  const urlPadding = 12;
  const urlX = CANVAS_WIDTH - 40;
  const urlY = CANVAS_HEIGHT - 40;
  ctx.font = "24px system-ui, -apple-system, sans-serif";
  const urlMetrics = ctx.measureText(url);
  const urlWidth = urlMetrics.width;
  const urlHeight = 30;

  // Draw background for URL
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(
    urlX - urlWidth - urlPadding,
    urlY - urlHeight,
    urlWidth + urlPadding * 2,
    urlHeight + urlPadding
  );

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(url, urlX, urlY);

  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        throw new Error("Failed to create blob");
      }
    }, "image/png");
  });
}
