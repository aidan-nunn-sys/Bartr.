class ProfileComponent {
    constructor() {
        this.data = {
        };
        
        this.init();
    }

    init() {}

    render() {
        const container = document.createElement('div');
        container.className = 'profile-container';
        container.innerHTML = this.getTemplate();

        setTimeout(() => {
            this.loadArtContent();
        }, 0);
        
        return container;
    }

    getTemplate() {
        return `
            <div class="profile-container">
                <a href="/" class="back-button">&lt;</a>

                <div id="profile-title-container"></div>
                <h1 class="coming-soon"> Coming Soon! </h1>
            </div>
        `;
    }

    async loadArtContent() {
        try {
            const artModule = await import('/js/components/art/profileArt.js');
            
            if (typeof artModule.default === 'function') {
                artModule.default();
            }
        } catch (error) {
            console.error('Failed to load art.js:', error);
        }
    }

    destroy() {
        console.log('Profile component destroyed');
    }
}

export default ProfileComponent;
