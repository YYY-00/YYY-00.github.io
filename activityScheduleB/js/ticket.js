/**
 * Event Booking System - Ticket Generation Module
 */

app.ticket = {
  currentBooking: null,
  qrCodeLibrary: null,

  /**
   * Initialize ticket page
   */
  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get('ticketId');

    if (!ticketId) {
      this.showError('Ticket ID not found');
      return;
    }

    this.loadTicket(ticketId);
  },

  /**
   * Load ticket information
   */
  loadTicket(ticketId) {
    const container = document.querySelector('#ticket-container');
    if (!container) return;

    container.innerHTML = '<div class="ticket-loading"><div class="spinner"></div><p>Loading your ticket...</p></div>';

    // Simulate loading delay
    setTimeout(() => {
      this.currentBooking = app.data?.getBookingByTicketId(ticketId);

      if (!this.currentBooking) {
        this.showError('Ticket not found. It may have been cancelled or the ID is invalid.');
        return;
      }

      if (this.currentBooking.status === 'cancelled') {
        this.showError('This ticket has been cancelled.');
        return;
      }

      this.renderTicket();
    }, 500);
  },

  /**
   * Render ticket
   */
  renderTicket() {
    const event = app.data?.getEvent(this.currentBooking.eventId);
    if (!event) {
      this.showError('Event information not found');
      return;
    }

    const container = document.querySelector('#ticket-container');
    const timeInfo = app.timezone.getEventTimeInfo(event);

    const ticketHtml = `
      <div class="ticket-container">
        <div class="ticket-wrapper">
          <div class="ticket success">
            <!-- Event Details Side -->
            <div class="ticket-details">
              <div class="ticket-header">
                <h1>${event.name}</h1>
                <span class="ticket-category">${event.category}</span>
              </div>

              <div class="ticket-info">
                <div class="ticket-info-item">
                  <svg class="ticket-info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <div>
                    <div class="ticket-info-label">Date & Time</div>
                    <div class="ticket-info-value">${timeInfo.localDateOnly}</div>
                    <div class="ticket-info-value" style="font-size: 0.875rem;">${timeInfo.localTimeOnly}</div>
                    ${timeInfo.isDifferentTZ ? `<div style="font-size: 0.75rem; opacity: 0.7;">${event.timezone} (original)</div>` : ''}
                  </div>
                </div>

                <div class="ticket-info-item">
                  <svg class="ticket-info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <div class="ticket-info-label">Venue</div>
                    <div class="ticket-info-value">${event.venue}</div>
                    <div style="font-size: 0.75rem; opacity: 0.7;">${event.venueId && app.data?.getVenue(event.venueId)?.city || ''}</div>
                  </div>
                </div>

                <div class="ticket-info-item">
                  <svg class="ticket-info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <div>
                    <div class="ticket-info-label">Booked By</div>
                    <div class="ticket-info-value">${this.currentBooking.email || 'Guest'}</div>
                  </div>
                </div>

                ${this.currentBooking.bookedAt ? `
                  <div class="ticket-info-item">
                    <svg class="ticket-info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <div>
                      <div class="ticket-info-label">Booked On</div>
                      <div class="ticket-info-value" style="font-size: 0.875rem;">${app.utils?.formatDateTime(this.currentBooking.timestamp)}</div>
                    </div>
                  </div>
                ` : ''}
              </div>

              <div class="ticket-seats">
                <div class="ticket-seats-title">
                  ${this.currentBooking.seats.length > 1 ? 'Seats' : 'Seat'}
                </div>
                <div class="ticket-seats-list">
                  ${this.currentBooking.seats.map(seat => `
                    <span class="ticket-seat-tag">${seat}</span>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- QR Code Side -->
            <div class="ticket-qr">
              <div class="ticket-qr-title">Scan for Entry</div>
              <div class="qr-code-container" id="qrcode">
                <div class="spinner" style="width: 40px; height: 40px; border-width: 2px;"></div>
              </div>

              <div class="ticket-id-section">
                <div class="ticket-id-label">Ticket ID</div>
                <div class="ticket-id-value">${this.currentBooking.ticketId}</div>
              </div>

              <div class="ticket-status">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Confirmed
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="ticket-summary">
            <div class="summary-row">
              <span class="summary-label">Tickets</span>
              <span class="summary-value">${this.currentBooking.seats.length} × ${app.utils?.formatCurrency(event.price)}</span>
            </div>
            ${this.currentBooking.seatsInfo ? this.currentBooking.seatsInfo.map(seat => `
              <div class="summary-row">
                <span class="summary-label">${seat.id} (${seat.section})</span>
                <span class="summary-value">${app.utils?.formatCurrency(seat.price)}</span>
              </div>
            `).join('') : ''}
            <div class="summary-row total">
              <span class="summary-label">Total Paid</span>
              <span class="summary-value">${app.utils?.formatCurrency(this.currentBooking.totalPrice)}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="ticket-actions no-print">
          <button class="ticket-action-btn primary" onclick="window.print()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print Ticket
          </button>
          <button class="ticket-action-btn secondary" onclick="app.ticket.downloadTicket()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
          <button class="ticket-action-btn secondary" onclick="app.ticket.shareTicket()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>
          <a href="index.html" class="ticket-action-btn secondary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            Back to Events
          </a>
        </div>

        <!-- Reminder -->
        <div class="ticket-reminder no-print">
          <div class="ticket-reminder-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Get Event Reminder
          </div>
          <div class="ticket-reminder-content">
            <p>We'll send you a reminder email with all the event details before the event starts.</p>
          </div>
          <a href="${this.generateMailtoLink(event)}" class="btn btn-primary btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Send Reminder Email
          </a>
        </div>
      </div>
    `;

    container.innerHTML = ticketHtml;
    container.classList.add('fade-in');

    // Generate QR code
    this.generateQRCode();
  },

  /**
   * Generate QR code for ticket
   */
  generateQRCode() {
    const qrContainer = document.querySelector('#qrcode');
    if (!qrContainer) return;

    // QR code data: ticket verification URL
    const qrData = `${window.location.origin}${window.location.pathname}?ticketId=${this.currentBooking.ticketId}`;

    // Check if QRCode library is available
    if (typeof QRCode !== 'undefined') {
      qrContainer.innerHTML = '';
      new QRCode(qrContainer, {
        text: qrData,
        width: 180,
        height: 180,
        colorDark: '#111827',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    } else {
      // Load library from CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
      script.onload = () => {
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
          text: qrData,
          width: 180,
          height: 180,
          colorDark: '#111827',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      };
      script.onerror = () => {
        qrContainer.innerHTML = `
          <div style="text-align: center; color: var(--danger); font-size: 0.875rem;">
            QR code unavailable
          </div>
        `;
      };
      document.head.appendChild(script);
    }
  },

  /**
   * Generate mailto link for reminder email
   */
  generateMailtoLink(event) {
    const timeInfo = app.timezone.getEventTimeInfo(event);
    const seats = this.currentBooking.seats.join(', ');

    const subject = encodeURIComponent(`Reminder: ${event.name} Ticket`);
    const body = encodeURIComponent(
      `Hi,\n\nThis is a reminder for your upcoming event:\n\n` +
      `Event: ${event.name}\n` +
      `Date: ${timeInfo.localDateOnly}\n` +
      `Time: ${timeInfo.localTimeOnly}\n` +
      `Venue: ${event.venue}\n` +
      `Seats: ${seats}\n` +
      `Ticket ID: ${this.currentBooking.ticketId}\n\n` +
      `See you there!\n\n` +
      `---\n` +
      `Your ticket details are available at: ${window.location.href}`
    );

    return `mailto:?subject=${subject}&body=${body}`;
  },

  /**
   * Download ticket as image
   */
  downloadTicket() {
    app.utils?.toast('Downloading ticket...', 'info');

    // Create a simple text version for download
    const event = app.data?.getEvent(this.currentBooking.eventId);
    const timeInfo = app.timezone.getEventTimeInfo(event);

    const ticketText = `
================================
        EVENT TICKET
================================

Event: ${event.name}
Date: ${timeInfo.localDateOnly}
Time: ${timeInfo.localTimeOnly}
Venue: ${event.venue}
Seats: ${this.currentBooking.seats.join(', ')}
Ticket ID: ${this.currentBooking.ticketId}
Status: Confirmed

Total Paid: ${app.utils?.formatCurrency(this.currentBooking.totalPrice)}

================================
Bring this ticket (printed or on
your phone) to the event for entry.
================================
    `.trim();

    app.utils?.download(ticketText, `ticket-${this.currentBooking.ticketId}.txt`, 'text/plain');
    app.utils?.toast('Ticket downloaded!', 'success');
  },

  /**
   * Share ticket
   */
  shareTicket() {
    if (navigator.share) {
      navigator.share({
        title: `My Ticket: ${this.currentBooking.eventId}`,
        text: `I'm going to ${app.data?.getEvent(this.currentBooking.eventId)?.name}!`,
        url: window.location.href
      }).catch(err => {
        console.log('Share canceled');
      });
    } else {
      // Fallback: copy to clipboard
      app.utils?.copyToClipboard(window.location.href).then(success => {
        if (success) {
          app.utils?.toast('Ticket link copied to clipboard!', 'success');
        } else {
          app.utils?.toast('Unable to copy link', 'error');
        }
      });
    }
  },

  /**
   * Show error state
   */
  showError(message) {
    const container = document.querySelector('#ticket-container');
    if (container) {
      container.innerHTML = `
        <div class="ticket-error">
          <svg class="ticket-error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <h2>Ticket Not Found</h2>
          <p>${message}</p>
          <a href="index.html" class="btn btn-primary">Back to Events</a>
        </div>
      `;
    }
  }
};

// Initialize ticket page when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#ticket-container')) {
      app.ticket.init();
    }
  });
}
