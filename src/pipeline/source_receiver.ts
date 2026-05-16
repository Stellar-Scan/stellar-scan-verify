export function validateZipLayout(files: string[]) {
  if (!files.some((f) => f.endsWith('Cargo.toml'))) {
    throw new Error('Cargo.toml required in archive');
  }
}
