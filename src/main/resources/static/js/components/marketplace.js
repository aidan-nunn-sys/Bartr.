class MarketplaceComponent {
    constructor() {
        this.data = {
            listings: [],
            userListings: []
        };
        
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
        this.currentFilter = 'All';
        this.attachedListing = null;
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

    loadListings() {
        // Mock data - replace with actual API call
        this.data.listings = [
            {
                id: 1,
                title: "Vintage Camera",
                description: "Classic 35mm film camera in excellent condition",
                image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop",
                location: "Downtown",
                tradeFor: "Laptop or bicycle",
                postedDate: "2 days ago",
                category: "Electronics"
            },
            {
                id: 2,
                title: "Mountain Bike",
                description: "21-speed mountain bike, great for trails",
                image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400&h=300&fit=crop",
                location: "North Side",
                tradeFor: "Gaming console",
                postedDate: "1 week ago",
                category: "Sports"
            },
            {
                id: 3,
                title: "Acoustic Guitar",
                description: "Yamaha acoustic guitar with case and picks",
                image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop",
                location: "West End",
                tradeFor: "Keyboard or audio equipment",
                postedDate: "3 days ago",
                category: "Electronics"
            },
            {
                id: 4,
                title: "Designer Handbag",
                description: "Authentic leather handbag, barely used",
                image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop",
                location: "East Side",
                tradeFor: "Jewelry or accessories",
                postedDate: "5 days ago",
                category: "Clothing"
            },
            {
                id: 5,
                title: "Coffee Maker",
                description: "Espresso machine with milk frother",
                image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=300&fit=crop",
                location: "South Bay",
                tradeFor: "Blender or kitchen appliances",
                postedDate: "1 day ago",
                category: "Home"
            },
            {
                id: 6,
                title: "Book Collection",
                description: "50+ classic novels and modern fiction",
                image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop",
                location: "Central",
                tradeFor: "Board games or vinyl records",
                postedDate: "4 days ago",
                category: "Home"
            },
            {
                id: 7,
                title: "Lawn Mowing Service",
                description: "Professional lawn care and maintenance",
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
                location: "Citywide",
                tradeFor: "Handyman services or tools",
                postedDate: "1 week ago",
                category: "Services"
            },
            {
                id: 8,
                title: "Winter Jacket",
                description: "North Face jacket, size medium, like new",
                image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop",
                location: "Downtown",
                tradeFor: "Hiking boots or camping gear",
                postedDate: "2 days ago",
                category: "Clothing"
            }
        ];
    }

    loadUserListings() {
        // Load user's own listings for offering
        this.data.userListings = [
            {
                id: 101,
                title: "Gaming Laptop",
                description: "Dell XPS 15 with RTX graphics",
                image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop",
                tradeFor: "Camera or musical instrument"
            },
            {
                id: 102,
                title: "Keyboard Piano",
                description: "Yamaha PSR-E373 with stand",
                image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=300&fit=crop",
                tradeFor: "Guitar or audio equipment"
            },
            {
                id: 103,
                title: "Board Game Collection",
                description: "15+ popular board games",
                image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&h=300&fit=crop",
                tradeFor: "Books or vintage items"
            }
        ];
    }

    renderListings(filteredListings = null) {
        const listings = filteredListings || this.data.listings;
        
        if (listings.length === 0) {
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
        const searchTerm = event.target.value.toLowerCase();
        this.applyFilters(searchTerm, this.currentFilter);
    }

    handleFilterClick(event) {
        const category = event.target.textContent;
        
        // Update active button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Update current filter
        this.currentFilter = category;
        
        // Apply filters
        const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
        this.applyFilters(searchTerm, category);
    }

    applyFilters(searchTerm, category) {
        let filtered = this.data.listings;

        // Apply category filter
        if (category !== 'All') {
            filtered = filtered.filter(listing => listing.category === category);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(listing => 
                listing.title.toLowerCase().includes(searchTerm) ||
                listing.description.toLowerCase().includes(searchTerm) ||
                listing.tradeFor.toLowerCase().includes(searchTerm) ||
                listing.location.toLowerCase().includes(searchTerm)
            );
        }

        this.renderListings(filtered);
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

    handleSendMessage(listing, closeCallback) {
        const messageText = document.querySelector('#contact-message').value.trim();

        if (!messageText) {
            alert('Please enter a message.');
            return;
        }

        // In a real app, this would send the message to the server
        const messageData = {
            listingId: listing.id,
            listingTitle: listing.title,
            text: messageText,
            attachedListing: this.attachedListing ? {
                id: this.attachedListing.id,
                title: this.attachedListing.title
            } : null
        };
        
        console.log('Sending message:', messageData);
        
        alert(this.attachedListing 
            ? `Message sent with offer: "${this.attachedListing.title}"!`
            : 'Message sent successfully!');
        
        this.attachedListing = null;
        closeCallback();
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
        console.log('Marketplace component destroyed');
    }
}

export default MarketplaceComponent;