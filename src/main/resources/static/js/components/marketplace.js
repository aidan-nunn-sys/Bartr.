import ApiService from '../services/api.service.js';

class MarketplaceComponent {
    constructor() {
        this.data = {
            listings: []
        };
        this.currentFilter = 'All';
        this.searchDebounce = null;
        
        this.init();
    }

    init() {
        this.handleSearch = this.handleSearch.bind(this);
        this.handleFilterClick = this.handleFilterClick.bind(this);
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
        if (this.searchDebounce) {
            clearTimeout(this.searchDebounce);
            this.searchDebounce = null;
        }
        console.log('Marketplace component destroyed');
    }
}

export default MarketplaceComponent;
