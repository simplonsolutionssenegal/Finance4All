export type ApiResponse<T> = { status: 'success' | 'error'; results: number; data: T[] };
