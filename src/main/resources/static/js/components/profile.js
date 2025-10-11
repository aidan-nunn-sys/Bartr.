class ProfileComponent {
    constructor() {
        this.data = {
            user: {},
            listings: [],
            messages: []
        };
        this.isLoggedIn = false;
        this.init();
    }

    init() {
        this.handleEditProfile = this.handleEditProfile.bind(this);
        this.handleSaveProfile = this.handleSaveProfile.bind(this);
        this.handleCancelEdit = this.handleCancelEdit.bind(this);
        this.handleListingEdit = this.handleListingEdit.bind(this);
        this.handleListingDelete = this.handleListingDelete.bind(this);
        this.handleAddListing = this.handleAddListing.bind(this);
        this.handleMessageClick = this.handleMessageClick.bind(this);
        this.closeMessageModal = this.closeMessageModal.bind(this);
        this.handleSendReply = this.handleSendReply.bind(this);
        this.openListingPicker = this.openListingPicker.bind(this);
        this.closeListingPicker = this.closeListingPicker.bind(this);
        this.selectListingOffer = this.selectListingOffer.bind(this);
        this.removeOffer = this.removeOffer.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.switchToRegister = this.switchToRegister.bind(this);
        this.switchToLogin = this.switchToLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.currentListingIndex = 0;
        this.isEditing = false;
        this.attachedListing = null;
    }

    // Check if user is logged in (check for auth token/session)
    checkLoginStatus() {
        // Check for auth token in memory (not localStorage as per restrictions)
        // In a real app, this would validate with the server
        const authToken = window.APP_AUTH_TOKEN; // Store token in window object
        
        if (authToken) {
            this.isLoggedIn = true;
            this.loadUserData();
        } else {
            this.isLoggedIn = false;
        }
        
        return this.isLoggedIn;
    }

    render() {
        // Check login status before rendering
        this.checkLoginStatus();
        
        const container = document.createElement('div');
        container.className = 'profile-container';
        
        if (!this.isLoggedIn) {
            container.innerHTML = this.getLoginTemplate();
            this.setupLoginListeners(container);
        } else {
            container.innerHTML = this.getTemplate();
            this.setupEventListeners(container);
            
            setTimeout(() => {
                this.setupMessageModalListeners();
            }, 0);

            setTimeout(() => {
                this.loadArtContent();
            }, 0);
        }
        
        return container;
    }

    getLoginTemplate() {
        return `
            <div class="auth-wrapper">
                <a href="/" class="back-button">&lt;</a>
                <div class="auth-container">
                    <h1 class="auth-title">BARTR</h1>
                    <div class="auth-form" id="login-form">
                        <h2 class="auth-form-title">LOGIN</h2>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" id="login-email" placeholder="your@email.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" class="form-input" id="login-password" placeholder="••••••••">
                        </div>
                        <button class="auth-btn" id="login-btn">LOGIN</button>
                        <p class="auth-switch">
                            Don't have an account? <a href="#" id="switch-to-register">Register</a>
                        </p>
                    </div>
                    <div class="auth-form hidden" id="register-form">
                        <h2 class="auth-form-title">REGISTER</h2>
                        <div class="form-group">
                            <label class="form-label">Name</label>
                            <input type="text" class="form-input" id="register-name" placeholder="John Doe">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" id="register-email" placeholder="your@email.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Location</label>
                            <input type="text" class="form-input" id="register-location" placeholder="City, State">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" class="form-input" id="register-password" placeholder="••••••••">
                        </div>
                        <button class="auth-btn" id="register-btn">REGISTER</button>
                        <p class="auth-switch">
                            Already have an account? <a href="#" id="switch-to-login">Login</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    setupLoginListeners(container) {
        const loginBtn = container.querySelector('#login-btn');
        const registerBtn = container.querySelector('#register-btn');
        const switchToRegister = container.querySelector('#switch-to-register');
        const switchToLogin = container.querySelector('#switch-to-login');

        if (loginBtn) loginBtn.addEventListener('click', this.handleLogin);
        if (registerBtn) registerBtn.addEventListener('click', this.handleRegister);
        if (switchToRegister) switchToRegister.addEventListener('click', this.switchToRegister);
        if (switchToLogin) switchToLogin.addEventListener('click', this.switchToLogin);
    }

    handleLogin(e) {
        e.preventDefault();
        
        const email = document.querySelector('#login-email').value;
        const password = document.querySelector('#login-password').value;

        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        // In a real app, validate with server
        // For demo purposes, accept any credentials
        console.log('Login attempt:', { email });
        
        // Set auth token in memory
        window.APP_AUTH_TOKEN = 'demo-token-' + Date.now();
        this.isLoggedIn = true;
        this.loadUserData();
        
        // Re-render to show profile
        const container = document.querySelector('.profile-container');
        if (container && container.parentNode) {
            const newContainer = this.render();
            container.parentNode.replaceChild(newContainer, container);
        }
    }

    handleRegister(e) {
        e.preventDefault();
        
        const name = document.querySelector('#register-name').value;
        const email = document.querySelector('#register-email').value;
        const location = document.querySelector('#register-location').value;
        const password = document.querySelector('#register-password').value;

        if (!name || !email || !location || !password) {
            alert('Please fill in all fields');
            return;
        }

        // In a real app, create account on server
        console.log('Register attempt:', { name, email, location });
        
        // Set auth token and user data
        window.APP_AUTH_TOKEN = 'demo-token-' + Date.now();
        this.isLoggedIn = true;
        this.data.user = {
            name: name,
            location: location,
            email: email,
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            bio: "New member of the BARTR community!"
        };
        this.data.listings = [];
        this.data.messages = [];
        
        // Re-render to show profile
        const container = document.querySelector('.profile-container');
        if (container && container.parentNode) {
            const newContainer = this.render();
            container.parentNode.replaceChild(newContainer, container);
        }
    }

    switchToRegister(e) {
        e.preventDefault();
        document.querySelector('#login-form').classList.add('hidden');
        document.querySelector('#register-form').classList.remove('hidden');
    }

    switchToLogin(e) {
        e.preventDefault();
        document.querySelector('#register-form').classList.add('hidden');
        document.querySelector('#login-form').classList.remove('hidden');
    }

    handleLogout() {
        // Clear auth token
        window.APP_AUTH_TOKEN = null;
        this.isLoggedIn = false;
        this.data = {
            user: {},
            listings: [],
            messages: []
        };
        
        // Re-render to show login
        const container = document.querySelector('.profile-container');
        if (container && container.parentNode) {
            const newContainer = this.render();
            container.parentNode.replaceChild(newContainer, container);
        }
    }

    getTemplate() {
        const user = this.data.user;
        return `
            <div class="profile-wrapper">
                <a href="/" class="back-button">&lt;</a>
                <div id="profile-title-container"></div>
                <button class="logout-btn" id="logout-btn">LOGOUT</button>
                
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
            ${this.getMessageModalTemplate()}
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
            <div class="message-item ${msg.unread ? 'unread' : ''}" data-message-id="${msg.id}">
                <div class="message-header">
                    <span class="message-from">${msg.from}</span>
                    <span class="message-time">${msg.time}</span>
                </div>
                <div class="message-subject">RE: ${msg.listing}</div>
                <div class="message-preview">${msg.preview}</div>
                <button class="message-reply-btn" data-message-id="${msg.id}">VIEW & REPLY</button>
            </div>
        `).join('');
    }

    getMessageModalTemplate() {
        return `
            <div class="message-modal" id="message-modal">
                <div class="modal-overlay"></div>
                <div class="modal-content message-modal-content">
                    <button class="modal-close">&times;</button>
                    <div class="message-modal-body">
                        <div class="message-modal-header">
                            <h2 class="message-modal-title">MESSAGE</h2>
                            <div class="message-modal-meta">
                                <span class="message-modal-from"></span>
                                <span class="message-modal-time"></span>
                            </div>
                            <div class="message-modal-subject"></div>
                        </div>
                        <div class="message-modal-content-area">
                            <p class="message-modal-text"></p>
                        </div>
                        <div class="message-modal-reply">
                            <h3 class="reply-title">YOUR REPLY</h3>
                            <textarea class="reply-textarea" id="reply-text" rows="6" placeholder="Type your reply here..."></textarea>
                            
                            <div class="offer-section">
                                <button class="attach-offer-btn" id="attach-offer-btn">
                                    <span class="attach-icon">📎</span> ATTACH LISTING AS OFFER
                                </button>
                                <div class="attached-offer hidden" id="attached-offer">
                                    <div class="attached-offer-content">
                                        <div class="attached-offer-image"></div>
                                        <div class="attached-offer-info">
                                            <div class="attached-offer-title"></div>
                                            <div class="attached-offer-trade"></div>
                                        </div>
                                        <button class="remove-offer-btn" id="remove-offer-btn">&times;</button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="reply-actions">
                                <button class="modal-btn modal-btn-primary" id="send-reply-btn">SEND REPLY</button>
                                <button class="modal-btn" id="close-message-modal-btn">CLOSE</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="listing-picker-modal" id="listing-picker-modal">
                <div class="modal-overlay"></div>
                <div class="modal-content listing-picker-content">
                    <button class="modal-close">&times;</button>
                    <div class="listing-picker-body">
                        <h2 class="listing-picker-title">SELECT A LISTING TO OFFER</h2>
                        <div class="listing-picker-grid" id="listing-picker-grid"></div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners(container) {
        // Logout button
        const logoutBtn = container.querySelector('#logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', this.handleLogout);

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
            btn.addEventListener('click', (e) => {
                const messageId = parseInt(e.target.dataset.messageId);
                this.handleMessageClick(messageId);
            });
        });
    }

    setupMessageModalListeners() {
        const modal = document.querySelector('#message-modal');
        if (!modal) return;

        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const closeModalBtn = modal.querySelector('#close-message-modal-btn');
        const sendReplyBtn = modal.querySelector('#send-reply-btn');
        const attachOfferBtn = modal.querySelector('#attach-offer-btn');
        const removeOfferBtn = modal.querySelector('#remove-offer-btn');

        if (closeBtn) closeBtn.addEventListener('click', this.closeMessageModal);
        if (overlay) overlay.addEventListener('click', this.closeMessageModal);
        if (closeModalBtn) closeModalBtn.addEventListener('click', this.closeMessageModal);
        if (sendReplyBtn) sendReplyBtn.addEventListener('click', this.handleSendReply);
        if (attachOfferBtn) attachOfferBtn.addEventListener('click', this.openListingPicker);
        if (removeOfferBtn) removeOfferBtn.addEventListener('click', this.removeOffer);
        
        const pickerModal = document.querySelector('#listing-picker-modal');
        if (!pickerModal) return;
        
        const pickerCloseBtn = pickerModal.querySelector('.modal-close');
        const pickerOverlay = pickerModal.querySelector('.modal-overlay');
        
        if (pickerCloseBtn) pickerCloseBtn.addEventListener('click', this.closeListingPicker);
        if (pickerOverlay) pickerOverlay.addEventListener('click', this.closeListingPicker);
    }

    handleMessageClick(messageId) {
        const message = this.data.messages.find(m => m.id === messageId);
        if (!message) return;

        message.unread = false;
        
        const messageItem = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageItem) {
            messageItem.classList.remove('unread');
        }

        const modal = document.querySelector('#message-modal');
        if (!modal) return;

        modal.querySelector('.message-modal-from').textContent = `From: ${message.from}`;
        modal.querySelector('.message-modal-time').textContent = message.time;
        modal.querySelector('.message-modal-subject').textContent = `RE: ${message.listing}`;
        modal.querySelector('.message-modal-text').textContent = message.fullMessage || message.preview;
        
        const replyTextarea = modal.querySelector('#reply-text');
        if (replyTextarea) replyTextarea.value = '';

        modal.dataset.currentMessageId = messageId;

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('modal-open');
        }, 10);
    }

    closeMessageModal() {
        const modal = document.querySelector('#message-modal');
        if (!modal) return;

        modal.classList.add('modal-closing');
        modal.classList.remove('modal-open');

        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('modal-closing');
            
            this.attachedListing = null;
            const attachedOffer = document.querySelector('#attached-offer');
            const attachBtn = document.querySelector('#attach-offer-btn');
            
            if (attachedOffer && attachBtn) {
                attachedOffer.classList.add('hidden');
                attachBtn.classList.remove('hidden');
            }
        }, 300);
    }

    handleSendReply() {
        const modal = document.querySelector('#message-modal');
        if (!modal) return;

        const replyText = modal.querySelector('#reply-text').value.trim();
        const messageId = parseInt(modal.dataset.currentMessageId);

        if (!replyText) {
            alert('Please enter a reply message.');
            return;
        }

        const replyData = {
            messageId: messageId,
            text: replyText,
            attachedListing: this.attachedListing ? {
                id: this.attachedListing.id,
                title: this.attachedListing.title
            } : null
        };
        
        console.log('Sending reply:', replyData);
        
        alert(this.attachedListing 
            ? `Reply sent with offer: "${this.attachedListing.title}"!`
            : 'Reply sent successfully!');
        
        this.attachedListing = null;
        this.closeMessageModal();
    }

    openListingPicker() {
        const pickerModal = document.querySelector('#listing-picker-modal');
        if (!pickerModal) return;
        
        const grid = pickerModal.querySelector('#listing-picker-grid');
        if (!grid) return;
        
        if (this.data.listings.length === 0) {
            grid.innerHTML = '<div class="no-listings-picker">No listings available. Create a listing first!</div>';
        } else {
            grid.innerHTML = this.data.listings.map(listing => `
                <div class="listing-picker-item" data-listing-id="${listing.id}">
                    <div class="listing-picker-image" style="background-image: url('${listing.image}')"></div>
                    <div class="listing-picker-info">
                        <div class="listing-picker-title">${listing.title}</div>
                        <div class="listing-picker-trade">Trade for: ${listing.tradeFor}</div>
                    </div>
                </div>
            `).join('');
            
            grid.querySelectorAll('.listing-picker-item').forEach(item => {
                item.addEventListener('click', () => {
                    const listingId = parseInt(item.dataset.listingId);
                    this.selectListingOffer(listingId);
                });
            });
        }
        
        pickerModal.style.display = 'flex';
        setTimeout(() => {
            pickerModal.classList.add('modal-open');
        }, 10);
    }

    closeListingPicker() {
        const pickerModal = document.querySelector('#listing-picker-modal');
        if (!pickerModal) return;

        pickerModal.classList.add('modal-closing');
        pickerModal.classList.remove('modal-open');

        setTimeout(() => {
            pickerModal.style.display = 'none';
            pickerModal.classList.remove('modal-closing');
        }, 300);
    }

    selectListingOffer(listingId) {
        const listing = this.data.listings.find(l => l.id === listingId);
        if (!listing) return;
        
        this.attachedListing = listing;
        
        const attachedOffer = document.querySelector('#attached-offer');
        const attachBtn = document.querySelector('#attach-offer-btn');
        
        if (!attachedOffer || !attachBtn) return;
        
        attachedOffer.classList.remove('hidden');
        attachBtn.classList.add('hidden');
        
        const imageEl = attachedOffer.querySelector('.attached-offer-image');
        const titleEl = attachedOffer.querySelector('.attached-offer-title');
        const tradeEl = attachedOffer.querySelector('.attached-offer-trade');
        
        if (imageEl) imageEl.style.backgroundImage = `url('${listing.image}')`;
        if (titleEl) titleEl.textContent = listing.title;
        if (tradeEl) tradeEl.textContent = `Trade for: ${listing.tradeFor}`;
        
        this.closeListingPicker();
    }

    removeOffer() {
        this.attachedListing = null;
        
        const attachedOffer = document.querySelector('#attached-offer');
        const attachBtn = document.querySelector('#attach-offer-btn');
        
        if (attachedOffer && attachBtn) {
            attachedOffer.classList.add('hidden');
            attachBtn.classList.remove('hidden');
        }
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
        const name = document.querySelector('#edit-name').value;
        const location = document.querySelector('#edit-location').value;
        const email = document.querySelector('#edit-email').value;
        const bio = document.querySelector('#edit-bio').value;

        this.data.user.name = name;
        this.data.user.location = location;
        this.data.user.email = email;
        this.data.user.bio = bio;

        document.querySelector('#display-name').textContent = name;
        document.querySelector('#display-location').textContent = location;
        document.querySelector('#display-email').textContent = email;
        document.querySelector('#display-bio').textContent = bio;
        
        const avatar = document.querySelector('.avatar-placeholder');
        if (avatar) avatar.textContent = this.getInitials(name);

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
                fullMessage: "Hi! I'm interested in trading my laptop for your camera. Is it still available? I have a Dell XPS 15 from 2023 in excellent condition. It has 16GB RAM, 512GB SSD, and an i7 processor. I'm local to the downtown area and could meet up this week if you're interested. Let me know what you think!",
                time: "2 hours ago",
                unread: true
            },
            {
                id: 2,
                from: "Mike Johnson",
                listing: "Acoustic Guitar",
                preview: "I have a Yamaha keyboard I'd be willing to trade. Can we meet up?",
                fullMessage: "I have a Yamaha keyboard I'd be willing to trade. Can we meet up? It's a PSR-E373 model, barely used, with all the original accessories including the stand and power adapter. I've been looking for a good acoustic guitar for a while. Would love to see yours in person. Are you free this weekend?",
                time: "1 day ago",
                unread: true
            },
            {
                id: 3,
                from: "Emma Wilson",
                listing: "Book Collection",
                preview: "Thanks for the trade! The books are in great condition.",
                fullMessage: "Thanks for the trade! The books are in great condition. I really appreciate you being so flexible with the meeting time. The collection is even better than I expected. I'm already halfway through the first novel! If you ever want to trade again in the future, please don't hesitate to reach out. Happy reading!",
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