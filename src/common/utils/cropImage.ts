// utils/cropImage.ts

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Crops and compresses an image via HTML Canvas
 * @param imageSrc ObjectURL or Base64 string of the original image
 * @param pixelCrop Crop box dimensions from react-easy-crop
 * @param targetSize Pixel dimensions for output (default: 300x300)
 * @param quality Compression level 0.0 - 1.0 (default: 0.8)
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  targetSize = 300,
  quality = 0.8
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context unavailable');
  }

  // Set standard resolution for output avatar (e.g., 300x300px)
  canvas.width = targetSize;
  canvas.height = targetSize;

  // Draw scaled & cropped region onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetSize,
    targetSize
  );

  // Export compressed Base64 string (image/jpeg or image/webp)
  return canvas.toDataURL('image/jpeg', quality);
}