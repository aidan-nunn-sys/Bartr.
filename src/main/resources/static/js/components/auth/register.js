import AuthService from '../../services/auth.service.js';

class RegisterComponent {
    constructor() {
        this.state = {
            loading: false,
            error: null
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    render() {
        const container = document.createElement('div');
        container.className = 'auth-container';
        container.innerHTML = this.getTemplate();
        this.bindEvents(container);
        return container;
    }

    getTemplate() {
        return `
            <div class="auth-wrapper">
                <a href="/" class="back-button">&lt;</a>
                <div class="auth-card">
                    <h1 class="auth-title">Join Bartr</h1>
                    <p class="auth-subtitle">Create an account to start trading</p>
                    <form id="register-form" class="auth-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="register-name">Name</label>
                                <input type="text" id="register-name" class="form-input" placeholder="Alex Trader" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="register-location">Location</label>
                                <input type="text" id="register-location" class="form-input" placeholder="Downtown">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="register-email">Email</label>
                                <input type="email" id="register-email" class="form-input" placeholder="you@example.com" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="register-phone">Phone</label>
                                <input type="tel" id="register-phone" class="form-input" placeholder="+1 555 000 0000">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="register-password">Password</label>
                            <input type="password" id="register-password" class="form-input" placeholder="At least 6 characters" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="register-bio">About You</label>
                            <textarea id="register-bio" class="form-textarea" rows="3" placeholder="What do you love to trade?"></textarea>
                        </div>
                        ${this.state.error ? `<div class="form-error">${this.state.error}</div>` : ''}
                        <button type="submit" class="form-btn form-btn-primary" ${this.state.loading ? 'disabled' : ''}>
                            ${this.state.loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>
                    <div class="auth-actions">
                        <span>Already trading?</span>
                        <a data-route="/login" class="link-button">Sign in</a>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents(container) {
        const form = container.querySelector('#register-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const payload = {
            name: form.querySelector('#register-name').value.trim(),
            location: form.querySelector('#register-location').value.trim(),
            email: form.querySelector('#register-email').value.trim(),
            phoneNumber: form.querySelector('#register-phone').value.trim(),
            password: form.querySelector('#register-password').value,
            bio: form.querySelector('#register-bio').value.trim()
        };

        if (!payload.password || payload.password.length < 6) {
            this.state.error = 'Password must be at least 6 characters.';
            this.updateForm(form.closest('.auth-wrapper'));
            return;
        }

        this.state.loading = true;
        this.state.error = null;
        this.updateForm(form.closest('.auth-wrapper'));

        try {
            await AuthService.register(payload);
            if (window.bartrApp) {
                window.bartrApp.navigateTo('/profile');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            this.state.error = error.message || 'Unable to create your account right now.';
        } finally {
            this.state.loading = false;
            this.updateForm(form.closest('.auth-wrapper'));
        }
    }

    updateForm(wrapper) {
        if (!wrapper) return;
        const parent = wrapper.parentElement;
        if (!parent) return;
        parent.innerHTML = this.getTemplate();
        this.bindEvents(parent);
    }

    destroy() {
        console.log('Register component destroyed');
    }
}

export default RegisterComponent;
