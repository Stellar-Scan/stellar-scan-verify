export class S3Store {
  constructor(private enabled: boolean) {}
  async put(_key: string, _data: Buffer) {
    if (!this.enabled) throw new Error('S3 disabled');
  }
}
