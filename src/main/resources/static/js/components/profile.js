class ProfileComponent {
    constructor() {
        this.data = {
            user: {},
            listings: [],
            messages: []
        };
        
        this.init();
    }

    init() {
        this.handleEditProfile = this.handleEditProfile.bind(this);
        this.handleSaveProfile = this.handleSaveProfile.bind(this);
        this.handleCancelEdit = this.handleCancelEdit.bind(this);
        this.handleListingEdit = this.handleListingEdit.bind(this);
        this.handleListingDelete = this.handleListingDelete.bind(this);
        this.handleAddListing = this.handleAddListing.bind(this);
        this.currentListingIndex = 0;
        this.isEditing = false;
        this.loadUserData();
    }

    render() {
        const container = document.createElement('div');
        container.className = 'profile-container';
        container.innerHTML = this.getTemplate();

        this.setupEventListeners(container);

        setTimeout(() => {
            this.loadArtContent();
        }, 0);
        
        return container;
    }

    getTemplate() {
        const user = this.data.user;
        return `
            <div class="profile-wrapper">
                <a href="/" class="back-button">&lt;</a>
                <div id="profile-title-container"></div>
                
                <div class="profile-content">
                    <!-- User Info Section -->
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
                                <div class="detail-row">
                                    <span class="detail-label">Name:</span>
                                    <span class="detail-value" id="display-name">${user.name}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Location:</span>
                                    <span class="detail-value" id="display-location">${user.location}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Email:</span>
                                    <span class="detail-value" id="display-email">${user.email}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Member Since:</span>
                                    <span class="detail-value" id="display-joined">${user.joinedDate}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Bio:</span>
                                    <span class="detail-value" id="display-bio">${user.bio}</span>
                                </div>
                            </div>
                        </div>
                        <div class="user-info-edit hidden" id="user-info-edit">
                            <div class="edit-form">
                                <div class="form-group">
                                    <label class="form-label">Name</label>
                                    <input type="text" class="form-input" id="edit-name" value="${user.name}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Location</label>
                                    <input type="text" class="form-input" id="edit-location" value="${user.location}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" id="edit-email" value="${user.email}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Bio</label>
                                    <textarea class="form-textarea" id="edit-bio" rows="4">${user.bio}</textarea>
                                </div>
                                <div class="form-actions">
                                    <button class="form-btn form-btn-primary" id="save-profile-btn">SAVE</button>
                                    <button class="form-btn form-btn-secondary" id="cancel-edit-btn">CANCEL</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Listings Carousel Section -->
                    <div class="profile-section">
                        <div class="section-header">
                            <h2 class="section-title">MY LISTINGS (${this.data.listings.length})</h2>
                            <button class="edit-btn" id="add-listing-btn">+ ADD</button>
                        </div>
                        <div class="listings-carousel">
                            ${this.data.listings.length > 0 ? this.getCarouselTemplate() : '<div class="no-listings">No listings yet. Add your first listing!</div>'}
                        </div>
                    </div>

                    <!-- Messages Section -->
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
                            <span class="carousel-status">${listing.status}</span>
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

    setupEventListeners(container) {
        // Edit profile button
        const editBtn = container.querySelector('#edit-profile-btn');
        if (editBtn) editBtn.addEventListener('click', this.handleEditProfile);

        // Save profile button
        const saveBtn = container.querySelector('#save-profile-btn');
        if (saveBtn) saveBtn.addEventListener('click', this.handleSaveProfile);

        // Cancel edit button
        const cancelBtn = container.querySelector('#cancel-edit-btn');
        if (cancelBtn) cancelBtn.addEventListener('click', this.handleCancelEdit);

        // Carousel navigation
        const prevBtn = container.querySelector('.carousel-prev');
        const nextBtn = container.querySelector('.carousel-next');
        if (prevBtn) prevBtn.addEventListener('click', () => this.navigateCarousel(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.navigateCarousel(1));

        // Carousel indicators
        const indicators = container.querySelectorAll('.indicator');
        indicators.forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                this.currentListingIndex = parseInt(e.target.dataset.index);
                this.updateCarousel(container);
            });
        });

        // Listing actions
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

        // Add listing button
        const addBtn = container.querySelector('#add-listing-btn');
        if (addBtn) addBtn.addEventListener('click', this.handleAddListing);

        // Message reply buttons
        const replyBtns = container.querySelectorAll('.message-reply-btn');
        replyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                alert('Reply functionality coming soon!');
            });
        });
    }

    handleEditProfile() {
        this.isEditing = true;
        const displayInfo = document.querySelector('#user-info');
        const editInfo = document.querySelector('#user-info-edit');
        const editBtn = document.querySelector('#edit-profile-btn');
        
        if (displayInfo && editInfo && editBtn) {
            displayInfo.classList.add('hidden');
            editInfo.classList.remove('hidden');
            editBtn.style.display = 'none';
        }
    }

    handleSaveProfile() {
        // Get form values
        const name = document.querySelector('#edit-name').value;
        const location = document.querySelector('#edit-location').value;
        const email = document.querySelector('#edit-email').value;
        const bio = document.querySelector('#edit-bio').value;

        // Update user data
        this.data.user.name = name;
        this.data.user.location = location;
        this.data.user.email = email;
        this.data.user.bio = bio;

        // Update display
        document.querySelector('#display-name').textContent = name;
        document.querySelector('#display-location').textContent = location;
        document.querySelector('#display-email').textContent = email;
        document.querySelector('#display-bio').textContent = bio;
        
        // Update avatar initials
        const avatar = document.querySelector('.avatar-placeholder');
        if (avatar) avatar.textContent = this.getInitials(name);

        // Toggle back to display mode
        this.handleCancelEdit();

        console.log('Profile saved:', this.data.user);
    }

    handleCancelEdit() {
        this.isEditing = false;
        const displayInfo = document.querySelector('#user-info');
        const editInfo = document.querySelector('#user-info-edit');
        const editBtn = document.querySelector('#edit-profile-btn');
        
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
            this.updateCarousel(document.querySelector('.profile-container'));
        }
    }

    updateCarousel(container) {
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
            this.data.listings = this.data.listings.filter(l => l.id !== parseInt(id));
            if (this.currentListingIndex >= this.data.listings.length) {
                this.currentListingIndex = Math.max(0, this.data.listings.length - 1);
            }
            this.updateCarousel(document.querySelector('.profile-container'));
            console.log('Listing deleted:', id);
        }
    }

    handleAddListing() {
        console.log('Add new listing');
        alert('Add listing functionality - opens modal with creation form');
    }

    getInitials(name) {
        if (!name) return '??';
        const names = name.split(' ');
        if (names.length === 1) return name.substring(0, 2).toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }

    loadUserData() {
        // Mock data - replace with actual API call
        this.data.user = {
            name: "John Trader",
            location: "Downtown",
            email: "john@bartr.com",
            joinedDate: "January 2025",
            bio: "Avid trader and collector. Always looking for vintage electronics and retro games."
        };

        this.data.listings = [
            {
                id: 1,
                title: "Vintage Camera",
                description: "Classic 35mm film camera in excellent condition",
                image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop",
                category: "Electronics",
                tradeFor: "Laptop or bicycle",
                status: "Active"
            },
            {
                id: 2,
                title: "Acoustic Guitar",
                description: "Yamaha acoustic guitar with case and picks",
                image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop",
                category: "Electronics",
                tradeFor: "Keyboard or audio equipment",
                status: "Active"
            },
            {
                id: 3,
                title: "Book Collection",
                description: "50+ classic novels and modern fiction",
                image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop",
                category: "Home",
                tradeFor: "Board games or vinyl records",
                status: "Pending"
            }
        ];

        this.data.messages = [
            {
                id: 1,
                from: "Sarah M.",
                listing: "Vintage Camera",
                preview: "Hi! I'm interested in trading my laptop for your camera. Is it still available?",
                time: "2 hours ago",
                unread: true
            },
            {
                id: 2,
                from: "Mike Johnson",
                listing: "Acoustic Guitar",
                preview: "I have a Yamaha keyboard I'd be willing to trade. Can we meet up?",
                time: "1 day ago",
                unread: true
            },
            {
                id: 3,
                from: "Emma Wilson",
                listing: "Book Collection",
                preview: "Thanks for the trade! The books are in great condition.",
                time: "3 days ago",
                unread: false
            }
        ];
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