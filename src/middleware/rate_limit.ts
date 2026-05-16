export const MAX_ZIP_MB = 25;
export function assertZipSize(bytes: number) {
  if (bytes > MAX_ZIP_MB * 1024 * 1024) throw new Error('zip too large');
}
