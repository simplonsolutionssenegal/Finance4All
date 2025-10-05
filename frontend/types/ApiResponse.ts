export type ApiResponse<Tab> = { status: 'success' | 'error'; results: number; data: Tab[] };
