import type { StorageAdapter } from "./types";

/**
 * S3-compatible upload stub — implement with @aws-sdk/client-s3 when keys are set.
 * Env: S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_PUBLIC_BASE_URL
 */
export class S3StorageAdapter implements StorageAdapter {
  async savePublicFile(): Promise<{ publicUrl: string }> {
    throw new Error(
      "S3StorageAdapter not wired in MVP — use LocalPublicStorage or extend with AWS SDK."
    );
  }
}
