import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { StorageAdapter } from "./types";

export class LocalPublicStorage implements StorageAdapter {
  async savePublicFile(params: {
    buffer: Buffer;
    relativePath: string;
    contentType: string;
  }): Promise<{ publicUrl: string }> {
    const safe = params.relativePath.replace(/^\/+/, "").replace(/\.\./g, "");
    const full = path.join(process.cwd(), "public", safe);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, params.buffer);
    return { publicUrl: `/${safe.split(path.sep).join("/")}` };
  }
}
