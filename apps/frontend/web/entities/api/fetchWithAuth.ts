import { LOCAL_STORAGE_KEYS } from '@/shared/constants/local-storage-keys';

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
  navigate?: (path: { to: string }) => void
) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  if (response.status === 403 || response.status === 401) {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LOGIN_STATE);
    navigate?.({ to: '/login' });
  }

  if (!response.ok) {
    const data = await response.json();
    const errorMessage = data.message || data.reason;
    throw new Error(
      `HTTP error! status: ${response.status}\n Message: ${errorMessage}`
    );
  }

  if (response.status === 204) {
    return;
  }

  try {
    return await response.json();
  } catch (e) {
    console.error('Error parsing JSON:', e, response);
    throw new Error(
      `HTTP error! status: ${response.status}\n Message: Unexpected response format`
    );
  }
};
