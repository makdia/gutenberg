export const STORE_NAME = 'core/upload-media';

/**
 * Default maximum number of concurrent uploads.
 */
export const DEFAULT_MAX_CONCURRENT_UPLOADS = 5;

/**
 * Default maximum number of concurrent image processing operations.
 *
 * Image processing (VIPS WASM) is significantly more memory-intensive
 * than network uploads. Each operation can consume 50-100MB+ of memory
 * for large images. A lower limit prevents out-of-memory crashes when
 * uploading many images at once.
 */
export const DEFAULT_MAX_CONCURRENT_IMAGE_PROCESSING = 2;

/**
 * MIME types supported by client-side media processing.
 *
 * These are the image formats that can be processed using
 * WebAssembly-based vips in the browser.
 */
export const CLIENT_SIDE_SUPPORTED_MIME_TYPES: readonly string[] = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/avif',
] as const;

/**
 * Maximum number of automatic retry attempts for retryable errors.
 */
export const MAX_RETRIES = 3;

/**
 * Base delay in milliseconds for exponential backoff between retries.
 * Actual delay = BASE_RETRY_DELAY_MS * 2^(retryCount - 1), capped at MAX_RETRY_DELAY_MS.
 */
export const BASE_RETRY_DELAY_MS = 1000;

/**
 * Maximum delay in milliseconds between retries.
 */
export const MAX_RETRY_DELAY_MS = 10000;
