import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Request Interceptor — Attach access token ────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response Interceptor — Auto-refresh on 401 ───────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processPendingQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
        const newToken = data.data.accessToken;

        localStorage.setItem('accessToken', newToken);
        processPendingQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        processPendingQueue(err, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Typed API helpers ────────────────────────────────────────────────────────

/* Maps a single startup row from backend snake_case to frontend camelCase */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStartup(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    tagline: row.tagline,
    industry: row.industry,
    category: row.category,
    pricingModel: row.pricing_model,
    monthlyBudget: row.monthly_budget,
    targetAudience: row.target_audience,
    logoUrl: row.logo_url,
    bannerUrl: row.banner_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const api = {
  auth: {
    register: (data: object) => apiClient.post('/auth/register', data),
    login: (data: object) => apiClient.post('/auth/login', data),
    logout: (refreshToken: string) => apiClient.post('/auth/logout', { refreshToken }),
    me: () => apiClient.get('/auth/me'),
    updateProfile: (data: object) => apiClient.patch('/auth/me', data),
    changePassword: (data: object) => apiClient.post('/auth/change-password', data),
  },
  startups: {
    list: () =>
      apiClient.get('/startups').then((res) => {
        res.data.data = res.data.data.map(mapStartup);
        return res;
      }),
    create: (data: object) =>
      apiClient.post('/startups', data).then((res) => {
        res.data.data = mapStartup(res.data.data);
        return res;
      }),
    getById: (id: string) =>
      apiClient.get(`/startups/${id}`).then((res) => {
        res.data.data = mapStartup(res.data.data);
        return res;
      }),
    update: (id: string, data: object) =>
      apiClient.patch(`/startups/${id}`, data).then((res) => {
        res.data.data = mapStartup(res.data.data);
        return res;
      }),
    delete: (id: string) => apiClient.delete(`/startups/${id}`),
    uploadLogo: (id: string, file: File) => {
      const form = new FormData();
      form.append('logo', file);
      return apiClient.post(`/startups/${id}/logo`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    uploadBanner: (id: string, file: File) => {
      const form = new FormData();
      form.append('banner', file);
      return apiClient.post(`/startups/${id}/banner`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
  },
  simulations: {
    getState: (startupId: string) => apiClient.get(`/simulations/${startupId}`),
    start: (startupId: string) => apiClient.post(`/simulations/${startupId}/start`),
    pause: (startupId: string) => apiClient.post(`/simulations/${startupId}/pause`),
    getMetrics: (startupId: string, limit = 90) =>
      apiClient.get(`/simulations/${startupId}/metrics?limit=${limit}`),
    getEvents: (startupId: string, limit = 20) =>
      apiClient.get(`/simulations/${startupId}/events?limit=${limit}`),
  },
};
