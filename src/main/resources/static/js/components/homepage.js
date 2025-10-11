class HomepageComponent {
    constructor() {
        this.data = {
            options: [
                {
                    id: 'marketplace',
                    name: 'Marketplace'
                },
                {
                    id: 'profile',
                    name: 'Profile'
                },
                {
                    id: 'messages',
                    name: 'Messages'
                },
                {
                    id: 'login',
                    name: 'Login'
                },
                {
                    id: 'register',
                    name: 'Register'
                }
            ]
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
    }

    render() {
        const container = document.createElement('div');
        container.className = 'homepage-container';
        container.innerHTML = this.getTemplate();
        
        setTimeout(() => {
            this.loadArtContent();
            this.bindEvents();
        }, 0);
        
        return container;
    }

    getTemplate() {
        return `
            <div class="homepage-container">
                <div id="bartr-title-container"></div>
                <div class="options-grid">
                    ${this.data.options.map(option => `
                        <button class="select-button" data-route="${option.id}">
                            ${option.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async loadArtContent() {
        try {
            const artModule = await import('/js/components/art/titleArt.js');
            
            if (typeof artModule.default === 'function') {
                artModule.default();
            }
        } catch (error) {
            console.error('Failed to load art.js:', error);
        }
    }

    bindEvents() {
        const optionCards = document.querySelectorAll('.option-card');
        optionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const optionId = e.currentTarget.dataset.route;
                this.handleOptionClick(optionId);
            });
        });

        const selectButtons = document.querySelectorAll('.select-button');
        selectButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const optionId = e.currentTarget.dataset.route;
                this.handleOptionClick(optionId);
            });
        });
    }

    handleOptionClick(optionId) {
        console.log(`Option clicked: ${optionId}`);
        
        if (window.bartrApp) {
            window.bartrApp.navigateTo(`/${optionId}`);
        } else {
            alert(`${this.data.options.find(g => g.id === optionId).name} is coming soon!`);
        }
    }

    destroy() {
        console.log('Homepage component destroyed');
    }
}

export default HomepageComponent;