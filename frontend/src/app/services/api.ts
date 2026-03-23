const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
    created_at: string;
  };
  message: string;
}

interface Entretien {
  id: number;
  expert_nom: string;
  expert_fonction?: string;
  domaine?: string;
  sensibilite: string;
  statut: string;
  fichier_audio?: string;
  transcription?: string;
  created_at: string;
  user_id: number;
}

interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(username: string, password: string): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    await this.request('/api/auth/logout', { method: 'POST' }).catch(() => {});
    this.clearToken();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  // Entretiens
  async getEntretiens(): Promise<Entretien[]> {
    return this.request<Entretien[]>('/api/entretiens');
  }

  async getEntretien(id: number): Promise<Entretien> {
    return this.request<Entretien>(`/api/entretiens/${id}`);
  }

  async createEntretien(data: Partial<Entretien>): Promise<Entretien> {
    return this.request<Entretien>('/api/entretiens', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteEntretien(id: number): Promise<void> {
    await this.request(`/api/entretiens/${id}`, { method: 'DELETE' });
  }

  async transcrireEntretien(id: number): Promise<{ message: string }> {
    return this.request(`/api/entretiens/${id}/transcrire`, { method: 'POST' });
  }

  async vectoriserEntretien(id: number): Promise<{ message: string }> {
    return this.request(`/api/entretiens/${id}/vectoriser`, { method: 'POST' });
  }

  async queryKnowledgeBase(question: string): Promise<{ answer: string }> {
    return this.request('/api/query', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  // Users (admin)
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/users');
  }

  async createUser(data: { username: string; password: string; role: string }): Promise<User> {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();