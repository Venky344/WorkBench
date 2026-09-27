/**
 * Universal ID and Timestamp primitives
 */
export type EntityId = string;
export type ISOTimestamp = string;

/**
 * Result pattern for safe functional error handling
 */
export type Result<T, E = Error> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

export const err = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

/**
 * JSON-serializable value types
 */
export type JSONPrimitive = string | number | boolean | null;
export type JSONArray = readonly JSONValue[];
export type JSONObject = { readonly [key: string]: JSONValue };
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
