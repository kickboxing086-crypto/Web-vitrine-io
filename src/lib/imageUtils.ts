/**
 * Utility functions for handling image uploads as Base64 data URLs
 * with automatic canvas resizing to preserve high resolution while
 * keeping localStorage size lightweight and responsive.
 */

export const fileToBase64 = (
  file: File,
  maxWidth = 1200,
  maxHeight = 1600,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions respecting aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original base64 if canvas context fails
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Draw image smoothly onto canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Base64 JPEG
        const base64DataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(base64DataUrl);
      };

      img.onerror = () => {
        // Fallback to raw base64 string
        resolve(readerEvent.target?.result as string);
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Reads multiple files and converts all to Base64
 */
export const filesToBase64List = async (
  files: FileList | File[],
  maxCount = 10,
  currentCount = 0
): Promise<string[]> => {
  const fileArray = Array.from(files);
  const remainingSlots = Math.max(0, maxCount - currentCount);
  const filesToProcess = fileArray.slice(0, remainingSlots);

  const promises = filesToProcess.map((file) => fileToBase64(file));
  return Promise.all(promises);
};
