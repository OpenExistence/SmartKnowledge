/**
 * SmartKnowledge API Client
 */

const API_BASE = 'http://localhost:5000/api';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (response.status === 401) {
                this.logout();
                window.location.reload();
                return null;
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    async login(username, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (data) {
            this.token = data.token;
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Entretiens
    async getEntretiens() {
        return this.request('/entretiens');
    }

    async getEntretien(id) {
        return this.request(`/entretiens/${id}`);
    }

    async createEntretien(formData) {
        // Convert formData to multipart if file exists
        if (formData.has('fichier')) {
            return this.uploadEntretien(formData);
        }

        const data = await this.request('/entretiens', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData))
        });
        return data;
    }

    async uploadEntretien(formData) {
        const url = `${API_BASE}/entretiens`;
        
        const headers = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        // Note: Do NOT set Content-Type for FormData - browser does it automatically with boundary

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData
        });

        if (response.status === 401) {
            this.logout();
            window.location.reload();
            return null;
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }

        return data;
    }

    async deleteEntretien(id) {
        return this.request(`/entretiens/${id}`, {
            method: 'DELETE'
        });
    }

    async transcrireEntretien(id) {
        return this.request(`/entretiens/${id}/transcrire`, {
            method: 'POST'
        });
    }

    async vectoriserEntretien(id) {
        return this.request(`/entretiens/${id}/vectoriser`, {
            method: 'POST'
        });
    }

    async queryKnowledge(question, domaine = null, sensibiliteMax = "tres_secret") {
        return this.request('/query', {
            method: 'POST',
            body: JSON.stringify({
                question,
                domaine,
                sensibilite_max: sensibiliteMax
            })
        });
    }

    // User management (admin)
    async getUsers() {
        return this.request('/users');
    }

    async createUser(username, password, role = "user") {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify({ username, password, role })
        });
    }

    async updateUser(userId, data) {
        return this.request(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteUser(userId) {
        return this.request(`/users/${userId}`, {
            method: 'DELETE'
        });
    }
}

// Global API instance
const api = new ApiClient();
