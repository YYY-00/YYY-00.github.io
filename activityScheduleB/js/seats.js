/**
 * Event Booking System - Interactive Seat Map Module
 */

app.seats = {
  currentEvent: null,
  venue: null,
  selectedSeats: new Set(),
  maxSeats: 8,
  seatPrices: {},
  tooltip: null,

  /**
   * Initialize seat selection
   */
  init(eventId) {
    if (!eventId) {
      console.error('Event ID required for seat selection');
      this.showError('Event not found');
      return;
    }

    this.currentEvent = app.data?.getEvent(eventId);
    if (!this.currentEvent) {
      this.showError('Event not found');
      return;
    }

    this.venue = app.data?.getVenue(this.currentEvent.venueId);
    if (!this.venue) {
      this.showError('Venue information not available');
      return;
    }

    this.selectedSeats.clear();
    this.initSeatPrices();
    this.renderSeatMap();
    this.createTooltip();
    this.attachEvents();
    this.updateBookingPanel();
  },

  /**
   * Initialize seat prices based on venue sections
   */
  initSeatPrices() {
    const basePrice = this.currentEvent.price;

    // Define price multipliers for different sections
    this.seatPrices = {
      'Floor': basePrice * 1.5,
      'Orchestra': basePrice * 1.3,
      '100 Level': basePrice * 1.2,
      'Mezzanine': basePrice * 1.1,
      '200 Level': basePrice,
      '300 Level': basePrice * 0.9,
      'Balcony': basePrice * 0.85,
      'VIP Suites': basePrice * 2,
      'Side Room A': basePrice * 0.9,
      'Side Room B': basePrice * 0.9,
      'Main Hall': basePrice,
      'North Stand': basePrice * 1.2,
      'South Stand': basePrice * 1.2,
      'East Stand': basePrice,
      'West Stand': basePrice,
      'default': basePrice
    };
  },

  /**
   * Get price for a section
   */
  getSectionPrice(section) {
    return this.seatPrices[section] || this.seatPrices['default'];
  },

  /**
   * Get price for a specific seat
   */
  getSeatPrice(row, section) {
    // Early rows in sections cost more
    const sectionPrice = this.getSectionPrice(section);
    const rowNumber = parseInt(row.replace(/\D/g, '')) || 1;

    if (rowNumber <= 3) {
      return sectionPrice * 1.2;
    } else if (rowNumber <= 7) {
      return sectionPrice * 1.1;
    }

    return sectionPrice;
  },

  /**
   * Check if seat is sold
   */
  isSeatSold(seatId, soldOutSeats = []) {
    return soldOutSeats.includes(seatId);
  },

  /**
   * Render seat map based on venue type
   */
  renderSeatMap() {
    const container = document.querySelector('#seat-map-container');
    if (!container) return;

    let svg = '';

    switch (this.venue.seatMap) {
      case 'theater':
        svg = this.generateTheaterLayout();
        break;
      case 'stadium':
        svg = this.generateStadiumLayout();
        break;
      case 'conference':
        svg = this.generateConferenceLayout();
        break;
      default:
        svg = this.generateTheaterLayout();
    }

    container.innerHTML = `
      <div class="seat-map-wrapper">
        <div class="seat-stage">
          <h3>${this.currentEvent.category === 'Concert' ? 'STAGE' : 'SCREEN'}</h3>
        </div>
        <div class="seat-map-container">
          <svg id="seat-map" class="seat-map" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
            ${svg}
          </svg>
        </div>
        ${this.renderLegend()}
      </div>
    `;

    this.attachSeatEvents();
  },

  /**
   * Generate theater style layout (curved rows)
   */
  generateTheaterLayout() {
    const { rows, seatsPerRow, sections } = this.venue;
    const soldOutSeats = this.currentEvent.soldOutSeats || [];
    let svg = '';
    let yOffset = 60;

    // Draw sections
    sections.forEach((section, sectionIndex) => {
      const sectionY = yOffset;
      const sectionSeats = Math.floor(seatsPerRow / sections.length);
      const sectionRows = Math.ceil(rows / sections.length);

      // Section label
      svg += `
        <text x="${400}" y="${yOffset - 15}" class="seat-section-label">
          ${section}
        </text>
      `;

      // Draw rows for this section
      for (let row = 0; row < sectionRows; row++) {
        const rowLabel = String.fromCharCode(65 + sectionIndex * 10 + row);
        const rowY = yOffset + 15 + (row * 30);

        // Row label on left
        svg += `
          <text x="45" y="${rowY + 10}" class="seat-row-label">${rowLabel}</text>
        `;

        // Draw seats in row (with slight curve effect)
        for (let seat = 1; seat <= sectionSeats; seat++) {
          const seatId = `${rowLabel}${seat}`;
          const isSold = this.isSeatSold(seatId, soldOutSeats);
          const seatX = 60 + seat * 24;

          // Curve effect: slight Y offset based on distance from center
          const curveOffset = Math.abs(seat - sectionSeats / 2) * 0.5;
          const seatY = rowY + curveOffset;

          const price = this.getSeatPrice(rowLabel, section);
          const seatClass = this.getSeatClass(rowLabel, section, isSold);

          svg += `
            <g class="seat ${seatClass}"
               data-seat-id="${seatId}"
               data-row="${rowLabel}"
               data-seat="${seat}"
               data-section="${section}"
               data-price="${price}">
              <rect x="${seatX - 10}" y="${seatY - 8}"
                    width="20" height="16"
                    rx="3" ry="3"/>
              <text x="${seatX}" y="${seatY + 4}"
                    class="seat-label">${seat}</text>
            </g>
          `;
        }
      }

      yOffset += sectionRows * 30 + 40;
    });

    return svg;
  },

  /**
   * Generate stadium style layout
   */
  generateStadiumLayout() {
    const { sections, rows, seatsPerRow } = this.venue;
    const soldOutSeats = this.currentEvent.soldOutSeats || [];
    let svg = '';

    // Stadium has stands on all sides
    const layout = {
      'North Stand': { x: 200, y: 50, width: 400, height: 80, direction: 'horizontal' },
      'South Stand': { x: 200, y: 370, width: 400, height: 80, direction: 'horizontal' },
      'East Stand': { x: 600, y: 130, width: 80, height: 240, direction: 'vertical' },
      'West Stand': { x: 120, y: 130, width: 80, height: 240, direction: 'vertical' },
      'VIP Suites': { x: 350, y: 150, width: 100, height: 200, direction: 'horizontal' }
    };

    Object.entries(layout).forEach(([section, config]) => {
      if (!sections.includes(section)) return;

      const { x, y, width, height, direction } = config;
      const sectionSeats = direction === 'horizontal' ? Math.floor(width / 24) : Math.floor(height / 24);
      const sectionRows = direction === 'horizontal' ? Math.floor(height / 30) : Math.floor(width / 30);

      svg += `
        <text x="${x + width / 2}" y="${y - 10}" class="seat-section-label">
          ${section}
        </text>
      `;

      for (let row = 0; row < sectionRows; row++) {
        const rowLabel = String.fromCharCode(65 + row);
        const price = this.getSectionPrice(section);

        for (let seat = 1; seat <= sectionSeats; seat++) {
          const seatId = `${section.charAt(0)}${rowLabel}${seat}`;
          const isSold = this.isSeatSold(seatId, soldOutSeats);

          let seatX, seatY;
          if (direction === 'horizontal') {
            seatX = x + seat * 24;
            seatY = y + row * 30 + 20;
          } else {
            seatX = x + row * 30 + 20;
            seatY = y + seat * 24;
          }

          const seatClass = this.getSeatClass(rowLabel, section, isSold);

          svg += `
            <g class="seat ${seatClass}"
               data-seat-id="${seatId}"
               data-row="${rowLabel}"
               data-seat="${seat}"
               data-section="${section}"
               data-price="${price}">
              <rect x="${seatX - 10}" y="${seatY - 8}"
                    width="20" height="16"
                    rx="3" ry="3"/>
            </g>
          `;
        }
      }
    });

    // Field/Sport Area in center
    svg += `
      <rect x="220" y="150" width="360" height="200"
            fill="#10b981" opacity="0.3" rx="10"/>
      <text x="400" y="260" class="seat-section-label"
            style="font-size: 20px; opacity: 0.5;">FIELD</text>
    `;

    return svg;
  },

  /**
   * Generate conference style layout (rectangular grid)
   */
  generateConferenceLayout() {
    const { sections, rows, seatsPerRow } = this.venue;
    const soldOutSeats = this.currentEvent.soldOutSeats || [];
    let svg = '';
    let yOffset = 50;

    sections.forEach((section, sectionIndex) => {
      const sectionRows = Math.ceil(rows / sections.length);
      const sectionSeats = seatsPerRow;

      // Section title
      svg += `
        <text x="${400}" y="${yOffset}" class="seat-section-label">
          ${section}
        </text>
      `;

      for (let row = 0; row < sectionRows; row++) {
        const rowLabel = String.fromCharCode(65 + sectionIndex * 10 + row);
        const rowY = yOffset + row * 35 + 30;

        // Row label
        svg += `
          <text x="45" y="${rowY + 10}" class="seat-row-label">${rowLabel}</text>
        `;

        for (let seat = 1; seat <= sectionSeats; seat++) {
          const seatId = `${rowLabel}${seat}`;
          const isSold = this.isSeatSold(seatId, soldOutSeats);
          const seatX = 60 + seat * 28;
          const price = this.getSeatPrice(rowLabel, section);
          const seatClass = this.getSeatClass(rowLabel, section, isSold);

          svg += `
            <g class="seat ${seatClass}"
               data-seat-id="${seatId}"
               data-row="${rowLabel}"
               data-seat="${seat}"
               data-section="${section}"
               data-price="${price}">
              <rect x="${seatX - 10}" y="${rowY - 8}"
                    width="20" height="16"
                    rx="2" ry="2"/>
              <text x="${seatX}" y="${rowY + 4}"
                    class="seat-label">${seat}</text>
            </g>
          `;
        }
      }

      yOffset += sectionRows * 35 + 30;
    });

    return svg;
  },

  /**
   * Get seat class based on row, section, and availability
   */
  getSeatClass(row, section, isSold) {
    if (isSold) return 'seat-sold';

    if (section.includes('VIP') || section === 'Floor') return 'seat-vip';
    if (section === 'Orchestra' || section === 'Mezzanine') return 'seat-premium';

    return 'seat-available';
  },

  /**
   * Render seat legend
   */
  renderLegend() {
    const vipVisible = this.venue.sections.some(s =>
      s.includes('VIP') || s === 'Floor'
    );
    const premiumVisible = this.venue.sections.some(s =>
      s === 'Orchestra' || s === 'Mezzanine'
    );

    let legend = `
      <div class="seat-legend">
        <div class="legend-seat-item">
          <div class="legend-seat available"></div>
          <span>Available</span>
        </div>
        <div class="legend-seat-item">
          <div class="legend-seat selected"></div>
          <span>Your Selection</span>
        </div>
        <div class="legend-seat-item">
          <div class="legend-seat sold"></div>
          <span>Sold Out</span>
        </div>
    `;

    if (vipVisible) {
      legend += `
        <div class="legend-seat-item">
          <div class="legend-seat vip"></div>
          <span>VIP</span>
        </div>
      `;
    }

    if (premiumVisible) {
      legend += `
        <div class="legend-seat-item">
          <div class="legend-seat premium"></div>
          <span>Premium</span>
        </div>
      `;
    }

    legend += '</div>';
    return legend;
  },

  /**
   * Create tooltip element
   */
  createTooltip() {
    if (this.tooltip) return;

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'seat-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);
  },

  /**
   * Show tooltip for seat
   */
  showTooltip(seat, x, y) {
    const seatId = seat.dataset.seatId;
    const section = seat.dataset.section;
    const price = parseFloat(seat.dataset.price);
    const row = seat.dataset.row;
    const seatNum = seat.dataset.seat;

    this.tooltip.innerHTML = `
      <strong>Seat ${seatId}</strong><br>
      ${section} - Row ${row}, Seat ${seatNum}<br>
      <span class="seat-tooltip-price">${app.utils.formatCurrency(price)}</span>
    `;

    this.tooltip.style.display = 'block';
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
  },

  /**
   * Hide tooltip
   */
  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  },

  /**
   * Attach events to seats
   */
  attachSeatEvents() {
    const seatMap = document.querySelector('#seat-map');
    if (!seatMap) return;

    seatMap.querySelectorAll('.seat:not(.seat-sold)').forEach(seat => {
      // Click to select/deselect
      seat.addEventListener('click', () => {
        const seatId = seat.dataset.seatId;
        this.toggleSeat(seatId);
      });

      // Hover tooltip
      seat.addEventListener('mouseenter', (e) => {
        const rect = seat.getBoundingClientRect();
        this.showTooltip(seat, rect.left + rect.width / 2, rect.top - 10);
      });

      seat.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
    });
  },

  /**
   * Toggle seat selection
   */
  toggleSeat(seatId) {
    const seatEl = document.querySelector(`[data-seat-id="${seatId}"]`);
    if (!seatEl) return;

    if (this.selectedSeats.has(seatId)) {
      this.selectedSeats.delete(seatId);
      seatEl.classList.remove('seat-selected');
      seatEl.classList.add('seat-available');
      if (seatEl.dataset.section?.includes('VIP') || seatEl.dataset.section === 'Floor') {
        seatEl.classList.add('seat-vip');
        seatEl.classList.remove('seat-available');
      } else if (seatEl.dataset.section === 'Orchestra' || seatEl.dataset.section === 'Mezzanine') {
        seatEl.classList.add('seat-premium');
        seatEl.classList.remove('seat-available');
      }
    } else {
      if (this.selectedSeats.size >= this.maxSeats) {
        app.utils?.toast(`Maximum ${this.maxSeats} seats allowed`, 'warning');
        return;
      }
      this.selectedSeats.add(seatId);
      seatEl.classList.remove('seat-available', 'seat-vip', 'seat-premium');
      seatEl.classList.add('seat-selected');
    }

    this.updateBookingPanel();
  },

  /**
   * Update booking panel with selected seats
   */
  updateBookingPanel() {
    const seatsList = document.querySelector('#selected-seats-list');
    const totalSeats = document.querySelector('#total-seats');
    const totalPrice = document.querySelector('#total-price');
    const submitBtn = document.querySelector('#booking-submit-btn');
    const maxSeatsWarning = document.querySelector('#max-seats-warning');

    // Update selected seats list
    if (this.selectedSeats.size === 0) {
      if (seatsList) seatsList.innerHTML = '<p class="empty-seats-message">No seats selected</p>';
      if (totalSeats) totalSeats.textContent = '0';
      if (totalPrice) totalPrice.textContent = app.utils.formatCurrency(0);
      if (submitBtn) submitBtn.disabled = true;
      if (maxSeatsWarning) maxSeatsWarning.style.display = 'none';
    } else {
      let html = '';
      let total = 0;

      this.selectedSeats.forEach(seatId => {
        const seatEl = document.querySelector(`[data-seat-id="${seatId}"]`);
        if (seatEl) {
          const price = parseFloat(seatEl.dataset.price);
          const section = seatEl.dataset.section;
          total += price;

          html += `
            <span class="selected-seat-tag">
              ${seatId}
              <span class="selected-seat-remove" data-seat="${seatId}">&times;</span>
            </span>
          `;
        }
      });

      if (seatsList) seatsList.innerHTML = html;

      // Re-attach remove events
      seatsList?.querySelectorAll('.selected-seat-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          this.toggleSeat(btn.dataset.seat);
        });
      });

      if (totalSeats) totalSeats.textContent = this.selectedSeats.size;
      if (totalPrice) totalPrice.textContent = app.utils.formatCurrency(total);
      if (submitBtn) submitBtn.disabled = false;

      // Show warning if approaching max seats
      if (maxSeatsWarning) {
        if (this.selectedSeats.size >= this.maxSeats - 2) {
          maxSeatsWarning.style.display = 'flex';
          maxSeatsWarning.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>${this.maxSeats - this.selectedSeats.size} seats remaining</span>
          `;
        } else {
          maxSeatsWarning.style.display = 'none';
        }
      }
    }
  },

  /**
   * Attach form events
   */
  attachEvents() {
    const form = document.querySelector('#booking-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitBooking();
    });
  },

  /**
   * Submit booking
   */
  submitBooking() {
    if (this.selectedSeats.size === 0) {
      app.utils?.toast('Please select at least one seat', 'error');
      return;
    }

    const email = document.querySelector('#booking-email')?.value;
    if (!email || !app.utils?.isValidEmail(email)) {
      app.utils?.toast('Please enter a valid email address', 'error');
      return;
    }

    // Calculate total price
    let totalPrice = 0;
    const seatsInfo = [];

    this.selectedSeats.forEach(seatId => {
      const seatEl = document.querySelector(`[data-seat-id="${seatId}"]`);
      if (seatEl) {
        const price = parseFloat(seatEl.dataset.price);
        const section = seatEl.dataset.section;
        totalPrice += price;
        seatsInfo.push({
          id: seatId,
          section,
          price
        });
      }
    });

    // Create booking
    const bookingData = {
      eventId: this.currentEvent.id,
      seats: Array.from(this.selectedSeats),
      totalPrice: totalPrice,
      email: email,
      seatsInfo: seatsInfo
    };

    const booking = app.data?.createBooking(bookingData);

    if (booking) {
      // Redirect to ticket page
      window.location.href = `ticket.html?ticketId=${booking.ticketId}`;
    } else {
      app.utils?.toast('Booking failed. Please try again.', 'error');
    }
  },

  /**
   * Show error state
   */
  showError(message) {
    const container = document.querySelector('#seat-map-container');
    if (container) {
      container.innerHTML = `
        <div class="seat-map-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>${message}</p>
          <a href="index.html" class="btn btn-primary">Back to Events</a>
        </div>
      `;
    }
  },

  /**
   * Get selected seats array
   */
  getSelectedSeats() {
    return Array.from(this.selectedSeats);
  },

  /**
   * Get total price for selected seats
   */
  getTotalPrice() {
    let total = 0;
    this.selectedSeats.forEach(seatId => {
      const seatEl = document.querySelector(`[data-seat-id="${seatId}"]`);
      if (seatEl) {
        total += parseFloat(seatEl.dataset.price);
      }
    });
    return total;
  }
};

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');

    if (eventId && document.querySelector('#seat-map-container')) {
      app.seats.init(eventId);
    }
  });
}
