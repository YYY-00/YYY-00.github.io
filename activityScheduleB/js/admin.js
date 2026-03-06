/**
 * Event Booking System - Admin Dashboard Module
 */

app.admin = {
  currentPage: 'overview',
  stats: null,

  /**
   * Initialize admin dashboard
   */
  init() {
    this.loadStats();
    this.renderNavigation();
    this.renderPage();
    this.attachEvents();
  },

  /**
   * Load statistics
   */
  loadStats() {
    this.stats = app.data?.getStatistics() || {};
  },

  /**
   * Render navigation
   */
  renderNavigation() {
    const nav = document.querySelector('#admin-nav');
    if (!nav) return;

    const pages = [
      { id: 'overview', label: 'Overview', icon: '📊' },
      { id: 'events', label: 'Events', icon: '🎉' },
      { id: 'bookings', label: 'Bookings', icon: '🎫' },
      { id: 'venues', label: 'Venues', icon: '🏟️' }
    ];

    nav.innerHTML = `
      <nav class="admin-nav">
        ${pages.map(page => `
          <a href="?page=${page.id}"
             class="admin-nav-item ${this.currentPage === page.id ? 'active' : ''}"
             data-page="${page.id}">
            <span class="nav-icon">${page.icon}</span>
            <span class="nav-label">${page.label}</span>
          </a>
        `).join('')}
      </nav>
    `;
  },

  /**
   * Render current page
   */
  renderPage() {
    const container = document.querySelector('#admin-content');
    if (!container) return;

    switch (this.currentPage) {
      case 'overview':
        this.renderOverview(container);
        break;
      case 'events':
        this.renderEvents(container);
        break;
      case 'bookings':
        this.renderBookings(container);
        break;
      case 'venues':
        this.renderVenues(container);
        break;
      default:
        this.renderOverview(container);
    }
  },

  /**
   * Render overview page
   */
  renderOverview(container) {
    const stats = this.stats;

    container.innerHTML = `
      <div class="admin-overview fade-in">
        <div class="admin-header">
          <h1>Dashboard Overview</h1>
          <button class="btn btn-secondary btn-sm" onclick="app.admin.refreshData()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Refresh
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          ${this.renderStatCard('Total Bookings', stats.totalBookings || 0, '🎫', '#4f46e5')}
          ${this.renderStatCard('Total Revenue', app.utils?.formatCurrency(stats.totalRevenue || 0), '💰', '#10b981')}
          ${this.renderStatCard('Total Events', stats.totalEvents || 0, '🎉', '#f59e0b')}
          ${this.renderStatCard('Total Venues', stats.totalVenues || 0, '🏟️', '#8b5cf6')}
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <div class="chart-container">
            <h3>Revenue by Category</h3>
            ${this.renderRevenuePieChart(stats.categoryRevenue)}
          </div>

          <div class="chart-container">
            <h3>Top Performing Events</h3>
            ${this.renderTopEventsChart(stats.mostPopularEvents)}
          </div>
        </div>

        <!-- Event Table -->
        <div class="admin-table-container">
          <h2>Event Performance</h2>
          ${this.renderEventStatsTable(stats.eventStats)}
        </div>
      </div>
    `;
  },

  /**
   * Render stat card
   */
  renderStatCard(label, value, icon, color) {
    return `
      <div class="stat-card">
        <div class="stat-icon" style="background: ${color}20; color: ${color};">
          ${icon}
        </div>
        <div>
          <div class="stat-value">${value}</div>
          <div class="stat-label">${label}</div>
        </div>
      </div>
    `;
  },

  /**
   * Render revenue pie chart
   */
  renderRevenuePieChart(categoryRevenue) {
    if (!categoryRevenue || Object.keys(categoryRevenue).length === 0) {
      return '<p class="text-center text-gray-500">No revenue data yet</p>';
    }

    const total = Object.values(categoryRevenue).reduce((sum, val) => sum + val, 0);
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    let currentAngle = 0;
    const gradientParts = Object.entries(categoryRevenue).map(([category, revenue], index) => {
      const percentage = (revenue / total) * 100;
      const angle = (revenue / total) * 360;
      const endAngle = currentAngle + angle;
      const color = colors[index % colors.length];

      const part = `
        <div class="pie-legend-item">
          <span class="pie-legend-color" style="background: ${color}"></span>
          <span class="pie-legend-label">${category}</span>
          <span class="pie-legend-value">${percentage.toFixed(1)}%</span>
          <span class="pie-legend-revenue">${app.utils?.formatCurrency(revenue)}</span>
        </div>
      `;

      currentAngle = endAngle;
      return part;
    }).join('');

    return `
      <div class="pie-chart-wrapper">
        <div class="pie-chart" style="background: conic-gradient(
          ${Object.entries(categoryRevenue).map(([cat, rev], i) => {
            const angle = (rev / total) * 360;
            let startAngle = 0;
            for (let j = 0; j < i; j++) {
              startAngle += (Object.values(categoryRevenue)[j] / total) * 360;
            }
            const endAngle = startAngle + angle;
            return `${colors[i % colors.length]} ${startAngle}deg ${endAngle}deg`;
          }).join(', ')}
        )"></div>
        <div class="pie-legend">
          ${gradientParts}
        </div>
      </div>
    `;
  },

  /**
   * Render top events bar chart
   */
  renderTopEventsChart(events) {
    if (!events || events.length === 0) {
      return '<p class="text-center text-gray-500">No events data yet</p>';
    }

    const maxValue = Math.max(...events.map(e => e.seatsSold));

    return `
      <div class="bar-chart">
        ${events.slice(0, 5).map(event => {
          const percentage = (event.seatsSold / maxValue) * 100;
          return `
            <div class="bar-chart-item">
              <div class="bar-chart-label" title="${event.event}">${app.utils?.truncate(event.event, 20)}</div>
              <div class="bar-chart-bar">
                <div class="bar-chart-fill" style="width: ${percentage}%"></div>
              </div>
              <div class="bar-chart-value">${event.seatsSold}</div>
            </div>
          `;
        }).join('')}
      </div>
      <style>
        .bar-chart {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        .bar-chart-item {
          display: grid;
          grid-template-columns: 1fr 2fr 60px;
          align-items: center;
          gap: var(--spacing-md);
        }
        .bar-chart-label {
          font-size: 0.875rem;
          color: var(--gray-700);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bar-chart-bar {
          height: 24px;
          background: var(--gray-100);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .bar-chart-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          border-radius: var(--radius-md);
          transition: width 0.3s ease;
        }
        .bar-chart-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-900);
          text-align: right;
        }
      </style>
    `;
  },

  /**
   * Render event stats table
   */
  renderEventStatsTable(eventStats) {
    if (!eventStats || eventStats.length === 0) {
      return '<p class="text-center text-gray-500">No event statistics available</p>';
    }

    return `
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Venue</th>
              <th>Category</th>
              <th>Seats Sold</th>
              <th>Occupancy</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${eventStats.map(event => `
              <tr>
                <td>${event.event}</td>
                <td>${event.venue}</td>
                <td><span class="badge badge-primary">${event.category}</span></td>
                <td>${event.seatsSold}</td>
                <td>
                  <div class="occupancy-bar">
                    <div class="occupancy-fill" style="width: ${Math.min(event.occupancyRate, 100)}%"></div>
                  </div>
                  ${event.occupancyRate}%
                </td>
                <td><strong>${app.utils?.formatCurrency(event.revenue)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * Render events page
   */
  renderEvents(container) {
    const events = app.data?.events || [];

    container.innerHTML = `
      <div class="admin-events fade-in">
        <div class="admin-header">
          <h1>Events Management</h1>
          <a href="index.html" class="btn btn-primary">View All Events</a>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Price</th>
                <th>Booked</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${events.map(event => {
                const occupancy = app.utils?.calculatePercentage(event.bookedSeats, event.capacity);
                return `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                        <img src="${event.image}" alt="" style="width: 40px; height: 40px; border-radius: var(--radius-md); object-fit: cover;">
                        <div>
                          <div style="font-weight: 600;">${app.utils?.truncate(event.name, 30)}</div>
                          <div style="font-size: 0.75rem; color: var(--gray-500);">${event.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>${app.timezone?.formatEventDate(event.date)}</td>
                    <td>${event.venue}</td>
                    <td>${app.utils?.formatCurrency(event.price)}</td>
                    <td>${event.bookedSeats} / ${event.capacity}</td>
                    <td>
                      ${occupancy >= 90 ? '<span class="badge badge-danger">Almost Full</span>' :
                        occupancy >= 50 ? '<span class="badge badge-warning">Filling</span>' :
                        '<span class="badge badge-success">Available</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /**
   * Render bookings page
   */
  renderBookings(container) {
    const bookings = app.data?.bookings || [];

    container.innerHTML = `
      <div class="admin-bookings fade-in">
        <div class="admin-header">
          <h1>Bookings Management</h1>
          <button class="btn btn-secondary" onclick="app.admin.exportBookings()">
            Export Data
          </button>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Event</th>
                <th>Seats</th>
                <th>Email</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.length === 0 ? `
                <tr>
                  <td colspan="7" class="text-center">No bookings yet</td>
                </tr>
              ` : bookings.map(booking => {
                const event = app.data?.getEvent(booking.eventId);
                return `
                  <tr>
                    <td><small>${booking.id}</small></td>
                    <td>${app.utils?.truncate(event?.name || 'Unknown', 25)}</td>
                    <td>${booking.seats.join(', ')}</td>
                    <td>${booking.email || 'N/A'}</td>
                    <td>${app.utils?.formatCurrency(booking.totalPrice)}</td>
                    <td>${app.utils?.formatDate(booking.timestamp)}</td>
                    <td>
                      <span class="badge ${booking.status === 'confirmed' ? 'badge-success' : 'badge-danger'}">
                        ${booking.status}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /**
   * Render venues page
   */
  renderVenues(container) {
    const venues = app.data?.venues || {};

    container.innerHTML = `
      <div class="admin-venues fade-in">
        <div class="admin-header">
          <h1>Venues Management</h1>
        </div>

        <div class="grid grid-cols-2" style="gap: var(--spacing-lg);">
          ${Object.values(venues).map(venue => `
            <div class="card">
              <img src="${venue.image || ''}" alt="${venue.name}" class="card-image"
                   onerror="this.src='https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800'">
              <div class="card-body">
                <h3>${venue.name}</h3>
                <p style="color: var(--gray-600);">${venue.city}, ${venue.state}</p>
                <div style="margin-top: var(--spacing-md); display: flex; gap: var(--spacing-lg);">
                  <div>
                    <span style="color: var(--gray-500); font-size: 0.875rem;">Capacity</span>
                    <div style="font-weight: 600;">${venue.capacity.toLocaleString()}</div>
                  </div>
                  <div>
                    <span style="color: var(--gray-500); font-size: 0.875rem;">Layout</span>
                    <div style="font-weight: 600; text-transform: capitalize;">${venue.seatMap}</div>
                  </div>
                </div>
                <div style="margin-top: var(--spacing-md);">
                  <span style="color: var(--gray-500); font-size: 0.875rem;">Sections</span>
                  <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-xs); margin-top: var(--spacing-xs);">
                    ${venue.sections.map(s => `<span class="badge badge-gray">${s}</span>`).join('')}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Attach events
   */
  attachEvents() {
    // Navigation clicks
    document.querySelectorAll('#admin-nav a[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        this.navigateTo(page);
      });
    });

    // Check URL for page parameter
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    if (page && page !== this.currentPage) {
      this.navigateTo(page);
    }
  },

  /**
   * Navigate to page
   */
  navigateTo(page) {
    this.currentPage = page;
    this.renderNavigation();
    this.renderPage();

    // Update URL
    window.history.replaceState({}, '', `?page=${page}`);
  },

  /**
   * Refresh data
   */
  refreshData() {
    this.loadStats();
    this.renderPage();
    app.utils?.toast('Dashboard refreshed!', 'success');
  },

  /**
   * Export bookings data
   */
  exportBookings() {
    const bookings = app.data?.bookings || [];
    let csv = 'Booking ID,Event,Seats,Email,Total,Date,Status\n';

    bookings.forEach(b => {
      const event = app.data?.getEvent(b.eventId);
      csv += `"${b.id}","${event?.name || 'Unknown'}","${b.seats.join('; ')}","${b.email || ''}","${b.totalPrice}","${b.timestamp}","${b.status}"\n`;
    });

    app.utils?.download(csv, 'bookings-export.csv', 'text/csv');
    app.utils?.toast('Bookings exported!', 'success');
  }
};

// Initialize admin dashboard when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#admin-nav')) {
      app.admin.init();
    }
  });
}
