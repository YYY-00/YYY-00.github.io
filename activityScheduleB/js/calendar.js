/**
 * Event Booking System - Calendar Module
 */

app.calendar = {
  currentDate: new Date(),
  selectedDate: null,
  eventsByDate: {},
  calendarEl: null,

  /**
   * Initialize calendar
   */
  init(container = '#calendar') {
    this.calendarEl = document.querySelector(container);
    if (!this.calendarEl) {
      console.error('Calendar container not found');
      return;
    }

    this.buildEventsByDate();
    this.render();
    this.attachEvents();
  },

  /**
   * Build events by date map
   */
  buildEventsByDate() {
    this.eventsByDate = {};
    const events = app.data?.events || [];

    events.forEach(event => {
      const date = new Date(event.date);
      const dateKey = this.getDateKey(date);

      if (!this.eventsByDate[dateKey]) {
        this.eventsByDate[dateKey] = [];
      }
      this.eventsByDate[dateKey].push(event);
    });
  },

  /**
   * Get date key (YYYY-MM-DD) for map lookup
   */
  getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Get events for a specific date
   */
  getEventsForDate(date) {
    const dateKey = this.getDateKey(date);
    return this.eventsByDate[dateKey] || [];
  },

  /**
   * Render calendar
   */
  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const html = `
      <div class="calendar-container">
        ${this.renderHeader()}
        <div class="calendar-grid-container">
          ${this.renderWeekdays()}
          ${this.renderDays(year, month)}
        </div>
        ${this.renderLegend()}
      </div>
      <div id="calendar-selected-events"></div>
    `;

    this.calendarEl.innerHTML = html;
  },

  /**
   * Render calendar header
   */
  renderHeader() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthName = monthNames[this.currentDate.getMonth()];
    const year = this.currentDate.getFullYear();

    return `
      <div class="calendar-header">
        <h2 class="calendar-title">${monthName} ${year}</h2>
        <div class="calendar-nav">
          <button class="calendar-nav-btn" data-nav="prev" title="Previous month">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button class="calendar-today-btn" data-nav="today">Today</button>
          <button class="calendar-nav-btn" data-nav="next" title="Next month">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Render weekday headers
   */
  renderWeekdays() {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days = weekdays.map(day => `
      <div class="calendar-weekday">${day}</div>
    `).join('');

    return `
      <div class="calendar-weekdays">
        ${days}
      </div>
    `;
  },

  /**
   * Render calendar days
   */
  renderDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();

    let daysHtml = '';

    // Previous month days (fill start of grid)
    for (let i = startingDayOfWeek; i > 0; i--) {
      const day = prevMonthDays - i + 1;
      daysHtml += `
        <div class="calendar-day other-month" data-day="${day}" data-month="${month - 1}" data-year="${year}">
          <span class="day-number">${day}</span>
        </div>
      `;
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = this.getDateKey(date);
      const events = this.getEventsForDate(date);
      const isToday = this.isSameDay(date, today);
      const isSelected = this.selectedDate && this.isSameDay(date, this.selectedDate);
      const hasEvents = events.length > 0;

      const classes = ['calendar-day'];
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');
      if (hasEvents) classes.push('has-events');

      daysHtml += `
        <div class="${classes.join(' ')}"
             data-day="${day}"
             data-month="${month}"
             data-year="${year}"
             data-date="${dateKey}"
             tabindex="0">
          <span class="day-number">${day}</span>
          ${hasEvents ? this.renderEventIndicators(events, isSelected) : ''}
          ${hasEvents ? `<span class="event-count">${events.length} event${events.length > 1 ? 's' : ''}</span>` : ''}
        </div>
      `;
    }

    // Next month days (fill end of grid)
    const totalDays = startingDayOfWeek + daysInMonth;
    const remainingDays = 42 - totalDays; // 6 rows × 7 days = 42

    for (let day = 1; day <= remainingDays; day++) {
      daysHtml += `
        <div class="calendar-day other-month" data-day="${day}" data-month="${month + 1}" data-year="${year}">
          <span class="day-number">${day}</span>
        </div>
      `;
    }

    return `<div class="calendar-days">${daysHtml}</div>`;
  },

  /**
   * Render event indicators for a day
   */
  renderEventIndicators(events, isSelected) {
    // Group by category and limit dots
    const maxDots = 5;
    const categories = {};

    events.forEach(event => {
      const cat = event.category.toLowerCase();
      if (!categories[cat]) {
        categories[cat] = 0;
      }
      categories[cat]++;
    });

    const dots = Object.entries(categories)
      .slice(0, maxDots)
      .map(([cat, count]) => {
        const categoryClass = cat.replace(/\s+/g, '-');
        return `<span class="event-dot category-${categoryClass}"></span>`;
      })
      .join('');

    return `<div class="event-indicators"><div class="event-dots">${dots}</div></div>`;
  },

  /**
   * Render legend
   */
  renderLegend() {
    const categories = [
      { id: 'concert', name: 'Concert' },
      { id: 'sports', name: 'Sports' },
      { id: 'theater', name: 'Theater' },
      { id: 'conference', name: 'Conference' },
      { id: 'comedy', name: 'Comedy' },
      { id: 'workshop', name: 'Workshop' }
    ];

    const items = categories.map(cat => `
      <div class="legend-item">
        <span class="legend-color ${cat.id}"></span>
        <span>${cat.name}</span>
      </div>
    `).join('');

    return `<div class="calendar-legend">${items}</div>`;
  },

  /**
   * Attach event listeners
   */
  attachEvents() {
    // Month navigation
    this.calendarEl.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nav = e.currentTarget.dataset.nav;
        this.navigateTo(nav);
      });
    });

    // Day selection
    this.calendarEl.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
      day.addEventListener('click', (e) => {
        const dateStr = e.currentTarget.dataset.date;
        if (dateStr) {
          this.selectDate(new Date(dateStr));
        }
      });

      // Keyboard support
      day.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const dateStr = e.currentTarget.dataset.date;
          if (dateStr) {
            this.selectDate(new Date(dateStr));
          }
        }
      });
    });
  },

  /**
   * Navigate calendar
   */
  navigateTo(direction) {
    if (direction === 'today') {
      this.currentDate = new Date();
    } else if (direction === 'prev') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    } else if (direction === 'next') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    }

    this.selectedDate = null;
    this.render();
    this.attachEvents();

    // Clear selected events display
    const selectedEventsEl = document.getElementById('calendar-selected-events');
    if (selectedEventsEl) {
      selectedEventsEl.innerHTML = '';
    }

    // Trigger custom event
    this.calendarEl.dispatchEvent(new CustomEvent('calendarNavigate', {
      detail: { date: this.currentDate }
    }));
  },

  /**
   * Select a date
   */
  selectDate(date) {
    this.selectedDate = date;

    // Update visual selection
    this.calendarEl.querySelectorAll('.calendar-day.selected').forEach(el => {
      el.classList.remove('selected');
    });

    const dateKey = this.getDateKey(date);
    const selectedEl = this.calendarEl.querySelector(`[data-date="${dateKey}"]`);
    if (selectedEl) {
      selectedEl.classList.add('selected');
    }

    // Display events for selected date
    this.displaySelectedEvents(date);

    // Trigger custom event
    this.calendarEl.dispatchEvent(new CustomEvent('calendarDateSelect', {
      detail: { date, events: this.getEventsForDate(date) }
    }));
  },

  /**
   * Display events for selected date
   */
  displaySelectedEvents(date) {
    const events = this.getEventsForDate(date);
    const container = document.getElementById('calendar-selected-events');

    if (!container) return;

    if (events.length === 0) {
      container.innerHTML = `
        <div class="calendar-no-events">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>No events scheduled for this day</p>
        </div>
      `;
      return;
    }

    const dateStr = app.timezone.formatEventDate(date);

    const eventsHtml = events.map(event => {
      const timeInfo = app.timezone.getEventTimeInfo(event);
      return `
        <div class="selected-event-item" data-event-id="${event.id}">
          <div class="selected-event-info">
            <div class="selected-event-name">${event.name}</div>
            <div class="selected-event-details">
              <span class="badge badge-gray">${event.category}</span>
              <span>${event.venue}</span>
              <span>${timeInfo.localTimeOnly}</span>
            </div>
          </div>
          <div class="selected-event-price">
            ${app.utils.formatCurrency(event.price)}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="calendar-selected-events">
        <h3>Events on ${dateStr}</h3>
        <div class="selected-events-list">
          ${eventsHtml}
        </div>
      </div>
    `;

    // Add click handlers to event items
    container.querySelectorAll('.selected-event-item').forEach(item => {
      item.addEventListener('click', () => {
        const eventId = item.dataset.eventId;
        this.navigateToEvent(eventId);
      });

      item.style.cursor = 'pointer';
    });
  },

  /**
   * Navigate to event details
   */
  navigateToEvent(eventId) {
    // This can be customized to navigate to booking page directly
    window.location.href = `booking.html?eventId=${eventId}`;
  },

  /**
   * Check if two dates are the same day
   */
  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  },

  /**
   * Refresh calendar (rebuild events and re-render)
   */
  refresh() {
    this.buildEventsByDate();
    this.render();
    this.attachEvents();

    if (this.selectedDate) {
      this.selectDate(this.selectedDate);
    }
  },

  /**
   * Get the currently selected date
   */
  getSelectedDate() {
    return this.selectedDate;
  },

  /**
   * Get the currently displayed month
   */
  getCurrentMonth() {
    return this.currentDate;
  },

  /**
   * Set the calendar to a specific month
   */
  setMonth(year, month) {
    this.currentDate = new Date(year, month, 1);
    this.refresh();
  },

  /**
   * Set the calendar to a specific date
   */
  setDate(date) {
    this.currentDate = new Date(date);
    this.selectedDate = new Date(date);
    this.refresh();
  }
};

// Initialize calendar when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize if #calendar exists
    if (document.querySelector('#calendar')) {
      app.calendar.init();
    }
  });
}
