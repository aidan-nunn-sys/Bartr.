import AuthService from '../services/auth.service.js';

class ProfileComponent {
    constructor() {
        this.container = null;
        this.data = {
            user: {},
            listings: [],
            messages: []
        };
        this.currentListingIndex = 0;
        this.isEditing = false;

        this.handleEditProfile = this.handleEditProfile.bind(this);
        this.handleSaveProfile = this.handleSaveProfile.bind(this);
        this.handleCancelEdit = this.handleCancelEdit.bind(this);
        this.handleListingEdit = this.handleListingEdit.bind(this);
        this.handleListingDelete = this.handleListingDelete.bind(this);
        this.handleAddListing = this.handleAddListing.bind(this);
        this.loadUserData();
    }

    render() {
        const container = document.createElement('div');
        container.className = 'profile-container';
        this.container = container;
        container.innerHTML = this.getTemplate();

        this.setupEventListeners(container);

        setTimeout(() => {
            this.loadArtContent();
        }, 0);

        return container;
    }

    getTemplate() {
        const user = this.data.user;

        if (!user || !user.firebaseUid) {
            return `
                <div class="profile-wrapper">
                    <a href="/" class="back-button">&lt;</a>
                    <div id="profile-title-container"></div>
                    <div class="profile-content">
                        <div class="profile-section">
                            <div class="section-header">
                                <h2 class="section-title">ACCOUNT</h2>
                            </div>
                            <div class="no-results">
                                <p>Sign in to manage your profile, listings, and trades.</p>
                                <div style="margin-top: 16px;">
                                    <a data-route="/login" class="link-button">Sign in</a>
                                    <span style="margin: 0 8px; color: #666;">or</span>
                                    <a data-route="/register" class="link-button">Create account</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="profile-wrapper">
                <a href="/" class="back-button">&lt;</a>
                <div id="profile-title-container"></div>
                
                <div class="profile-content">
                    <div class="profile-section">
                        <div class="section-header">
                            <h2 class="section-title">USER PROFILE</h2>
                            <button class="edit-btn" id="edit-profile-btn">EDIT</button>
                        </div>
                        <div class="user-info" id="user-info">
                            <div class="user-avatar">
                                <div class="avatar-placeholder">${this.getInitials(user.name)}</div>
                            </div>
                            <div class="user-details">
                                ${this.renderDetailRow('Name', user.name, 'display-name')}
                                ${this.renderDetailRow('Location', user.location, 'display-location')}
                                ${this.renderDetailRow('Email', user.email, 'display-email')}
                                ${this.renderDetailRow('Phone', user.phoneNumber || '—', 'display-phone')}
                                ${this.renderDetailRow('Member Since', user.joinedDate, 'display-joined')}
                                ${this.renderDetailRow('Bio', user.bio || 'Add a bio to share more about you.', 'display-bio')}
                            </div>
                        </div>
                        <div class="user-info-edit hidden" id="user-info-edit">
                            <div class="edit-form">
                                ${this.renderInput('Name', 'text', 'edit-name', user.name)}
                                ${this.renderInput('Location', 'text', 'edit-location', user.location || '')}
                                ${this.renderInput('Email', 'email', 'edit-email', user.email, true)}
                                ${this.renderInput('Phone', 'tel', 'edit-phone', user.phoneNumber || '')}
                                ${this.renderTextarea('Bio', 'edit-bio', user.bio || '')}
                                <div class="form-actions">
                                    <button class="form-btn form-btn-primary" id="save-profile-btn">SAVE</button>
                                    <button class="form-btn form-btn-secondary" id="cancel-edit-btn">CANCEL</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="profile-section">
                        <div class="section-header">
                            <h2 class="section-title">MY LISTINGS (${this.data.listings.length})</h2>
                            <button class="edit-btn" id="add-listing-btn">+ ADD</button>
                        </div>
                        <div class="listings-carousel">
                            ${this.data.listings.length > 0 ? this.getCarouselTemplate() : '<div class="no-listings">No listings yet. Add your first listing!</div>'}
                        </div>
                    </div>

                    <div class="profile-section">
                        <div class="section-header">
                            <h2 class="section-title">MESSAGES (${this.data.messages.length})</h2>
                        </div>
                        <div class="messages-list">
                            ${this.getMessagesTemplate()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDetailRow(label, value, id) {
        return `
            <div class="detail-row">
                <span class="detail-label">${label}:</span>
                <span class="detail-value" id="${id}">${value || '—'}</span>
            </div>
        `;
    }

    renderInput(label, type, id, value, disabled = false) {
        return `
            <div class="form-group">
                <label class="form-label">${label}</label>
                <input type="${type}" class="form-input" id="${id}" value="${value || ''}" ${disabled ? 'disabled' : ''}>
            </div>
        `;
    }

    renderTextarea(label, id, value) {
        return `
            <div class="form-group">
                <label class="form-label">${label}</label>
                <textarea class="form-textarea" id="${id}" rows="4">${value}</textarea>
            </div>
        `;
    }

    setupEventListeners(container) {
        const editBtn = container.querySelector('#edit-profile-btn');
        if (editBtn) editBtn.addEventListener('click', this.handleEditProfile);

        const saveBtn = container.querySelector('#save-profile-btn');
        if (saveBtn) saveBtn.addEventListener('click', this.handleSaveProfile);

        const cancelBtn = container.querySelector('#cancel-edit-btn');
        if (cancelBtn) cancelBtn.addEventListener('click', this.handleCancelEdit);

        const prevBtn = container.querySelector('.carousel-prev');
        const nextBtn = container.querySelector('.carousel-next');
        if (prevBtn) prevBtn.addEventListener('click', () => this.navigateCarousel(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.navigateCarousel(1));

        const indicators = container.querySelectorAll('.indicator');
        indicators.forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                this.currentListingIndex = parseInt(e.target.dataset.index, 10);
                this.updateCarousel(container);
            });
        });

        const actionBtns = container.querySelectorAll('.carousel-action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const id = e.target.dataset.id;
                if (action === 'edit') {
                    this.handleListingEdit(id);
                } else if (action === 'delete') {
                    this.handleListingDelete(id);
                }
            });
        });

        const addListingBtn = container.querySelector('#add-listing-btn');
        if (addListingBtn) addListingBtn.addEventListener('click', this.handleAddListing);
    }

    getCarouselTemplate() {
        if (this.data.listings.length === 0) return '';

        const listing = this.data.listings[this.currentListingIndex];
        return `
            <div class="carousel-container">
                <button class="carousel-btn carousel-prev" ${this.data.listings.length <= 1 ? 'disabled' : ''}>‹</button>
                <div class="carousel-content">
                    <div class="carousel-image" style="background-image: url('${listing.image}')"></div>
                    <div class="carousel-info">
                        <h3 class="carousel-title">${listing.title}</h3>
                        <p class="carousel-description">${listing.description}</p>
                        <div class="carousel-meta">
                            <span class="carousel-category">${listing.category}</span>
                            <span class="carousel-status">${listing.status || 'Active'}</span>
                        </div>
                        <div class="carousel-trade">
                            <span class="trade-label">Trade for:</span>
                            <span class="trade-value">${listing.tradeFor}</span>
                        </div>
                        <div class="carousel-actions">
                            <button class="carousel-action-btn" data-action="edit" data-id="${listing.id}">EDIT</button>
                            <button class="carousel-action-btn carousel-delete" data-action="delete" data-id="${listing.id}">DELETE</button>
                        </div>
                    </div>
                </div>
                <button class="carousel-btn carousel-next" ${this.data.listings.length <= 1 ? 'disabled' : ''}>›</button>
            </div>
            <div class="carousel-indicators">
                ${this.data.listings.map((_, index) => 
                    `<span class="indicator ${index === this.currentListingIndex ? 'active' : ''}" data-index="${index}"></span>`
                ).join('')}
            </div>
        `;
    }

    getMessagesTemplate() {
        if (this.data.messages.length === 0) {
            return '<div class="no-messages">No messages yet.</div>';
        }

        return this.data.messages.map(msg => `
            <div class="message-item ${msg.unread ? 'unread' : ''}">
                <div class="message-header">
                    <span class="message-from">${msg.from}</span>
                    <span class="message-time">${msg.time}</span>
                </div>
                <div class="message-subject">RE: ${msg.listing}</div>
                <div class="message-preview">${msg.preview}</div>
                <button class="message-reply-btn">REPLY</button>
            </div>
        `).join('');
    }

    handleEditProfile() {
        this.isEditing = true;
        if (!this.container) return;
        const displayInfo = this.container.querySelector('#user-info');
        const editInfo = this.container.querySelector('#user-info-edit');
        const editBtn = this.container.querySelector('#edit-profile-btn');

        if (displayInfo && editInfo && editBtn) {
            displayInfo.classList.add('hidden');
            editInfo.classList.remove('hidden');
            editBtn.style.display = 'none';
        }
    }

    async handleSaveProfile() {
        if (!this.container) return;
        const name = this.container.querySelector('#edit-name').value.trim();
        const location = this.container.querySelector('#edit-location').value.trim();
        const bio = this.container.querySelector('#edit-bio').value.trim();
        const phoneNumber = this.container.querySelector('#edit-phone').value.trim();

        try {
            const updated = await AuthService.updateProfile({
                name,
                location,
                bio,
                phoneNumber
            });
            this.data.user = this.normalizeUser(updated);
            this.handleCancelEdit();
            this.refreshProfileView();
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Unable to save your profile. Please try again.');
        }
    }

    handleCancelEdit() {
        this.isEditing = false;
        if (!this.container) return;
        const displayInfo = this.container.querySelector('#user-info');
        const editInfo = this.container.querySelector('#user-info-edit');
        const editBtn = this.container.querySelector('#edit-profile-btn');

        if (displayInfo && editInfo && editBtn) {
            displayInfo.classList.remove('hidden');
            editInfo.classList.add('hidden');
            editBtn.style.display = 'block';
        }
    }

    navigateCarousel(direction) {
        const newIndex = this.currentListingIndex + direction;
        if (newIndex >= 0 && newIndex < this.data.listings.length) {
            this.currentListingIndex = newIndex;
            this.updateCarousel(this.container);
        }
    }

    updateCarousel(container) {
        if (!container) return;
        const carouselContainer = container.querySelector('.listings-carousel');
        if (carouselContainer) {
            carouselContainer.innerHTML = this.getCarouselTemplate();
            this.setupEventListeners(container);
        }
    }

    handleListingEdit(id) {
        console.log('Edit listing:', id);
        alert('Edit listing functionality - opens modal with edit form');
    }

    handleListingDelete(id) {
        if (confirm('Are you sure you want to delete this listing?')) {
            this.data.listings = this.data.listings.filter(l => l.id !== parseInt(id, 10));
            if (this.currentListingIndex >= this.data.listings.length) {
                this.currentListingIndex = Math.max(0, this.data.listings.length - 1);
            }
            this.updateCarousel(this.container);
            console.log('Listing deleted:', id);
        }
    }

    handleAddListing() {
        alert('Add listing functionality coming soon.');
    }

    getInitials(name) {
        if (!name) return '??';
        const names = name.split(' ');
        if (names.length === 1) return name.substring(0, 2).toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }

    async loadUserData() {
        try {
            const cached = AuthService.getCachedUser();
            if (cached) {
                this.data.user = this.normalizeUser(cached);
                this.refreshProfileView();
            }
            const profile = await AuthService.fetchProfile();
            this.data.user = this.normalizeUser(profile);
            this.refreshProfileView();
        } catch (error) {
            console.warn('Profile unavailable. User may need to log in.', error);
            this.data.user = {};
            this.refreshProfileView();
        }

        // TODO: Wire listings and messages to authenticated API endpoints.
        this.data.listings = [];
        this.data.messages = [];
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
        if (this.container) {
            this.container.innerHTML = '';
        }
        console.log('Profile component destroyed');
    }

    normalizeUser(user) {
        if (!user) return {};
        return {
            ...user,
            joinedDate: user.joinedDate ? this.formatJoinDate(user.joinedDate) : '—'
        };
    }

    formatJoinDate(dateValue) {
        try {
            const date = new Date(dateValue);
            if (Number.isNaN(date.getTime())) {
                return dateValue;
            }
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long'
            });
        } catch (error) {
            return dateValue;
        }
    }

    refreshProfileView() {
        if (!this.container) {
            return;
        }
        this.container.innerHTML = this.getTemplate();
        this.setupEventListeners(this.container);
    }
}

export default ProfileComponent;
