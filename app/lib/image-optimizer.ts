/**
 * Client-side image optimization utility using HTML5 Canvas.
 * Resizes images exceeding maxWidth/maxHeight and compresses quality to reduce upload payload.
 *
 * @param file Original File object
 * @param maxWidth Max width in pixels (default 1920)
 * @param maxHeight Max height in pixels (default 1920)
 * @param quality Image compression quality from 0.1 to 1.0 (default 0.82)
 * @returns Promise<File> Optimized File object
 */
export async function optimizeImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.82
): Promise<File> {
  // SVG, GIF, or non-image files bypass canvas compression
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down dimensions if exceeding max limits while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return resolve(file);
      }

      // Render image on canvas with high quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output MIME type (use JPEG for JPG/PNG or WebP where supported)
      const outputType = file.type === "image/png" ? "image/jpeg" : file.type;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }

          // Return newly compressed File
          const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
            type: outputType,
            lastModified: Date.now(),
          });

          resolve(optimizedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback to original file if loading fails
      resolve(file);
    };

    img.src = objectUrl;
  });
}
