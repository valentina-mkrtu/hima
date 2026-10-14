// Browser/Android WebView only. No image data leaves the device.
export const IMAGE_LIMIT = 10_000_000;
const SOURCE_LIMIT = 50_000_000;

export async function compressAttachment(file: File): Promise<File> {
  if (!/\.(png|jpe?g|webp)$/i.test(file.name) || file.size < IMAGE_LIMIT) return file;
  if (file.size > SOURCE_LIMIT) throw new Error('Choose an image under 50 MB so it can be compressed safely on your device.');
  let bitmap: ImageBitmap | undefined;
  let canvas: HTMLCanvasElement | undefined;
  try {
    bitmap = await createImageBitmap(file);
    if (!bitmap.width || !bitmap.height) throw new Error('Empty image');
    canvas = document.createElement('canvas');
    const scale = Math.min(1, 4096 / Math.max(bitmap.width, bitmap.height));
    let width = Math.max(1, Math.round(bitmap.width * scale));
    let height = Math.max(1, Math.round(bitmap.height * scale));
    // Bound work and memory; reduce dimensions if encoding alone is insufficient.
    for (let attempt = 0; attempt < 6; attempt++) {
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image processing unavailable');
      context.drawImage(bitmap, 0, 0, width, height);
      const blob = await new Promise<Blob | null>(resolve => canvas!.toBlob(resolve, 'image/webp', .85));
      if (blob && blob.size > 0 && blob.size < IMAGE_LIMIT) {
        // Browsers without WebP encoding fall back to PNG; both preserve alpha.
        const extension = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : '';
        if (!extension) throw new Error('Unsupported image encoder');
        return new File([blob], `${file.name.replace(/\.[^.]+$/, '').slice(0, 170)}.${extension}`, {type: blob.type, lastModified: file.lastModified});
      }
      width = Math.max(1, Math.floor(width * .7));
      height = Math.max(1, Math.floor(height * .7));
    }
    throw new Error('Image remains too large');
  } catch {
    throw new Error('Could not compress this picture below 10 MB. Try a smaller PNG, JPEG or WebP image. Nothing has been saved.');
  } finally {
    bitmap?.close();
    if (canvas) { canvas.width = 0; canvas.height = 0; }
  }
}
