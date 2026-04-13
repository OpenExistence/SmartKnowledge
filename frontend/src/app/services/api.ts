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
  contenu_texte?: string;
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
    const response = await this.request<{ entretiens: Entretien[] }>('/api/entretiens');
    return response.entretiens;
  }

  async getEntretien(id: number): Promise<Entretien> {
    const response = await this.request<{entretien: Entretien}>(`/api/entretiens/${id}`);
    return response.entretien;
  }

  async createEntretien(data: Partial<Entretien>): Promise<Entretien> {
    const formData = new FormData();
    
    if (data.expert_nom) formData.append("expert_nom", data.expert_nom);
    if (data.expert_fonction) formData.append("expert_fonction", data.expert_fonction);
    if (data.domaine) formData.append("domaine", data.domaine);
    if (data.sensibilite) formData.append("sensibilite", data.sensibilite);
    if (data.transcription) formData.append("transcription", data.transcription);
    
    // Note: For file uploads, the caller should append the file directly to formData
    
    const response = await fetch(`${API_BASE_URL}/api/entretiens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async deleteEntretien(id: number): Promise<void> {
    await this.request(`/api/entretiens/${id}`, { method: 'DELETE' });
  }

  async transcrireEntretien(id: number): Promise<{ message: string; transcription?: string }> {
    return this.request(`/api/entretiens/${id}/transcrire`, { method: 'POST' });
  }

  async vectoriserEntretien(id: number): Promise<{ message: string; chunks?: number }> {
    return this.request(`/api/entretiens/${id}/vectoriser`, { method: 'POST' });
  }

  async queryKnowledgeBase(question: string, model?: string, domaine?: string, sensibilite_max?: string): Promise<{ answer: string; sources?: any[]; context_chunks?: number }> {
    return this.request('/api/query', {
      method: 'POST',
      body: JSON.stringify({ question, model, domaine, sensibilite_max }),
    });
  }

  async getAvailableModels(): Promise<{ default_model: string; available_models: string[] }> {
    return this.request('/api/models');
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