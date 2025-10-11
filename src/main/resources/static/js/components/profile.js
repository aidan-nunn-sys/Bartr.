import AuthService from '../services/auth.service.js';
import MessagesService from '../services/messages.service.js';

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
        this.attachedListing = null;
        this.hasInitializedData = false;
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

        if (!this.hasInitializedData) {
            this.initializeData();
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

        this.bindMessageButtons(container);
    }

    bindMessageButtons(container) {
        const replyBtns = container.querySelectorAll('.message-reply-btn');
        replyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const messageId = parseInt(e.currentTarget.dataset.messageId);
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
        
        if (pickerCloseBtn) {
            pickerCloseBtn.addEventListener('click', () => {
                console.log('Picker close button clicked');
                this.closeListingPicker();
            });
        }
        if (pickerOverlay) {
            pickerOverlay.addEventListener('click', () => {
                console.log('Picker overlay clicked');
                this.closeListingPicker();
            });
        }
        
        console.log('Message modal listeners setup complete');
    }

    async handleMessageClick(messageId) {
        const message = this.data.messages.find(m => m.id === messageId);
        if (!message) return;

        if (message.unread && message.receiverId === this.data.user?.id) {
            try {
                await MessagesService.markAsRead(message.id);
                message.unread = false;
                const messageItem = document.querySelector(`[data-message-id="${messageId}"]`);
                if (messageItem) {
                    messageItem.classList.remove('unread');
                }
            } catch (error) {
                console.warn('Failed to mark message as read.', error);
            }
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
        modal.dataset.listingId = message.listingId;
        modal.dataset.counterpartId = message.counterpartId;
        modal.dataset.counterpartName = message.counterpartName;

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

    async handleSendReply() {
        const modal = document.querySelector('#message-modal');
        if (!modal) return;

        const replyText = modal.querySelector('#reply-text').value.trim();
        const messageId = parseInt(modal.dataset.currentMessageId);
        const listingId = parseInt(modal.dataset.listingId);
        const counterpartId = parseInt(modal.dataset.counterpartId);

        if (!replyText) {
            alert('Please enter a reply message.');
            return;
        }

        if (!listingId || !counterpartId) {
            alert('Unable to send this reply because the conversation is incomplete.');
            return;
        }

        try {
            await MessagesService.sendMessage({
                listingId,
                receiverId: counterpartId,
                content: replyText
            });

            if (this.attachedListing) {
                console.log('Listing offer attached to message', this.attachedListing.id);
            }

            alert('Reply sent successfully!');
            this.attachedListing = null;
            this.closeMessageModal();
            await this.loadMessagePreviews();
        } catch (error) {
            console.error('Failed to send reply', error);
            alert('Unable to send your reply right now. Please try again.');
        }
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

    async initializeData() {
        if (this.hasInitializedData) {
            return;
        }
        this.hasInitializedData = true;
        await this.loadUserProfile();
        await this.loadMessagePreviews();
    }

    async loadUserProfile() {
        try {
            const cachedUser = AuthService.getCachedUser();
            if (cachedUser) {
                this.data.user = this.normalizeUser(cachedUser);
            }

            const profile = await AuthService.fetchProfile();
            if (profile) {
                this.data.user = this.normalizeUser(profile);
            }
        } catch (error) {
            console.warn('Unable to load user profile.', error);
            this.data.user = this.data.user || {};
        }

        this.refreshProfileView();
    }

    async loadMessagePreviews() {
        if (!this.data.user || !this.data.user.id) {
            this.data.messages = [];
            this.refreshMessagesSection();
            return;
        }

        try {
            const inbox = await MessagesService.fetchInbox();
            const previews = (inbox || []).slice(0, 5).map(message => {
                const isReceiver = message.receiverId === this.data.user.id;
                const counterpartName = isReceiver ? message.senderName : message.receiverName;
                return {
                    id: message.id,
                    listingId: message.listingId,
                    listingTitle: message.listingTitle,
                    from: `${message.senderName}`,
                    listing: message.listingTitle,
                    preview: message.content,
                    fullMessage: message.content,
                    time: this.formatRelativeTime(message.sentAt),
                    unread: isReceiver && !message.read,
                    senderId: message.senderId,
                    receiverId: message.receiverId,
                    counterpartId: isReceiver ? message.senderId : message.receiverId,
                    counterpartName
                };
            });

            this.data.messages = previews;
        } catch (error) {
            console.warn('Unable to load message previews.', error);
            this.data.messages = [];
        }

        this.refreshMessagesSection();
    }

    refreshMessagesSection() {
        if (!this.container) {
            return;
        }
        const messagesList = this.container.querySelector('.messages-list');
        if (messagesList) {
            messagesList.innerHTML = this.getMessagesTemplate();
            this.bindMessageButtons(this.container);
        }
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

    normalizeUser(user) {
        if (!user) return {};
        return {
            ...user,
            joinedDate: user.joinedDate ? this.formatJoinDate(user.joinedDate) : '—'
        };
    }

    formatRelativeTime(dateValue) {
        if (!dateValue) {
            return '';
        }
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) {
            return 'Just now';
        }
        if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
        }
        if (diffHours < 24) {
            return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        }
        if (diffDays < 7) {
            return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        }
        return date.toLocaleDateString();
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
        setTimeout(() => {
            this.setupMessageModalListeners();
        }, 0);
        setTimeout(() => {
            this.loadArtContent();
        }, 0);
        this.refreshMessagesSection();
    }
}

export default ProfileComponent;