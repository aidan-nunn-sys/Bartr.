import ApiService from '../services/api.service.js';
import AuthService from '../services/auth.service.js';
import MessagesService from '../services/messages.service.js';

class MarketplaceComponent {
    constructor() {
        this.data = {
            listings: [],
            userListings: []
        };
        this.currentFilter = 'All';
        this.searchDebounce = null;
        this.attachedListing = null;
        
        this.init();
    }

    init() {
        this.handleSearch = this.handleSearch.bind(this);
        this.handleFilterClick = this.handleFilterClick.bind(this);
        this.openListingPicker = this.openListingPicker.bind(this);
        this.closeListingPicker = this.closeListingPicker.bind(this);
        this.selectListingOffer = this.selectListingOffer.bind(this);
        this.removeOffer = this.removeOffer.bind(this);
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.loadListings();
        this.loadUserListings();
    }

    render() {
        const container = document.createElement('div');
        container.className = 'marketplace-container';
        container.innerHTML = this.getTemplate();
        
        this.searchInput = container.querySelector('#marketplace-search');
        this.listingsGrid = container.querySelector('#listings-grid');
        this.filterButtons = container.querySelectorAll('.filter-btn');

        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.handleSearch);
        }

        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', this.handleFilterClick);
        });

        setTimeout(() => {
            this.loadArtContent();
        }, 0);

        this.renderListings();

        return container;
    }

    getTemplate() {
        return `
            <div class="marketplace-wrapper">
                <a href="/" class="back-button">&lt;</a>
                <div id="marketplace-title-container"></div>
                
                <div class="marketplace-content">
                    <div class="search-container">
                        <input type="text" id="marketplace-search" class="search-input" placeholder="Search marketplace...">
                    </div>
                    
                    <div class="filters-container">
                        <button class="filter-btn active">All</button>
                        <button class="filter-btn">Electronics</button>
                        <button class="filter-btn">Clothing</button>
                        <button class="filter-btn">Home</button>
                        <button class="filter-btn">Services</button>
                    </div>
                    
                    <div id="listings-grid" class="listings-grid"></div>
                </div>
            </div>
        `;
    }

    async loadListings({ category, search } = {}) {
        const params = new URLSearchParams();
        const normalizedCategory = this.normalizeCategory(category ?? this.currentFilter);
        const normalizedSearch = this.normalizeSearchTerm(search ?? this.searchInput?.value ?? '');

        if (normalizedCategory) {
            params.set('category', normalizedCategory);
        }
        if (normalizedSearch) {
            params.set('search', normalizedSearch);
        }

        const endpoint = params.toString() ? `/listings?${params.toString()}` : '/listings';

        try {
            if (this.listingsGrid) {
                this.listingsGrid.innerHTML = '<div class="loading">Loading listings...</div>';
            }
            const listings = await ApiService.get(endpoint);
            this.data.listings = listings.map(listing => ({
                ...listing,
                postedDate: this.formatDate(listing.postedDate)
            }));
            this.renderListings();
        } catch (error) {
            console.error('Error loading listings:', error);
            if (this.listingsGrid) {
                this.listingsGrid.innerHTML = '<div class="error">Unable to load listings right now.</div>';
            }
        }
    }

    async loadUserListings() {
        try {
            // Load user's own listings for offering
            const userListings = await ApiService.get('/user/listings');
            this.data.userListings = userListings.map(listing => ({
                ...listing,
                postedDate: this.formatDate(listing.postedDate)
            }));
        } catch (error) {
            console.error('Error loading user listings:', error);
        }
    }

    formatDate(dateString) {
        if (!dateString) {
            return '';
        }

        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return "Today";
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    normalizeCategory(category) {
        if (!category) {
            return null;
        }
        const trimmed = category.trim();
        return trimmed && trimmed.toLowerCase() !== 'all' ? trimmed : null;
    }

    normalizeSearchTerm(searchTerm) {
        if (!searchTerm) {
            return null;
        }
        const trimmed = searchTerm.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    renderListings(listings = this.data.listings) {
        if (!this.listingsGrid) {
            return;
        }

        if (!Array.isArray(listings) || listings.length === 0) {
            this.listingsGrid.innerHTML = '<div class="no-results">No listings found</div>';
            return;
        }

        this.listingsGrid.innerHTML = listings.map(listing => `
            <div class="listing-card" data-id="${listing.id}">
                <div class="listing-image" style="background-image: url('${listing.image}')"></div>
                <div class="listing-info">
                    <h3 class="listing-title">${listing.title}</h3>
                    <p class="listing-description">${listing.description}</p>
                    <div class="listing-meta">
                        <span class="listing-location">📍 ${listing.location}</span>
                        <span class="listing-date">${listing.postedDate}</span>
                    </div>
                    <div class="listing-trade">
                        <span class="trade-label">Trade for:</span>
                        <span class="trade-value">${listing.tradeFor}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers to listing cards
        this.listingsGrid.querySelectorAll('.listing-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const listingId = card.dataset.id;
                this.handleListingClick(listingId);
            });
        });
    }

    handleSearch(event) {
        const searchTerm = event.target.value;
        if (this.searchDebounce) {
            clearTimeout(this.searchDebounce);
        }
        this.searchDebounce = setTimeout(() => {
            this.loadListings({
                category: this.currentFilter,
                search: searchTerm
            });
        }, 300);
    }

    handleFilterClick(event) {
        const category = event.target.textContent.trim();
        
        // Update active button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Update current filter
        this.currentFilter = category;
        if (this.searchDebounce) {
            clearTimeout(this.searchDebounce);
            this.searchDebounce = null;
        }

        const searchTerm = this.searchInput ? this.searchInput.value : '';
        this.loadListings({
            category,
            search: searchTerm
        });
    }

    handleListingClick(listingId) {
        const listing = this.data.listings.find(l => l.id === parseInt(listingId));
        if (listing) {
            this.openModal(listing);
        }
    }

    openModal(listing) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'listing-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-body">
                    <div class="modal-image" style="background-image: url('${listing.image}')"></div>
                    <div class="modal-info">
                        <h2 class="modal-title">${listing.title}</h2>
                        <div class="modal-meta">
                            <span class="modal-location">📍 ${listing.location}</span>
                            <span class="modal-date">${listing.postedDate}</span>
                        </div>
                        <div class="modal-section">
                            <h3 class="modal-section-title">Description</h3>
                            <p class="modal-description">${listing.description}</p>
                        </div>
                        <div class="modal-section">
                            <h3 class="modal-section-title">Trade For</h3>
                            <p class="modal-trade">${listing.tradeFor}</p>
                        </div>
                        <div class="modal-section">
                            <h3 class="modal-section-title">Category</h3>
                            <p class="modal-category">${listing.category}</p>
                        </div>
                        <div class="modal-actions">
                            <button class="modal-btn modal-btn-primary" id="contact-trader-btn">Contact Trader</button>
                            <button class="modal-btn modal-btn-secondary">Save Listing</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const contactBtn = modal.querySelector('#contact-trader-btn');
        
        const closeModal = () => {
            modal.classList.add('modal-closing');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                closeModal();
                setTimeout(() => {
                    this.openContactModal(listing);
                }, 300);
            });
        }

        // Animate in
        setTimeout(() => {
            modal.classList.add('modal-open');
        }, 10);
    }

    openContactModal(listing) {
        const modal = document.createElement('div');
        modal.className = 'contact-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content message-modal-content">
                <button class="modal-close">&times;</button>
                <div class="message-modal-body">
                    <div class="message-modal-header">
                        <h2 class="message-modal-title">CONTACT TRADER</h2>
                        <div class="contact-modal-listing">
                            <div class="contact-listing-image" style="background-image: url('${listing.image}')"></div>
                            <div class="contact-listing-info">
                                <div class="contact-listing-title">RE: ${listing.title}</div>
                                <div class="contact-listing-location">📍 ${listing.location}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="message-modal-reply">
                        <h3 class="reply-title">YOUR MESSAGE</h3>
                        <textarea class="reply-textarea" id="contact-message" rows="6" placeholder="Type your message here..."></textarea>
                        
                        <div class="offer-section">
                            <button class="attach-offer-btn" id="attach-offer-btn-contact">
                                <span class="attach-icon">📎</span> ATTACH LISTING AS OFFER
                            </button>
                            <div class="attached-offer hidden" id="attached-offer-contact">
                                <div class="attached-offer-content">
                                    <div class="attached-offer-image"></div>
                                    <div class="attached-offer-info">
                                        <div class="attached-offer-title"></div>
                                        <div class="attached-offer-trade"></div>
                                    </div>
                                    <button class="remove-offer-btn" id="remove-offer-btn-contact">&times;</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="reply-actions">
                            <button class="modal-btn modal-btn-primary" id="send-message-btn">SEND MESSAGE</button>
                            <button class="modal-btn" id="close-contact-modal-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="listing-picker-modal" id="listing-picker-modal-contact">
                <div class="modal-overlay"></div>
                <div class="modal-content listing-picker-content">
                    <button class="modal-close">&times;</button>
                    <div class="listing-picker-body">
                        <h2 class="listing-picker-title">SELECT A LISTING TO OFFER</h2>
                        <div class="listing-picker-grid" id="listing-picker-grid-contact"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const cancelBtn = modal.querySelector('#close-contact-modal-btn');
        const sendBtn = modal.querySelector('#send-message-btn');
        const attachBtn = modal.querySelector('#attach-offer-btn-contact');
        const removeBtn = modal.querySelector('#remove-offer-btn-contact');

        const closeContactModal = () => {
            modal.classList.add('modal-closing');
            setTimeout(() => {
                document.body.removeChild(modal);
                this.attachedListing = null;
            }, 300);
        };

        closeBtn.addEventListener('click', closeContactModal);
        overlay.addEventListener('click', closeContactModal);
        cancelBtn.addEventListener('click', closeContactModal);
        
        if (attachBtn) {
            attachBtn.addEventListener('click', () => {
                this.openListingPicker('contact');
            });
        }
        
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.removeOffer('contact');
            });
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.handleSendMessage(listing, closeContactModal);
            });
        }

        // Setup listing picker for contact modal
        const pickerModal = modal.querySelector('#listing-picker-modal-contact');
        const pickerCloseBtn = pickerModal.querySelector('.modal-close');
        const pickerOverlay = pickerModal.querySelector('.modal-overlay');
        
        if (pickerCloseBtn) {
            pickerCloseBtn.addEventListener('click', () => {
                this.closeListingPicker('contact');
            });
        }
        if (pickerOverlay) {
            pickerOverlay.addEventListener('click', () => {
                this.closeListingPicker('contact');
            });
        }

        // Show modal
        setTimeout(() => {
            modal.classList.add('modal-open');
        }, 10);
    }

    openListingPicker(context = 'contact') {
        const pickerModal = document.querySelector(`#listing-picker-modal-${context}`);
        if (!pickerModal) return;
        
        // Render listings in picker
        const grid = pickerModal.querySelector(`#listing-picker-grid-${context}`);
        if (this.data.userListings.length === 0) {
            grid.innerHTML = '<div class="no-listings-picker">No listings available. Create a listing first!</div>';
        } else {
            grid.innerHTML = this.data.userListings.map(listing => `
                <div class="listing-picker-item" data-listing-id="${listing.id}">
                    <div class="listing-picker-image" style="background-image: url('${listing.image}')"></div>
                    <div class="listing-picker-info">
                        <div class="listing-picker-title">${listing.title}</div>
                        <div class="listing-picker-trade">Trade for: ${listing.tradeFor}</div>
                    </div>
                </div>
            `).join('');
            
            // Add click handlers
            grid.querySelectorAll('.listing-picker-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const listingId = parseInt(item.dataset.listingId);
                    this.selectListingOffer(listingId, context);
                });
            });
        }
        
        // Show modal
        pickerModal.style.display = 'flex';
        setTimeout(() => {
            pickerModal.classList.add('modal-open');
        }, 10);
    }

    closeListingPicker(context = 'contact') {
        const pickerModal = document.querySelector(`#listing-picker-modal-${context}`);
        if (!pickerModal) return;

        pickerModal.classList.add('modal-closing');
        pickerModal.classList.remove('modal-open');

        setTimeout(() => {
            pickerModal.style.display = 'none';
            pickerModal.classList.remove('modal-closing');
        }, 300);
    }

    selectListingOffer(listingId, context = 'contact') {
        const listing = this.data.userListings.find(l => l.id === listingId);
        if (!listing) return;
        
        this.attachedListing = listing;
        
        // Update UI to show attached listing
        const attachedOffer = document.querySelector(`#attached-offer-${context}`);
        const attachBtn = document.querySelector(`#attach-offer-btn-${context}`);
        
        if (attachedOffer && attachBtn) {
            attachedOffer.classList.remove('hidden');
            attachBtn.classList.add('hidden');
            
            attachedOffer.querySelector('.attached-offer-image').style.backgroundImage = `url('${listing.image}')`;
            attachedOffer.querySelector('.attached-offer-title').textContent = listing.title;
            attachedOffer.querySelector('.attached-offer-trade').textContent = `Trade for: ${listing.tradeFor}`;
        }
        
        this.closeListingPicker(context);
    }

    removeOffer(context = 'contact') {
        this.attachedListing = null;
        
        const attachedOffer = document.querySelector(`#attached-offer-${context}`);
        const attachBtn = document.querySelector(`#attach-offer-btn-${context}`);
        
        if (attachedOffer && attachBtn) {
            attachedOffer.classList.add('hidden');
            attachBtn.classList.remove('hidden');
        }
    }

    async handleSendMessage(listing, closeCallback) {
        const messageText = document.querySelector('#contact-message').value.trim();

        if (!messageText) {
            alert('Please enter a message.');
            return;
        }

        const currentUser = AuthService.getCachedUser();
        if (!currentUser) {
            alert('Please sign in to contact the trader.');
            if (window.bartrApp) {
                window.bartrApp.navigateTo('/login');
            }
            return;
        }

        try {
            const listingDetails = await this.getListingDetails(listing.id);
            if (!listingDetails || !listingDetails.owner || !listingDetails.owner.id) {
                alert('Unable to determine the listing owner.');
                return;
            }

            if (listingDetails.owner.id === currentUser.id) {
                alert('This listing already belongs to you.');
                return;
            }

            await MessagesService.sendMessage({
                listingId: listingDetails.id,
                receiverId: listingDetails.owner.id,
                content: messageText
            });

            if (this.attachedListing) {
                console.log('Listing offer attached to message', this.attachedListing.id);
            }

            alert('Message sent successfully!');
            this.attachedListing = null;
            closeCallback();

            if (window.bartrApp) {
                window.bartrApp.navigateTo('/messages');
            }
        } catch (error) {
            console.error('Failed to send message', error);
            alert('Unable to send your message right now. Please try again.');
        }
    }

    async getListingDetails(listingId) {
        if (this.data && Array.isArray(this.data.listings)) {
            const local = this.data.listings.find(item => Number(item.id) === Number(listingId));
            if (local && local.owner && local.owner.id) {
                return local;
            }
        }

        try {
            return await ApiService.get(`/listings/${listingId}`);
        } catch (error) {
            console.error('Unable to fetch listing details', error);
            return null;
        }
    }

    async loadArtContent() {
        try {
            const artModule = await import('/js/components/art/marketplaceArt.js');
            
            if (typeof artModule.default === 'function') {
                artModule.default();
            }
        } catch (error) {
            console.error('Failed to load art.js:', error);
        }
    }

    destroy() {
        if (this.searchInput) {
            this.searchInput.removeEventListener('input', this.handleSearch);
        }
        if (this.filterButtons) {
            this.filterButtons.forEach(btn => {
                btn.removeEventListener('click', this.handleFilterClick);
            });
        }
        if (this.searchDebounce) {
            clearTimeout(this.searchDebounce);
            this.searchDebounce = null;
        }
        console.log('Marketplace component destroyed');
    }
}

export default MarketplaceComponent;
