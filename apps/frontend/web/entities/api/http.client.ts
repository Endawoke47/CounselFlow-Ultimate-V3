import { LOCAL_STORAGE_KEYS } from '@/shared/constants/local-storage-keys';

type HttpOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
};

const makeRequest = async <T, K>(
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: T,
  options?: HttpOptions
): Promise<K> => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add params to URL if they exist
  const urlWithParams = options?.params
    ? `${url}?${new URLSearchParams(options.params).toString()}`
    : url;

  const response = await fetch(urlWithParams, {
    headers: { ...defaultHeaders, ...options?.headers },
    method,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (response.status === 403 || response.status === 401) {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LOGIN_STATE);
    window.location.href = '/login';
  }

  if (!response.ok) {
    const data = await response.json();
    const errorMessage = data.message || data.reason;
    throw new Error(
      `HTTP error! status: ${response.status}\n Message: ${errorMessage}`
    );
  }

  if (response.status === 204) {
    return undefined as K;
  }

  try {
    return (await response.json()) as K;
  } catch (e) {
    console.error('Error parsing JSON:', e, response);
    throw new Error(
      `HTTP error! status: ${response.status}\n Message: Unexpected response format`
    );
  }
};

export const httpClient = {
  get: <K>(url: string, options?: HttpOptions) =>
    makeRequest<never, K>(url, 'GET', undefined, options),

  post: <T, K>(url: string, body: T, options?: HttpOptions) =>
    makeRequest<T, K>(url, 'POST', body, options),

  patch: <T, K>(url: string, body: T, options?: HttpOptions) =>
    makeRequest<T, K | undefined>(url, 'PATCH', body, options),

  delete: <K>(url: string, options?: HttpOptions) =>
    makeRequest<never, K | undefined>(url, 'DELETE', undefined, options),
};
