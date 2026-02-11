export function assertNotBlank(value: string, message: string): void {
  if (!value || value.trim().length === 0) throw new Error(message);
}

export function assertMaxLength(value: string, max: number, message: string): void {
  if (value.length > max) throw new Error(message);
}
