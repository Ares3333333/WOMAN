export interface StorageAdapter {
  savePublicFile(params: {
    buffer: Buffer;
    relativePath: string;
    contentType: string;
  }): Promise<{ publicUrl: string }>;
}
