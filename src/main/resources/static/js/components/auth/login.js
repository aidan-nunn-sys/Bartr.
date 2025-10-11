import AuthService from '../../services/auth.service.js';

class LoginComponent {
    constructor() {
        this.state = {
            loading: false,
            error: null,
            passwordResetSent: false
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePasswordReset = this.handlePasswordReset.bind(this);
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
                    <h1 class="auth-title">Welcome Back</h1>
                    <p class="auth-subtitle">Log in to manage your trades</p>
                    <form id="login-form" class="auth-form">
                        <div class="form-group">
                            <label class="form-label" for="login-email">Email</label>
                            <input type="email" id="login-email" class="form-input" placeholder="you@example.com" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="login-password">Password</label>
                            <input type="password" id="login-password" class="form-input" placeholder="••••••••" required>
                        </div>
                        ${this.state.error ? `<div class="form-error">${this.state.error}</div>` : ''}
                        <button type="submit" class="form-btn form-btn-primary" ${this.state.loading ? 'disabled' : ''}>
                            ${this.state.loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                    <div class="auth-actions">
                        <button id="forgot-password-btn" class="link-button">Forgot password?</button>
                        <span class="auth-divider">•</span>
                        <a data-route="/register" class="link-button">Create account</a>
                    </div>
                    ${this.state.passwordResetSent ? '<div class="auth-success">Password reset email sent. Check your inbox.</div>' : ''}
                </div>
            </div>
        `;
    }

    bindEvents(container) {
        const form = container.querySelector('#login-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit);
        }

        const forgotPasswordBtn = container.querySelector('#forgot-password-btn');
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', this.handlePasswordReset);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const email = event.target.querySelector('#login-email').value.trim();
        const password = event.target.querySelector('#login-password').value;

        this.state.loading = true;
        this.state.error = null;
        this.updateForm(event.target.closest('.auth-wrapper'));

        try {
            await AuthService.login({ email, password });
            if (window.bartrApp) {
                window.bartrApp.navigateTo('/profile');
            }
        } catch (error) {
            console.error('Login failed:', error);
            this.state.error = 'Unable to sign in. Double check your email and password.';
        } finally {
            this.state.loading = false;
            this.updateForm(event.target.closest('.auth-wrapper'));
        }
    }

    async handlePasswordReset() {
        const emailField = document.querySelector('#login-email');
        const email = emailField ? emailField.value.trim() : '';
        if (!email) {
            this.state.error = 'Enter your email above to reset your password.';
            this.updateForm(document.querySelector('.auth-wrapper'));
            return;
        }

        try {
            await AuthService.requestPasswordReset(email);
            this.state.passwordResetSent = true;
            this.state.error = null;
        } catch (error) {
            console.error('Password reset failed:', error);
            this.state.error = 'Unable to send password reset right now.';
        }

        this.updateForm(document.querySelector('.auth-wrapper'));
    }

    updateForm(wrapper) {
        if (!wrapper) return;
        const parent = wrapper.parentElement;
        if (!parent) return;
        parent.innerHTML = this.getTemplate();
        this.bindEvents(parent);
    }

    destroy() {
        console.log('Login component destroyed');
    }
}

export default LoginComponent;
