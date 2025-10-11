import ApiService from './api.service.js';

class AuthClientService {
    static USER_STORAGE_KEY = 'bartr_current_user';

    static getCachedUser() {
        if (typeof window === 'undefined' || !window.localStorage) {
            return null;
        }
        const raw = window.localStorage.getItem(this.USER_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    static persistAuthState(authResponse) {
        if (!authResponse) {
            return;
        }
        ApiService.setTokens({
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken
        });
        if (authResponse.user && typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(authResponse.user));
        }
    }

    static clearAuthState() {
        ApiService.clearTokens();
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(this.USER_STORAGE_KEY);
        }
    }

    static async register(payload) {
        const response = await ApiService.post('/auth/register', payload);
        this.persistAuthState(response);
        return response;
    }

    static async login(payload) {
        const response = await ApiService.post('/auth/login', payload);
        this.persistAuthState(response);
        return response;
    }

    static async logout() {
        try {
            await ApiService.post('/auth/logout');
        } catch (error) {
            console.warn('Logout request failed or was skipped.', error);
        } finally {
            this.clearAuthState();
        }
    }

    static async requestPasswordReset(email) {
        return ApiService.post('/auth/password-reset', { email });
    }

    static async fetchProfile() {
        const profile = await ApiService.get('/auth/me');
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(profile));
        }
        return profile;
    }

    static async updateProfile(payload) {
        const updated = await ApiService.put('/auth/me', payload);
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
    }

    static async updatePassword(newPassword) {
        const query = new URLSearchParams({ newPassword }).toString();
        return ApiService.post(`/auth/me/password?${query}`);
    }
}

export default AuthClientService;
