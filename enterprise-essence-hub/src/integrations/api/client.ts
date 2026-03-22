/**
 * REST API Client for Enterprise Essence Hub
 * Replaces Supabase SDK with direct REST calls to Node.js backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const isFormData = (body: any): body is FormData =>
  typeof FormData !== 'undefined' && body instanceof FormData;

const camelToSnake = (key: string) =>
  key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const toSnake = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map(toSnake);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [camelToSnake(k), toSnake(v)])
    );
  }
  return value;
};

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

const getStoredTokens = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth_tokens');
    if (stored) {
      try {
        const tokens = JSON.parse(stored);
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
        return tokens;
      } catch {
        return null;
      }
    }
  }
  return null;
};

const setStoredTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_tokens', JSON.stringify({ accessToken: access, refreshToken: refresh }));
  }
};

const clearStoredTokens = () => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth_user');
  }
};

// Initialize tokens from storage on load
if (typeof window !== 'undefined') {
  getStoredTokens();
}

// API request helper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (!isFormData(options.body)) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 - token expired, try refresh
    if (response.status === 401 && refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setStoredTokens(refreshData.accessToken, refreshData.refreshToken);
          
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
          return fetch(url, { ...options, headers });
        } else {
          clearStoredTokens();
          window.location.href = '/admin/login';
        }
      } catch (error) {
        clearStoredTokens();
        throw error;
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
}

// ============ AUTHENTICATION ============

export interface User {
  id: string;
  email: string;
  role: string;
  roles?: string[];
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const auth = {
  async register(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json() as AuthResponse;
    setStoredTokens(data.accessToken, data.refreshToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json() as AuthResponse;
    setStoredTokens(data.accessToken, data.refreshToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }
    return data;
  },

  async logout(): Promise<void> {
    clearStoredTokens();
  },

  async getCurrentUser(): Promise<User | null> {
    if (!accessToken) {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    }

    try {
      const response = await apiRequest('/auth/me');
      if (response.ok) {
        const user = await response.json() as User;
        localStorage.setItem('auth_user', JSON.stringify(user));
        return user;
      }
      return null;
    } catch {
      return null;
    }
  },

  async refreshAccessToken(): Promise<string | null> {
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json() as { accessToken: string; refreshToken: string };
        setStoredTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      }
      clearStoredTokens();
      return null;
    } catch {
      return null;
    }
  },
};

// ============ LEADS / CONTACT FORMS ============

export interface LeadData {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  interest?: string | null;
  message?: string | null;
  form_type: string;
  source_page?: string | null;
}

export const leads = {
  async submit(data: LeadData) {
    const response = await apiRequest('/api/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || 'Submission failed', message: error.message };
    }

    return { data: await response.json(), error: null };
  },

  async getAll(params: { status?: string; page?: number; limit?: number; q?: string } = {}) {
    const search = new URLSearchParams();
    if (params.status) search.set('status', params.status);
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    if (params.q) search.set('q', params.q);
    const response = await apiRequest(`/api/leads?${search.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch leads');
    const data = await response.json();
    return toSnake(data);
  },

  async getById(id: string) {
    const response = await apiRequest(`/api/leads/${id}`);
    if (!response.ok) throw new Error('Failed to fetch lead');
    return toSnake(await response.json());
  },

  async update(id: string, payload: { status?: string; notes?: string; assigned_to?: string | null }) {
    const response = await apiRequest(`/api/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update lead');
    return toSnake(await response.json());
  },

  async bulkUpdate(payload: { ids: string[]; status?: string; assigned_to?: string | null }) {
    const response = await apiRequest(`/api/leads/bulk`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to bulk update leads');
    return response.json();
  },

  async bulkDelete(ids: string[]) {
    const response = await apiRequest(`/api/leads/bulk`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error('Failed to bulk delete leads');
    return response.json();
  },
};

// ============ CMS - SERVICES ============

export interface Service {
  id: string;
  title: string;
  slug: string;
  categoryName: string;
  tagline?: string;
  description?: string;
  isPublished: boolean;
  [key: string]: any;
}

export const cms = {
  services: {
    async getAll() {
      const response = await apiRequest('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      return toSnake(await response.json());
    },

    async getBySlug(slug: string) {
      const response = await apiRequest(`/api/services/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch service');
      return toSnake(await response.json());
    },

    async create(data: any) {
      const response = await apiRequest('/admin/services', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create service');
      return toSnake(await response.json());
    },

    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update service');
      return toSnake(await response.json());
    },

    async delete(id: string) {
      const response = await apiRequest(`/admin/services/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete service');
      return response.json();
    },
  },

  // Products
  products: {
    async getAll() {
      const response = await apiRequest('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return toSnake(await response.json());
    },

    async getBySlug(slug: string) {
      const response = await apiRequest(`/api/products/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return toSnake(await response.json());
    },

    async create(data: any) {
      const response = await apiRequest('/admin/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create product');
      return toSnake(await response.json());
    },

    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update product');
      return toSnake(await response.json());
    },

    async delete(id: string) {
      const response = await apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
  },

  // Blog
  blog: {
    async getAll() {
      const response = await apiRequest('/api/blog');
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      return toSnake(await response.json());
    },

    async getBySlug(slug: string) {
      const response = await apiRequest(`/api/blog/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch blog post');
      return toSnake(await response.json());
    },

    async create(data: any) {
      const response = await apiRequest('/admin/blog', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create blog post');
      return toSnake(await response.json());
    },

    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/blog/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update blog post');
      return toSnake(await response.json());
    },

    async delete(id: string) {
      const response = await apiRequest(`/admin/blog/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete blog post');
      return response.json();
    },
  },

  blogCategories: {
    async getAll() {
      const response = await apiRequest('/api/blog-categories');
      if (!response.ok) throw new Error('Failed to fetch blog categories');
      return toSnake(await response.json());
    },

    async create(data: any) {
      const response = await apiRequest('/admin/blog-categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create blog category');
      return toSnake(await response.json());
    },

    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/blog-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update blog category');
      return toSnake(await response.json());
    },

    async delete(id: string) {
      const response = await apiRequest(`/admin/blog-categories/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete blog category');
      return response.json();
    },
  },

  // Case Studies
  caseStudies: {
    async getAll() {
      const response = await apiRequest('/api/case-studies');
      if (!response.ok) throw new Error('Failed to fetch case studies');
      return toSnake(await response.json());
    },

    async getBySlug(slug: string) {
      const response = await apiRequest(`/api/case-studies/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch case study');
      return toSnake(await response.json());
    },

    async create(data: any) {
      const response = await apiRequest('/admin/case-studies', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create case study');
      return toSnake(await response.json());
    },

    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/case-studies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update case study');
      return toSnake(await response.json());
    },

    async delete(id: string) {
      const response = await apiRequest(`/admin/case-studies/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete case study');
      return response.json();
    },
  },

  // Careers
  careers: {
    async getAll() {
      const response = await apiRequest('/api/careers');
      if (!response.ok) throw new Error('Failed to fetch careers');
      return toSnake(await response.json());
    },

    async getBySlug(slug: string) {
      const response = await apiRequest(`/api/careers/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch career');
      return toSnake(await response.json());
    },

    async create(data: any) {
      const response = await apiRequest('/admin/careers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create career');
      return toSnake(await response.json());
    },

    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/careers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update career');
      return toSnake(await response.json());
    },

    async delete(id: string) {
      const response = await apiRequest(`/admin/careers/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete career');
      return response.json();
    },
  },

  // Testimonials
  testimonials: {
    async getAll() {
      const response = await apiRequest('/api/testimonials');
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      return toSnake(await response.json());
    },

    async create(data: any) {
      const response = await apiRequest('/admin/testimonials', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create testimonial');
      return toSnake(await response.json());
    },

    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/testimonials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update testimonial');
      return toSnake(await response.json());
    },

    async delete(id: string) {
      const response = await apiRequest(`/admin/testimonials/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete testimonial');
      return response.json();
    },
  },

  // Gallery
  gallery: {
    async getAll(category?: string) {
      const endpoint = category ? `/api/gallery?category=${encodeURIComponent(category)}` : '/api/gallery';
      const response = await apiRequest(endpoint);
      if (!response.ok) throw new Error('Failed to fetch gallery');
      return toSnake(await response.json());
    },

    async create(data: any) {
      const response = await apiRequest('/admin/gallery', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create gallery item');
      return toSnake(await response.json());
    },

    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/gallery/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update gallery item');
      return toSnake(await response.json());
    },

    async delete(id: string) {
      const response = await apiRequest(`/admin/gallery/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete gallery item');
      return response.json();
    },
  },

  pageSeo: {
    async getByPath(path: string) {
      const clean = path.replace(/^\/+/, '');
      const response = await apiRequest(`/api/page-seo/${clean}`);
      if (!response.ok) {
        return null;
      }
      return toSnake(await response.json());
    },

    async list() {
      const response = await apiRequest('/admin/page-seo');
      if (!response.ok) throw new Error('Failed to fetch page SEO');
      return toSnake(await response.json());
    },

    async create(data: any) {
      const response = await apiRequest('/admin/page-seo', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create page SEO');
      return toSnake(await response.json());
    },

    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/page-seo/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update page SEO');
      return toSnake(await response.json());
    },

    async delete(id: string) {
      const response = await apiRequest(`/admin/page-seo/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete page SEO');
      return response.json();
    },
  },

  siteSettings: {
    async getAll() {
      const response = await apiRequest('/api/site-settings');
      if (!response.ok) throw new Error('Failed to fetch site settings');
      return toSnake(await response.json());
    },

    async list() {
      const response = await apiRequest('/admin/site-settings');
      if (!response.ok) throw new Error('Failed to fetch site settings');
      return toSnake(await response.json());
    },

    async create(data: any) {
      const response = await apiRequest('/admin/site-settings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create site setting');
      return toSnake(await response.json());
    },

    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/site-settings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update site setting');
      return toSnake(await response.json());
    },

    async delete(id: string) {
      const response = await apiRequest(`/admin/site-settings/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete site setting');
      return response.json();
    },
  },
};

// ============ ADMIN ============

export const admin = {
  dashboard: {
    async getStats() {
      const response = await apiRequest('/admin/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
  },

  users: {
    async list() {
      const response = await apiRequest('/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },

    async create(payload: { email: string; password: string; full_name?: string; role?: string }) {
      const response = await apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },

    async addRole(userId: string, role: string) {
      const response = await apiRequest(`/admin/users/${userId}/roles`, {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error('Failed to add role');
      return response.json();
    },

    async removeRole(roleId: string) {
      const response = await apiRequest(`/admin/users/roles/${roleId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove role');
      return response.json();
    },
  },

  services: {
    async list() {
      const response = await apiRequest('/admin/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      return toSnake(await response.json());
    },
    async get(id: string) {
      const response = await apiRequest(`/admin/services/${id}`);
      if (!response.ok) throw new Error('Failed to fetch service');
      return toSnake(await response.json());
    },
    async create(data: any) {
      const response = await apiRequest('/admin/services', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create service');
      return toSnake(await response.json());
    },
    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update service');
      return toSnake(await response.json());
    },
    async delete(id: string) {
      const response = await apiRequest(`/admin/services/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete service');
      return response.json();
    },
  },

  products: {
    async list() {
      const response = await apiRequest('/admin/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return toSnake(await response.json());
    },
    async get(id: string) {
      const response = await apiRequest(`/admin/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return toSnake(await response.json());
    },
    async create(data: any) {
      const response = await apiRequest('/admin/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create product');
      return toSnake(await response.json());
    },
    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update product');
      return toSnake(await response.json());
    },
    async delete(id: string) {
      const response = await apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
  },

  blog: {
    async list() {
      const response = await apiRequest('/admin/blog');
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      return toSnake(await response.json());
    },
    async get(id: string) {
      const response = await apiRequest(`/admin/blog/${id}`);
      if (!response.ok) throw new Error('Failed to fetch blog post');
      return toSnake(await response.json());
    },
    async create(data: any) {
      const response = await apiRequest('/admin/blog', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create blog post');
      return toSnake(await response.json());
    },
    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/blog/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update blog post');
      return toSnake(await response.json());
    },
    async delete(id: string) {
      const response = await apiRequest(`/admin/blog/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete blog post');
      return response.json();
    },
  },

  blogCategories: {
    async list() {
      const response = await apiRequest('/admin/blog-categories');
      if (!response.ok) throw new Error('Failed to fetch blog categories');
      return toSnake(await response.json());
    },
    async create(data: any) {
      const response = await apiRequest('/admin/blog-categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create blog category');
      return toSnake(await response.json());
    },
    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/blog-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update blog category');
      return toSnake(await response.json());
    },
    async delete(id: string) {
      const response = await apiRequest(`/admin/blog-categories/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete blog category');
      return response.json();
    },
  },

  caseStudies: {
    async list() {
      const response = await apiRequest('/admin/case-studies');
      if (!response.ok) throw new Error('Failed to fetch case studies');
      return toSnake(await response.json());
    },
    async get(id: string) {
      const response = await apiRequest(`/admin/case-studies/${id}`);
      if (!response.ok) throw new Error('Failed to fetch case study');
      return toSnake(await response.json());
    },
    async create(data: any) {
      const response = await apiRequest('/admin/case-studies', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create case study');
      return toSnake(await response.json());
    },
    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/case-studies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update case study');
      return toSnake(await response.json());
    },
    async delete(id: string) {
      const response = await apiRequest(`/admin/case-studies/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete case study');
      return response.json();
    },
  },

  careers: {
    async list() {
      const response = await apiRequest('/admin/careers');
      if (!response.ok) throw new Error('Failed to fetch careers');
      return toSnake(await response.json());
    },
    async get(id: string) {
      const response = await apiRequest(`/admin/careers/${id}`);
      if (!response.ok) throw new Error('Failed to fetch career');
      return toSnake(await response.json());
    },
    async create(data: any) {
      const response = await apiRequest('/admin/careers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create career');
      return toSnake(await response.json());
    },
    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/careers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update career');
      return toSnake(await response.json());
    },
    async delete(id: string) {
      const response = await apiRequest(`/admin/careers/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete career');
      return response.json();
    },
  },

  testimonials: {
    async list() {
      const response = await apiRequest('/admin/testimonials');
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      return toSnake(await response.json());
    },
    async get(id: string) {
      const response = await apiRequest(`/admin/testimonials/${id}`);
      if (!response.ok) throw new Error('Failed to fetch testimonial');
      return toSnake(await response.json());
    },
    async create(data: any) {
      const response = await apiRequest('/admin/testimonials', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create testimonial');
      return toSnake(await response.json());
    },
    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/testimonials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update testimonial');
      return toSnake(await response.json());
    },
    async delete(id: string) {
      const response = await apiRequest(`/admin/testimonials/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete testimonial');
      return response.json();
    },
  },

  gallery: {
    async list() {
      const response = await apiRequest('/admin/gallery');
      if (!response.ok) throw new Error('Failed to fetch gallery');
      return toSnake(await response.json());
    },
    async get(id: string) {
      const response = await apiRequest(`/admin/gallery/${id}`);
      if (!response.ok) throw new Error('Failed to fetch gallery item');
      return toSnake(await response.json());
    },
    async create(data: any) {
      const response = await apiRequest('/admin/gallery', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create gallery item');
      return toSnake(await response.json());
    },
    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/gallery/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update gallery item');
      return toSnake(await response.json());
    },
    async delete(id: string) {
      const response = await apiRequest(`/admin/gallery/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete gallery item');
      return response.json();
    },
  },

  pageSeo: {
    async list() {
      const response = await apiRequest('/admin/page-seo');
      if (!response.ok) throw new Error('Failed to fetch page SEO');
      return toSnake(await response.json());
    },
    async get(id: string) {
      const response = await apiRequest(`/admin/page-seo/${id}`);
      if (!response.ok) throw new Error('Failed to fetch page SEO');
      return toSnake(await response.json());
    },
    async create(data: any) {
      const response = await apiRequest('/admin/page-seo', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create page SEO');
      return toSnake(await response.json());
    },
    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/page-seo/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update page SEO');
      return toSnake(await response.json());
    },
    async delete(id: string) {
      const response = await apiRequest(`/admin/page-seo/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete page SEO');
      return response.json();
    },
  },

  siteSettings: {
    async list() {
      const response = await apiRequest('/admin/site-settings');
      if (!response.ok) throw new Error('Failed to fetch site settings');
      return toSnake(await response.json());
    },
    async get(id: string) {
      const response = await apiRequest(`/admin/site-settings/${id}`);
      if (!response.ok) throw new Error('Failed to fetch site setting');
      return toSnake(await response.json());
    },
    async create(data: any) {
      const response = await apiRequest('/admin/site-settings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create site setting');
      return toSnake(await response.json());
    },
    async update(id: string, data: any) {
      const response = await apiRequest(`/admin/site-settings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update site setting');
      return toSnake(await response.json());
    },
    async delete(id: string) {
      const response = await apiRequest(`/admin/site-settings/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete site setting');
      return response.json();
    },
  },

  leads: {
    async list(params: { status?: string; page?: number; limit?: number; q?: string } = {}) {
      return leads.getAll(params);
    },
    async update(id: string, payload: { status?: string; notes?: string; assigned_to?: string | null }) {
      return leads.update(id, payload);
    },
    async bulkUpdate(payload: { ids: string[]; status?: string; assigned_to?: string | null }) {
      return leads.bulkUpdate(payload);
    },
    async bulkDelete(ids: string[]) {
      return leads.bulkDelete(ids);
    },
  },

  uploads: {
    async uploadFile(file: File) {
      const form = new FormData();
      form.append('file', file);
      const response = await apiRequest('/admin/uploads', {
        method: 'POST',
        body: form,
      });
      if (!response.ok) throw new Error('Failed to upload file');
      const data = await response.json();
      return `${API_BASE}${data.url}`;
    },
  },
};

// ============ CHAT ============

export const chat = {
  // Public chat widget
  async startChat(payload: { session_id?: string; visitor_name: string; visitor_email?: string | null }) {
    const response = await apiRequest('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ action: 'start_chat', ...payload }),
    });
    if (!response.ok) throw new Error('Failed to start chat');
    return toSnake(await response.json());
  },

  async sendMessage(payload: { conversation_id: string; message: string; session_id?: string }) {
    const response = await apiRequest('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ action: 'send_message', ...payload }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return toSnake(await response.json());
  },

  async fetchMessages(payload: { conversation_id: string; session_id?: string }) {
    const response = await apiRequest('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ action: 'fetch_messages', ...payload }),
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return toSnake(await response.json());
  },

  // Admin chat tools
  async listConversations(limit = 50, status?: string) {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (status) params.set('status', status);
    const response = await apiRequest(`/api/chat?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return toSnake(await response.json());
  },

  async getConversation(conversationId: string) {
    const response = await apiRequest(`/api/chat/${conversationId}`);
    if (!response.ok) throw new Error('Failed to fetch conversation');
    return toSnake(await response.json());
  },

  async sendAdminMessage(conversationId: string, message: string) {
    const response = await apiRequest('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId, message }),
    });
    if (!response.ok) throw new Error('Failed to send admin message');
    return toSnake(await response.json());
  },

  async generateAIReply(conversationId: string) {
    const response = await apiRequest('/api/chat/ai-reply', {
      method: 'POST',
      body: JSON.stringify({ conversationId }),
    });
    if (!response.ok) throw new Error('Failed to generate AI reply');
    return toSnake(await response.json());
  },

  async updateConversation(id: string, payload: { status?: string; assigned_agent?: string }) {
    const response = await apiRequest(`/api/chat/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update conversation');
    return toSnake(await response.json());
  },
};

// ============ ANALYTICS ============

export const analytics = {
  async trackPageView(pagePath: string, pageTitle?: string) {
    const response = await apiRequest('/api/page-views', {
      method: 'POST',
      body: JSON.stringify({
        page_path: pagePath,
        page_title: pageTitle || document.title,
        referrer: document.referrer,
        session_id: sessionStorage.getItem('ecc_session') || undefined,
        device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
      }),
    });
    if (!response.ok) {
      console.warn('Failed to track page view');
      return null;
    }
    return response.json();
  },

  async getStats() {
    const response = await apiRequest('/api/page-views/stats');
    if (!response.ok) throw new Error('Failed to fetch analytics stats');
    return response.json();
  },

  async getPageViews(params: { page_path?: string; start_date?: string; end_date?: string; page?: number; limit?: number } = {}) {
    const search = new URLSearchParams();
    if (params.page_path) search.set('page_path', params.page_path);
    if (params.start_date) search.set('start_date', params.start_date);
    if (params.end_date) search.set('end_date', params.end_date);
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    const response = await apiRequest(`/api/page-views?${search.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch page views');
    return toSnake(await response.json());
  },
};

export default {
  auth,
  leads,
  cms,
  admin,
  chat,
  analytics,
};
