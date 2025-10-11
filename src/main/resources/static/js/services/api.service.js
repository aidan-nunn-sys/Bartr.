class ApiService {
    static BASE_URL = '/api';
    static ACCESS_TOKEN_KEY = 'bartr_access_token';
    static REFRESH_TOKEN_KEY = 'bartr_refresh_token';
    static accessToken = null;
    static refreshToken = null;

    static init() {
        if (typeof window === 'undefined' || !window.localStorage) {
            return;
        }
        if (!this.accessToken) {
            this.accessToken = window.localStorage.getItem(this.ACCESS_TOKEN_KEY);
        }
        if (!this.refreshToken) {
            this.refreshToken = window.localStorage.getItem(this.REFRESH_TOKEN_KEY);
        }
    }

    static setTokens(tokens = {}) {
        const { accessToken, refreshToken } = tokens;
        this.accessToken = accessToken || null;
        this.refreshToken = refreshToken || null;

        if (typeof window !== 'undefined' && window.localStorage) {
            if (accessToken) {
                window.localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
            } else {
                window.localStorage.removeItem(this.ACCESS_TOKEN_KEY);
            }

            if (refreshToken) {
                window.localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
            } else {
                window.localStorage.removeItem(this.REFRESH_TOKEN_KEY);
            }
        }
    }

    static clearTokens() {
        this.setTokens({});
    }

    static getAccessToken() {
        return this.accessToken;
    }

    static buildHeaders(hasBody, extraHeaders = {}) {
        const headers = { ...extraHeaders };
        if (hasBody) {
            headers['Content-Type'] = 'application/json';
        }
        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        return headers;
    }

    static createOptions(method, data, extraHeaders = {}) {
        const hasBody = data !== undefined && data !== null;
        const options = {
            method,
            headers: this.buildHeaders(hasBody, extraHeaders)
        };

        if (hasBody) {
            options.body = JSON.stringify(data);
        }
        return options;
    }

    static async handleResponse(response) {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        if (response.status === 204 || response.status === 202) {
            return null;
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            return null;
        }

        try {
            return await response.json();
        } catch (error) {
            console.warn('Failed to parse JSON response:', error);
            return null;
        }
    }

    static async get(endpoint) {
        this.init();
        const response = await fetch(`${this.BASE_URL}${endpoint}`, this.createOptions('GET'));
        return this.handleResponse(response);
    }

    static async post(endpoint, data, headers = {}) {
        this.init();
        const response = await fetch(
            `${this.BASE_URL}${endpoint}`,
            this.createOptions('POST', data, headers)
        );
        return this.handleResponse(response);
    }

    static async put(endpoint, data) {
        this.init();
        const response = await fetch(`${this.BASE_URL}${endpoint}`, this.createOptions('PUT', data));
        return this.handleResponse(response);
    }

    static async patch(endpoint, data) {
        this.init();
        const response = await fetch(`${this.BASE_URL}${endpoint}`, this.createOptions('PATCH', data));
        return this.handleResponse(response);
    }

    static async delete(endpoint) {
        this.init();
        const response = await fetch(`${this.BASE_URL}${endpoint}`, this.createOptions('DELETE'));
        await this.handleResponse(response);
        return true;
    }
}

ApiService.init();

export default ApiService;
