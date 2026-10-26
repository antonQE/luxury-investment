export interface PutObjectInput {
  /** Relative key, e.g. `properties/{id}/original/{uuid}.jpg`. */
  key: string;
  body: Buffer;
  contentType: string;
}

export interface StoredObject {
  key: string;
  contentType: string;
  byteSize: number;
}

/**
 * Storage port (ADR-0010). Local adapter for R1; GCS later without changing callers.
 */
export interface StoragePort {
  put(input: PutObjectInput): Promise<StoredObject>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  /** Absolute or absolute-path URL for local/public serving. */
  publicUrl(key: string): string;
}
