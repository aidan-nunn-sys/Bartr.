class BartrApp {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.currentComponent = null;
        this.loadedComponents = new Map();
        this.routes = {
            '/': 'homepage',
            '/marketplace': 'marketplace',
            '/profile': 'profile',
            '/login': 'auth/login',
            '/register': 'auth/register',
        };
        
        this.init();
    }

    init() {
        window.bartrApp = this;
        
        this.handleRoute();
        this.createLayout();
        
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const route = e.target.getAttribute('data-route');
                this.navigateTo(route);
            }
            
            // Also handle regular anchor tags with href
            if (e.target.matches('a[href]') && !e.target.matches('[data-route]')) {
                const href = e.target.getAttribute('href');
                if (href.startsWith('/') && !href.startsWith('//')) {
                    e.preventDefault();
                    this.navigateTo(href);
                }
            }
        });
    }

    createLayout() {
        this.appContainer.innerHTML = `
            <div id="page-content"></div>
        `;
    }

    handleRoute() {
        const path = window.location.pathname;
        const componentName = this.routes[path] || this.routes['/'];
        this.loadAndRenderComponent(componentName);
        this.updateNavigation(path);
    }

    navigateTo(path) {
        // Ensure path starts with /
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        window.history.pushState({}, '', path);
        this.handleRoute();
    }

    updateNavigation(activePath) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-route="${activePath}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    async loadAndRenderComponent(componentName) {
        try {
            const componentClass = await this.loadComponent(componentName);
            if (componentClass) {
                this.loadedComponents.set(componentName, componentClass);
                this.renderComponent(new componentClass());
            } else {
                console.error('Component not found:', componentName);
                this.showError(`Component '${componentName}' not found`);
            }
        } catch (error) {
            console.error(`Error loading component '${componentName}':`, error);
            this.showError(`Failed to load ${componentName} component`);
        }
    }

    async loadComponent(componentName) {
        try {
            const module = await import(`/js/components/${componentName}.js`);
            return module.default || module[`${this.capitalizeFirst(componentName)}Component`] || module[componentName];
        } catch (error) {
            console.error(`Error loading component '${componentName}':`, error);
            return null;
        }
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    renderComponent(component) {
        if (this.currentComponent && this.currentComponent.destroy) {
            this.currentComponent.destroy();
        }
        
        this.currentComponent = component;
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.innerHTML = '';
            
            if (component.render) {
                const element = component.render();
                if (element) {
                    pageContent.appendChild(element);
                }
            }
        }
    }

    showError(message) {
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.innerHTML = `
                <div style="padding: 20px; color: white; text-align: center; font-family: 'Courier New', monospace;">
                    <h2 style="text-transform: uppercase; letter-spacing: 2px;">Error</h2>
                    <p>${message}</p>
                    <button style="padding: 10px 20px; border: 2px solid white; background: transparent; color: white; cursor: pointer; font-family: 'Courier New', monospace; margin-top: 20px;" onclick="window.location.reload()">RELOAD PAGE</button>
                </div>
            `;
        }
    }

    addRoute(path, componentName) {
        this.routes[path] = componentName;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BartrApp();
});
