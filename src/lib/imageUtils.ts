import { Product } from '../types';

/**
 * Utility functions for handling image uploads as Base64 data URLs
 * with adaptive canvas resizing and compression so product galleries
 * remain crisp while safely fitting inside Firestore's 1 MiB document limit.
 */

const compressCanvasToJpeg = (
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
  initialQuality: number,
  maxBase64Length: number
): string => {
  let width = img.width;
  let height = img.height;

  if (width > maxWidth || height > maxHeight) {
    if (width / height > maxWidth / maxHeight) {
      height = Math.max(1, Math.round((height * maxWidth) / width));
      width = maxWidth;
    } else {
      width = Math.max(1, Math.round((width * maxHeight) / height));
      height = maxHeight;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  let quality = initialQuality;
  let result = canvas.toDataURL('image/jpeg', quality);

  // Step down JPEG quality smoothly if payload is still too heavy for Firestore documents
  while (result.length > maxBase64Length && quality > 0.44) {
    quality = Number((quality - 0.1).toFixed(2));
    result = canvas.toDataURL('image/jpeg', quality);
  }

  // If still above maxBase64Length, reduce dimensions slightly and re-encode
  if (result.length > maxBase64Length) {
    const scale = 0.75;
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const smallCtx = canvas.getContext('2d');
    if (smallCtx) {
      smallCtx.imageSmoothingEnabled = true;
      smallCtx.imageSmoothingQuality = 'high';
      smallCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
      result = canvas.toDataURL('image/jpeg', 0.62);
    }
  }

  return result;
};

export const fileToBase64 = (
  file: File,
  maxWidth = 900,
  maxHeight = 1200,
  quality = 0.8,
  maxBase64Length = 155000
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const rawDataUrl = (readerEvent.target?.result as string) || '';
      const img = new Image();
      img.onload = () => {
        const compressed = compressCanvasToJpeg(img, maxWidth, maxHeight, quality, maxBase64Length);
        resolve(compressed || rawDataUrl);
      };

      img.onerror = () => {
        resolve(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Re-compresses an existing data:image/* Base64 URL if it exceeds maxBase64Length
 */
export const compressBase64DataUrl = (
  dataUrl: string,
  maxWidth = 800,
  maxHeight = 1066,
  quality = 0.72,
  maxBase64Length = 130000
): Promise<string> => {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.length <= maxBase64Length) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const compressed = compressCanvasToJpeg(img, maxWidth, maxHeight, quality, maxBase64Length);
      resolve(compressed || dataUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

/**
 * Reads multiple files and converts all to compressed Base64
 */
export const filesToBase64List = async (
  files: FileList | File[],
  maxCount = 10,
  currentCount = 0
): Promise<string[]> => {
  const fileArray = Array.from(files);
  const remainingSlots = Math.max(0, maxCount - currentCount);
  const filesToProcess = fileArray.slice(0, remainingSlots);

  const totalAfterUpload = currentCount + filesToProcess.length;
  // Allocate a safe per-image budget so up to 10 images stay well below Firestore's 1 MiB limit
  const perImageBudget = totalAfterUpload >= 6 ? 85000 : totalAfterUpload >= 4 ? 115000 : 155000;

  const promises = filesToProcess.map((file) =>
    fileToBase64(file, 900, 1200, 0.8, perImageBudget)
  );
  return Promise.all(promises);
};

/**
 * Resolves a color image reference ('imgref:N') or direct URL/Base64 string
 */
export const resolveColorImageUrl = (
  colorImageUrl?: string,
  productImages?: string[]
): string => {
  const trimmed = (colorImageUrl || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('imgref:')) {
    const idx = parseInt(trimmed.replace('imgref:', ''), 10);
    if (!Number.isNaN(idx) && Array.isArray(productImages) && productImages[idx]) {
      return productImages[idx];
    }
    return '';
  }
  return trimmed;
};

/**
 * Converts a full photo URL matched in productImages into a lightweight 'imgref:N'
 * so saving color-linked images never duplicates Base64 payloads inside Firestore.
 */
export const encodeColorImageRef = (
  colorImageUrl?: string,
  productImages?: string[]
): string | undefined => {
  const trimmed = (colorImageUrl || '').trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('imgref:')) return trimmed;
  if (Array.isArray(productImages)) {
    const idx = productImages.findIndex((img) => img === trimmed);
    if (idx !== -1) {
      return `imgref:${idx}`;
    }
  }
  return trimmed;
};

/**
 * Normalizes a Product before writing to Firestore:
 * - Cleans empty image strings
 * - Deduplicates color image payloads via 'imgref:N'
 * - Compresses Base64 photos if total document size approaches Firestore's 1 MiB ceiling
 */
export const normalizeProductForFirestore = async (product: Product): Promise<Product> => {
  const cleanImages = (Array.isArray(product.images) ? product.images : [])
    .map((img) => (typeof img === 'string' ? img.trim() : ''))
    .filter(Boolean);

  const cleanColors = Array.isArray(product.colors)
    ? product.colors.map((c) => {
        const resolved = resolveColorImageUrl(c.imageUrl, cleanImages);
        const ref = encodeColorImageRef(resolved || c.imageUrl, cleanImages);
        return {
          name: c.name,
          hex: c.hex,
          ...(ref ? { imageUrl: ref } : {}),
        };
      })
    : [];

  let normalized: Product = {
    ...product,
    images: cleanImages,
    colors: cleanColors,
  };

  // Estimate serialized payload size and compress Base64 images if > 780 KB
  let payloadBytes = new Blob([JSON.stringify(normalized)]).size;
  if (payloadBytes > 780000 && cleanImages.length > 0) {
    const targetPerImage = Math.max(45000, Math.floor(680000 / cleanImages.length));
    const recompressedImages = await Promise.all(
      cleanImages.map((img) => compressBase64DataUrl(img, 760, 1013, 0.68, targetPerImage))
    );
    normalized = {
      ...normalized,
      images: recompressedImages,
    };
    payloadBytes = new Blob([JSON.stringify(normalized)]).size;

    // Second pass if still over 880 KB
    if (payloadBytes > 880000) {
      const tighterPerImage = Math.max(35000, Math.floor(580000 / recompressedImages.length));
      const ultraCompressed = await Promise.all(
        recompressedImages.map((img) => compressBase64DataUrl(img, 640, 853, 0.56, tighterPerImage))
      );
      normalized = {
        ...normalized,
        images: ultraCompressed,
      };
    }
  }

  return normalized;
};
