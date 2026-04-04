/** Strip non-JSON values (e.g. Prisma Dates) for Server → Client component props. */
export function toSerializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
