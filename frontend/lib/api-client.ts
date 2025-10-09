interface BackendErrorResponse {
  message?: string;
  errors?: { message: string }[];
}

export const apiClient = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  token: string | null,
  body?: any
): Promise<T> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorData: BackendErrorResponse;
    try {
      errorData = await response.json();
    } catch (_parseError) {
      errorData = { message: `Error HTTP ${response.status}: ${response.statusText}` };
    }
    throw new Error(
      errorData.errors?.[0]?.message || errorData.message || `Failed to ${method} ${endpoint}`
    );
  }

  return response.json();
};
