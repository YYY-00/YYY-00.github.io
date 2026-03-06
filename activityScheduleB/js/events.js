/**
 * Event Booking System - Event Listing & Filtering Module
 */

app.events = {
  filters: {
    search: '',
    category: '',
    venue: '',
    startDate: '',
    endDate: '',
    date: '',
    featured: false,
    priceMin: null,
    priceMax: null
  },

  currentPage: 1,
  itemsPerPage: 12,

  /**
   * Initialize event listing
   */
  init(container = '#events-list') {
    this.container = document.querySelector(container);
    if (!this.container) {
      console.error('Events container not found');
      return;
    }

    this.setupFilters();
    this.renderEvents();
    this.attachEvents();
  },

  /**
   * Setup filter controls
   */
  setupFilters() {
    // Get filter values from URL params if present
    const urlParams = new URLSearchParams(window.location.search);

    this.filters.search = urlParams.get('search') || '';
    this.filters.category = urlParams.get('category') || '';
    this.filters.venue = urlParams.get('venue') || '';
    this.filters.date = urlParams.get('date') || '';
    this.filters.featured = urlParams.get('featured') === 'true';

    // Populate filter dropdowns
    this.populateVenues();
    this.populateCategories();

    // Set initial filter values
    const searchInput = document.querySelector('#filter-search');
    if (searchInput) searchInput.value = this.filters.search;

    const categorySelect = document.querySelector('#filter-category');
    if (categorySelect) categorySelect.value = this.filters.category;

    const venueSelect = document.querySelector('#filter-venue');
    if (venueSelect) venueSelect.value = this.filters.venue;

    const dateInput = document.querySelector('#filter-date');
    if (dateInput) dateInput.value = this.filters.date;

    const startDateInput = document.querySelector('#filter-start-date');
    if (startDateInput) startDateInput.value = this.filters.startDate;

    const endDateInput = document.querySelector('#filter-end-date');
    if (endDateInput) endDateInput.value = this.filters.endDate;

    const featuredCheck = document.querySelector('#filter-featured');
    if (featuredCheck) featuredCheck.checked = this.filters.featured;
  },

  /**
   * Populate venues dropdown
   */
  populateVenues() {
    const select = document.querySelector('#filter-venue');
    if (!select) return;

    const venues = app.data?.getEventVenues() || [];

    let html = '<option value="">All Venues</option>';
    venues.forEach(venue => {
      html += `<option value="${venue}">${venue}</option>`;
    });

    select.innerHTML = html;
  },

  /**
   * Populate categories dropdown
   */
  populateCategories() {
    const select = document.querySelector('#filter-category');
    if (!select) return;

    const categories = app.data?.categories || [];

    let html = '<option value="">All Categories</option>';
    categories.forEach(cat => {
      html += `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`;
    });

    select.innerHTML = html;
  },

  /**
   * Attach event listeners
   */
  attachEvents() {
    const filtersContainer = document.querySelector('#events-filters');
    if (!filtersContainer) return;

    // Search input - debounced
    const searchInput = document.querySelector('#filter-search');
    if (searchInput) {
      searchInput.addEventListener('input',
        app.utils.debounce((e) => {
          this.filters.search = e.target.value;
          this.applyFilters();
        }, 300)
      );
    }

    // Category select
    const categorySelect = document.querySelector('#filter-category');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.filters.category = e.target.value;
        this.applyFilters();
      });
    }

    // Venue select
    const venueSelect = document.querySelector('#filter-venue');
    if (venueSelect) {
      venueSelect.addEventListener('change', (e) => {
        this.filters.venue = e.target.value;
        this.applyFilters();
      });
    }

    // Date input (single date)
    const dateInput = document.querySelector('#filter-date');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        this.filters.date = e.target.value;
        this.applyFilters();
      });
    }

    // Date range inputs
    const startDateInput = document.querySelector('#filter-start-date');
    const endDateInput = document.querySelector('#filter-end-date');

    if (startDateInput) {
      startDateInput.addEventListener('change', (e) => {
        this.filters.startDate = e.target.value;
        this.applyFilters();
      });
    }

    if (endDateInput) {
      endDateInput.addEventListener('change', (e) => {
        this.filters.endDate = e.target.value;
        this.applyFilters();
      });
    }

    // Featured checkbox
    const featuredCheck = document.querySelector('#filter-featured');
    if (featuredCheck) {
      featuredCheck.addEventListener('change', (e) => {
        this.filters.featured = e.target.checked;
        this.applyFilters();
      });
    }

    // Reset button
    const resetBtn = document.querySelector('#filter-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetFilters();
      });
    }

    // Sort select
    const sortSelect = document.querySelector('#filter-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sort = e.target.value;
        this.renderEvents();
      });
    }
  },

  /**
   * Apply filters
   */
  applyFilters() {
    this.currentPage = 1;
    this.renderEvents();

    // Update URL
    this.updateURL();
  },

  /**
   * Update URL with current filters
   */
  updateURL() {
    const params = new URLSearchParams();

    if (this.filters.search) params.set('search', this.filters.search);
    if (this.filters.category) params.set('category', this.filters.category);
    if (this.filters.venue) params.set('venue', this.filters.venue);
    if (this.filters.date) params.set('date', this.filters.date);
    if (this.filters.featured) params.set('featured', 'true');

    const queryString = params.toString();
    const newURL = queryString ? `?${queryString}` : window.location.pathname;

    window.history.replaceState({}, '', newURL);
  },

  /**
   * Reset all filters
   */
  resetFilters() {
    this.filters = {
      search: '',
      category: '',
      venue: '',
      startDate: '',
      endDate: '',
      date: '',
      featured: false,
      priceMin: null,
      priceMax: null
    };

    // Reset form inputs
    document.querySelectorAll('#events-filters input, #events-filters select').forEach(input => {
      if (input.type === 'checkbox') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });

    this.applyFilters();
  },

  /**
   * Sort events
   */
  sortEvents(events) {
    const sortSelect = document.querySelector('#filter-sort');
    const sortValue = sortSelect?.value || 'date-asc';

    return events.sort((a, b) => {
      switch (sortValue) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  },

  /**
   * Get filtered events
   */
  getFilteredEvents() {
    let events = app.data?.filterEvents(this.filters) || [];
    return this.sortEvents(events);
  },

  /**
   * Render events
   */
  renderEvents() {
    const events = this.getFilteredEvents();
    const totalEvents = events.length;
    const totalPages = Math.ceil(totalEvents / this.itemsPerPage);

    // Pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedEvents = events.slice(startIndex, endIndex);

    if (paginatedEvents.length === 0) {
      this.renderEmptyState();
      return;
    }

    const html = `
      <div class="events-header">
        <div class="events-count">
          <span class="count-number">${totalEvents}</span>
          <span class="count-label">event${totalEvents !== 1 ? 's' : ''} found</span>
        </div>
      </div>
      <div class="events-grid">
        ${paginatedEvents.map(event => this.renderEventCard(event)).join('')}
      </div>
      ${totalPages > 1 ? this.renderPagination(totalPages) : ''}
    `;

    this.container.innerHTML = html;
    this.attachEventCardEvents();
  },

  /**
   * Render event card
   */
  renderEventCard(event) {
    const timeInfo = app.timezone.getEventTimeInfo(event);
    const occupancyRate = app.utils.calculatePercentage(event.bookedSeats, event.capacity);
    const isAlmostSoldOut = occupancyRate > 80;

    return `
      <div class="event-card" data-event-id="${event.id}">
        ${event.featured ? '<div class="event-featured-badge">Featured</div>' : ''}
        <div class="event-card-image">
          <img src="${event.image}" alt="${event.name}" loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'">
          <div class="event-card-overlay">
            <span class="badge badge-primary">${event.category}</span>
            ${isAlmostSoldOut ? '<span class="badge badge-danger">Almost Sold Out</span>' : ''}
          </div>
        </div>
        <div class="event-card-body">
          <h3 class="event-card-title">${event.name}</h3>
          <div class="event-card-meta">
            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>${timeInfo.localDateOnly}</span>
            </div>
            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>${timeInfo.localTimeOnly}</span>
            </div>
            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>${event.venue}</span>
            </div>
          </div>
          <p class="event-card-description">${app.utils.truncate(event.description, 100)}</p>
          <div class="event-card-footer">
            <div class="event-card-price">
              <span class="price-label">From</span>
              <span class="price-value">${app.utils.formatCurrency(event.price)}</span>
            </div>
            <div class="event-card-availability">
              <span class="availability-label">${event.capacity - event.bookedSeats} seats left</span>
            </div>
          </div>
        </div>
        <div class="event-card-actions">
          <a href="booking.html?eventId=${event.id}" class="btn btn-primary btn-block">
            Book Now
          </a>
        </div>
      </div>
    `;
  },

  /**
   * Render empty state
   */
  renderEmptyState() {
    this.container.innerHTML = `
      <div class="events-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3>No Events Found</h3>
        <p>Try adjusting your filters to see more events</p>
        <button class="btn btn-secondary" onclick="document.querySelector('#filter-reset')?.click()">
          Clear Filters
        </button>
      </div>
    `;
  },

  /**
   * Render pagination
   */
  renderPagination(totalPages) {
    let pages = [];

    // Always show first page
    pages.push(1);

    // Show current page and adjacent pages
    for (let i = Math.max(2, this.currentPage - 1);
         i <= Math.min(totalPages - 1, this.currentPage + 1);
         i++) {
      pages.push(i);
    }

    // Always show last page if different from first
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    // Remove duplicates and sort
    pages = [...new Set(pages)].sort((a, b) => a - b);

    const pageItems = pages.map((page, index) => {
      const prevPage = pages[index - 1];
      const showEllipsis = prevPage && page > prevPage + 1;

      let html = showEllipsis ? '<span class="pagination-ellipsis">...</span>' : '';

      const isActive = page === this.currentPage ? ' class="active"' : '';
      html += `<button class="pagination-btn"${isActive} data-page="${page}">${page}</button>`;

      return html;
    }).join('');

    return `
      <div class="pagination">
        <button class="pagination-btn pagination-prev"
                ${this.currentPage === 1 ? 'disabled' : ''}
                data-page="${this.currentPage - 1}">
          Previous
        </button>
        ${pageItems}
        <button class="pagination-btn pagination-next"
                ${this.currentPage === totalPages ? 'disabled' : ''}
                data-page="${this.currentPage + 1}">
          Next
        </button>
      </div>
    `;
  },

  /**
   * Attach events to event cards
   */
  attachEventCardEvents() {
    // Pagination clicks
    this.container.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (page > 0) {
          this.currentPage = page;
          this.renderEvents();
          // Scroll to top
          this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Event card clicks (navigate to event)
    this.container.querySelectorAll('.event-card').forEach(card => {
      const eventId = card.dataset.eventId;

      card.addEventListener('click', (e) => {
        // Don't navigate if clicked a button or link
        if (e.target.closest('a, button')) return;

        window.location.href = `booking.html?eventId=${eventId}`;
      });

      card.style.cursor = 'pointer';
    });
  },

  /**
   * Refresh events list
   */
  refresh() {
    this.setupFilters();
    this.renderEvents();
  }
};

// Initialize events module when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#events-list')) {
      app.events.init();
    }
  });
}
