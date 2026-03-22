/**
 * API Client for Enterprise Essence Hub
 * Replaces Supabase client with direct REST API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
}

// Helper to get auth token from localStorage
function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

// Helper to set auth tokens
function setAuthTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

// Helper to clear auth tokens
function clearAuthTokens(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle token expiration
    if (response.status === 401 && token) {
      // Try to refresh token
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        return apiFetch<T>(endpoint, options);
      } else {
        // Logout user
        clearAuthTokens();
        window.location.href = '/login';
      }
    }
    throw new Error(data.error || 'API request failed');
  }

  return data as T;
}

// ============ AUTHENTICATION ============

export async function register(
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: User; tokens: AuthTokens }> {
  const response = await apiFetch<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
    }),
  });

  if (response.accessToken && response.refreshToken) {
    setAuthTokens(response.accessToken, response.refreshToken);
  }

  return {
    user: response.user,
    tokens: {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    },
  };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User; tokens: AuthTokens }> {
  const response = await apiFetch<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.accessToken && response.refreshToken) {
    setAuthTokens(response.accessToken, response.refreshToken);
  }

  return {
    user: response.user,
    tokens: {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    },
  };
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuthTokens();
  }
}

export async function getCurrentUser(): Promise<User> {
  return apiFetch<User>('/auth/me', { method: 'GET' });
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return false;
    }

    const response = await apiFetch<any>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      headers: {
        Authorization: '', // Don't include old token
      },
    });

    if (response.accessToken) {
      setAuthTokens(response.accessToken, response.refreshToken || refreshToken);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

// ============ CMS - SERVICES ============

export async function getServices(): Promise<any[]> {
  return apiFetch<any[]>('/api/services', { method: 'GET' });
}

export async function getServiceBySlug(slug: string): Promise<any> {
  return apiFetch<any>(`/api/services/${slug}`, { method: 'GET' });
}

// ============ CMS - PRODUCTS ============

export async function getProducts(): Promise<any[]> {
  return apiFetch<any[]>('/api/products', { method: 'GET' });
}

export async function getProductBySlug(slug: string): Promise<any> {
  return apiFetch<any>(`/api/products/${slug}`, { method: 'GET' });
}

// ============ CMS - BLOG ============

export async function getBlogPosts(page = 1, limit = 10, categoryId?: string): Promise<any> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(categoryId && { categoryId }),
  });
  return apiFetch<any>(`/api/blog?${params}`, { method: 'GET' });
}

export async function getBlogPostBySlug(slug: string): Promise<any> {
  return apiFetch<any>(`/api/blog/${slug}`, { method: 'GET' });
}

export async function getBlogCategories(): Promise<any[]> {
  return apiFetch<any[]>('/api/blog-categories', { method: 'GET' });
}

// ============ CMS - CASE STUDIES ============

export async function getCaseStudies(): Promise<any[]> {
  return apiFetch<any[]>('/api/case-studies', { method: 'GET' });
}

export async function getCaseStudyBySlug(slug: string): Promise<any> {
  return apiFetch<any>(`/api/case-studies/${slug}`, { method: 'GET' });
}

// ============ CMS - CAREERS ============

export async function getCareers(): Promise<any[]> {
  return apiFetch<any[]>('/api/careers', { method: 'GET' });
}

export async function getCareerBySlug(slug: string): Promise<any> {
  return apiFetch<any>(`/api/careers/${slug}`, { method: 'GET' });
}

// ============ CMS - OTHER ============

export async function getTestimonials(): Promise<any[]> {
  return apiFetch<any[]>('/api/testimonials', { method: 'GET' });
}

export async function getGallery(category?: string): Promise<any[]> {
  const params = new URLSearchParams(category ? { category } : {});
  return apiFetch<any[]>(`/api/gallery?${params}`, { method: 'GET' });
}

export async function getPageSeo(path: string): Promise<any> {
  return apiFetch<any>(`/api/page-seo/${path.replace(/^\//, '')}`, { method: 'GET' });
}

export async function getSiteSettings(): Promise<Record<string, any>> {
  return apiFetch<Record<string, any>>('/api/site-settings', { method: 'GET' });
}

// ============ LEADS ============

export async function submitLead(leadData: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  interest?: string;
  form_type?: string;
  source_page?: string;
}): Promise<{ success: boolean; leadId: string }> {
  return apiFetch<any>('/api/leads', {
    method: 'POST',
    body: JSON.stringify(leadData),
  });
}

// ============ CHAT ============

export async function startChat(
  sessionId?: string,
  visitorName?: string,
  visitorEmail?: string
): Promise<any> {
  return apiFetch<any>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      action: 'start_chat',
      session_id: sessionId,
      visitor_name: visitorName,
      visitor_email: visitorEmail,
    }),
  });
}

export async function sendChatMessage(
  conversationId: string,
  message: string
): Promise<any> {
  return apiFetch<any>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      action: 'send_message',
      conversation_id: conversationId,
      message,
    }),
  });
}

export async function fetchChatMessages(conversationId: string): Promise<any> {
  return apiFetch<any>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      action: 'fetch_messages',
      conversation_id: conversationId,
    }),
  });
}

// ============ ANALYTICS ============

export async function trackPageView(pageData: {
  session_id?: string;
  page_path: string;
  referrer?: string;
  device_type?: string;
  duration_seconds?: number;
}): Promise<{ success: boolean; pageViewId: string }> {
  // Don't wait for response, fire and forget
  fetch(`${API_BASE_URL}/api/page-views`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pageData),
  }).catch(error => console.error('Analytics tracking failed:', error));

  return { success: true, pageViewId: '' };
}

export default {
  // Auth
  register,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,

  // CMS
  getServices,
  getServiceBySlug,
  getProducts,
  getProductBySlug,
  getBlogPosts,
  getBlogPostBySlug,
  getBlogCategories,
  getCaseStudies,
  getCaseStudyBySlug,
  getCareers,
  getCareerBySlug,
  getTestimonials,
  getGallery,
  getPageSeo,
  getSiteSettings,

  // Forms
  submitLead,

  // Chat
  startChat,
  sendChatMessage,
  fetchChatMessages,

  // Analytics
  trackPageView,
};
