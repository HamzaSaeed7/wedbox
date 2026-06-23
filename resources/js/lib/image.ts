// Client-side image downscaling so large phone photos upload successfully.
// Avatars/service images don't need to be multi-MB originals — the server caps
// avatar uploads at 5 MB and service images at 10 MB, and PHP post_max_size is
// 10 MB on production, so we shrink before sending rather than failing validation.

/**
 * Downscale an image File to fit within `maxDim` (longest edge) and `maxBytes`,
 * re-encoding as JPEG. Returns the original File unchanged for non-images or if
 * it already fits. EXIF orientation is respected via createImageBitmap.
 */
export async function downscaleImage(
  file: File,
  maxDim = 1024,
  maxBytes = 4.5 * 1024 * 1024,
): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  // Already small enough on both axes and bytes? Skip the re-encode.
  if (file.size <= maxBytes) {
    // still may have huge dimensions, but if it's under the byte cap it will
    // pass server validation, so keep the original (and its format) as-is.
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // Can't decode here — let the server validate/handle it.
    return file;
  }

  const { width, height } = bitmap;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) { bitmap.close?.(); return file; }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const encode = (q: number) =>
    new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), 'image/jpeg', q));

  let quality = 0.9;
  let blob = await encode(quality);
  while (blob && blob.size > maxBytes && quality > 0.4) {
    quality -= 0.1;
    blob = await encode(quality);
  }
  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}
