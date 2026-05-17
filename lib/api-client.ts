import axios, { AxiosError } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// Attach JWT from localStorage on every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 — try refresh, then redirect to /login
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken =
        typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          originalRequest!.headers!.Authorization = `Bearer ${data.access_token}`;
          return apiClient.request(originalRequest!);
        } catch {
          forceLogout();
        }
      } else {
        forceLogout();
      }
    }

    const message =
      (error.response?.data as { detail?: string })?.detail ??
      error.message ??
      'Неизвестная ошибка';
    return Promise.reject(new Error(message));
  },
);

function forceLogout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  document.cookie = 'is_authenticated=; path=/; max-age=0';
  window.location.href = '/login';
}

export default apiClient;
