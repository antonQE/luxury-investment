const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Public detail URLs use the record id (`/properties/{id}/`). A value that is not
 * shaped like a UUID can never match a record, so callers treat it as "not found"
 * without hitting the database.
 */
export function isRecordId(value: string): boolean {
  return UUID_PATTERN.test(value);
}
