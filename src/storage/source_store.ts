import fs from 'node:fs';
import path from 'node:path';

export class SourceStore {
  constructor(private root: string) {}
  save(jobId: string, filename: string, data: Buffer) {
    const dir = path.join(this.root, jobId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), data);
    return dir;
  }
}
