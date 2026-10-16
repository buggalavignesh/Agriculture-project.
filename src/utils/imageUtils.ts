/**
 * Utility functions for client-side image handling, resizing and compression
 */

export interface ProcessedImage {
  base64: string;
  mimeType: string;
  width: number;
  height: number;
  fileSizeBytes: number;
}

export async function processAndCompressImage(
  file: File | Blob,
  maxDimension: number = 1024,
  quality: number = 0.85
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas 2D rendering context.'));
          return;
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const base64 = canvas.toDataURL(mimeType, quality);
        const approxBytes = Math.round((base64.length * 3) / 4);

        resolve({
          base64,
          mimeType,
          width,
          height,
          fileSizeBytes: approxBytes,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to decode image file. Please provide a valid JPG, PNG, or WebP image.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.readAsDataURL(file);
  });
}
