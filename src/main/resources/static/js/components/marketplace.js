class MarketplaceComponent {
    constructor() {
        this.data = {
            listings: []
        };
        
        this.init();
    }

    init() {
        this.handleSearch = this.handleSearch.bind(this);
        this.handleFilterClick = this.handleFilterClick.bind(this);
        this.currentFilter = 'All';
        this.loadListings();
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
                            <button class="modal-btn modal-btn-primary">Contact Trader</button>
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
        
        const closeModal = () => {
            modal.classList.add('modal-closing');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        // Animate in
        setTimeout(() => {
            modal.classList.add('modal-open');
        }, 10);
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