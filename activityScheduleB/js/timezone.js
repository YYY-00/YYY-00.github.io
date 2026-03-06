/**
 * Event Booking System - Time Zone Handling
 */

app.timezone = {
  // Common time zones list
  commonTimeZones: [
    { id: 'UTC', name: 'UTC (Universal Coordinated Time)', offset: '+00:00' },
    { id: 'America/New_York', name: 'Eastern Time (US & Canada)', offset: '-05:00/-04:00' },
    { id: 'America/Chicago', name: 'Central Time (US & Canada)', offset: '-06:00/-05:00' },
    { id: 'America/Denver', name: 'Mountain Time (US & Canada)', offset: '-07:00/-06:00' },
    { id: 'America/Los_Angeles', name: 'Pacific Time (US & Canada)', offset: '-08:00/-07:00' },
    { id: 'America/Phoenix', name: 'Arizona (no DST)', offset: '-07:00' },
    { id: 'America/Anchorage', name: 'Alaska Time', offset: '-09:00/-08:00' },
    { id: 'America/Honolulu', name: 'Hawaii Time (no DST)', offset: '-10:00' },
    { id: 'Europe/London', name: 'London (GMT/BST)', offset: '+00:00/+01:00' },
    { id: 'Europe/Paris', name: 'Central European Time', offset: '+01:00/+02:00' },
    { id: 'Europe/Berlin', name: 'Berlin (CET/CEST)', offset: '+01:00/+02:00' },
    { id: 'Asia/Tokyo', name: 'Tokyo (JST)', offset: '+09:00' },
    { id: 'Asia/Shanghai', name: 'Shanghai (CST)', offset: '+08:00' },
    { id: 'Asia/Hong_Kong', name: 'Hong Kong (HKT)', offset: '+08:00' },
    { id: 'Asia/Singapore', name: 'Singapore (SGT)', offset: '+08:00' },
    { id: 'Asia/Dubai', name: 'Dubai (GST)', offset: '+04:00' },
    { id: 'Australia/Sydney', name: 'Sydney (AEST/AEDT)', offset: '+10:00/+11:00' },
    { id: 'Pacific/Auckland', name: 'Auckland (NZST/NZDT)', offset: '+12:00/+13:00' }
  ],

  /**
   * Format event time for user's local time zone
   * @param {string} utcString - ISO datetime string in UTC
   * @param {string} timeZone - Target time zone (default: user's local)
   * @param {object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted date/time
   */
  formatEventTime(utcString, timeZone = null, options = {}) {
    const date = new Date(utcString);

    // Use provided timezone or user's local timezone
    const targetTimeZone = timeZone || this.detectUserTimezone();

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: targetTimeZone,
      ...options
    };

    try {
      return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
    } catch (e) {
      console.warn('Time zone formatting error:', e);
      return date.toLocaleString();
    }
  },

  /**
   * Format date only
   * @param {string} utcString - ISO datetime string
   * @param {string} timeZone - Target time zone
   * @returns {string} Formatted date
   */
  formatEventDate(utcString, timeZone = null) {
    return this.formatEventTime(utcString, timeZone, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  },

  /**
   * Format time only
   * @param {string} utcString - ISO datetime string
   * @param {string} timeZone - Target time zone
   * @returns {string} Formatted time
   */
  formatEventTimeOnly(utcString, timeZone = null) {
    return this.formatEventTime(utcString, timeZone, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },

  /**
   * Detect user's time zone
   * @returns {string} Time zone identifier
   */
  detectUserTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return 'UTC';
    }
  },

  /**
   * Get time zone offset string
   * @param {string} timeZone - Time zone identifier
   * @returns {string} Offset string (e.g., "-05:00")
   */
  getTimeZoneOffset(timeZone) {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'longOffset'
      });
      const parts = formatter.formatToParts(now);
      const offsetPart = parts.find(p => p.type === 'timeZoneName');

      if (offsetPart && offsetPart.value) {
        // Extract offset from "GMT-05:00" or "GMT+00:00" format
        const match = offsetPart.value.match(/GMT([+-]\d{2}:\d{2})/);
        return match ? match[1] : '+00:00';
      }
    } catch (e) {
      console.warn('Error getting time zone offset:', e);
    }

    return '+00:00';
  },

  /**
   * Convert local date input to UTC
   * @param {Date|string} localDate - Date in user's local timezone
   * @param {string} timeZone - Source time zone (default: user's local)
   * @returns {string} ISO UTC string
   */
  convertToUTC(localDate, timeZone = null) {
    const date = new Date(localDate);
    return date.toISOString();
  },

  /**
   * Get event time info with original and local times
   * @param {object} event - Event object
   * @returns {object} Time information
   */
  getEventTimeInfo(event) {
    const userTimezone = this.detectUserTimezone();
    const eventTimezone = event.timezone || 'UTC';

    const localTime = this.formatEventTime(event.date, userTimezone);
    const originalTime = this.formatEventTime(event.date, eventTimezone);
    const localDateOnly = this.formatEventDate(event.date, userTimezone);
    const localTimeOnly = this.formatEventTimeOnly(event.date, userTimezone);

    // Check if times are different
    const isDifferentTZ = userTimezone !== eventTimezone;

    return {
      userTimezone,
      eventTimezone,
      localTime,
      originalTime,
      localDateOnly,
      localTimeOnly,
      isDifferentTZ,
      offset: this.getTimeZoneOffset(eventTimezone)
    };
  },

  /**
   * Display event time with original timezone info
   * @param {object} event - Event object
   * @param {HTMLElement} element - Element to populate
   */
  displayEventTime(event, element) {
    if (!element) return;

    const timeInfo = this.getEventTimeInfo(event);

    let html = `
      <div class="event-time" data-user-timezone="${timeInfo.userTimezone}">
        <div class="local-time">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>${timeInfo.localDateOnly}</span>
        </div>
        <div class="time-detail">${timeInfo.localTimeOnly}</div>
      `;

    if (timeInfo.isDifferentTZ) {
      html += `
        <div class="original-time" title="Event's original time">
          <span class="timezone-badge">${event.timezone}</span>
          <span>${timeInfo.originalTime}</span>
        </div>
      `;
    }

    html += '</div>';

    element.innerHTML = html;
  },

  /**
   * Get all available time zones
   * @returns {Array} Time zone options
   */
  getAvailableTimeZones() {
    return this.commonTimeZones;
  },

  /**
   * Create timezone selector dropdown
   * @param {string} selectedId - Initially selected timezone ID
   * @returns {string} HTML select element
   */
  createTimezoneSelector(selectedId = null) {
    const userTz = this.detectUserTimezone();
    const selected = selectedId || userTz;

    let options = this.commonTimeZones.map(tz => {
      const isSelected = tz.id === selected ? ' selected' : '';
      return `<option value="${tz.id}"${isSelected}>${tz.name} (${tz.offset})</option>`;
    }).join('');

    return `
      <select class="form-select timezone-selector" name="timezone">
        ${options}
      </select>
    `;
  },

  /**
   * Format a date range with timezones
   * @param {string} startUtc - Start date in ISO format
   * @param {string} endUtc - End date in ISO format
   * @param {string} timeZone - Target timezone
   * @returns {string} Formatted date range
   */
  formatDateRange(startUtc, endUtc, timeZone = null) {
    const targetTz = timeZone || this.detectUserTimezone();
    const start = new Date(startUtc);
    const end = new Date(endUtc);

    // Check if same day
    const startStr = this.formatEventDate(startUtc, targetTz);
    const endStr = this.formatEventDate(endUtc, targetTz);

    if (startStr === endStr) {
      return `${startStr}, ${this.formatEventTimeOnly(startUtc, targetTz)} - ${this.formatEventTimeOnly(endUtc, targetTz)}`;
    }

    return `${startStr} - ${endStr}`;
  },

  /**
   * Get timezone abbreviation (e.g., EST, PST)
   * @param {string} timeZone - Time zone identifier
   * @param {Date} date - Date to check
   * @returns {string} Time zone abbreviation
   */
  getTimezoneAbbreviation(timeZone, date = new Date()) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'short'
      });
      const parts = formatter.formatToParts(date);
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      return tzPart ? tzPart.value : timeZone;
    } catch (e) {
      return timeZone;
    }
  },

  /**
   * Check if DST is active for a timezone
   * @param {string} timeZone - Time zone identifier
   * @param {Date} date - Date to check
   * @returns {boolean} True if DST is active
   */
  isDSTActive(timeZone, date = new Date()) {
    try {
      // Get timezone name for January (non-DST)
      const janFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'long'
      });
      const janParts = janFormatter.formatToParts(new Date(date.getFullYear(), 0, 1));
      const janTz = janParts.find(p => p.type === 'timeZoneName')?.value || '';

      // Get timezone name for current date
      const currentFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'long'
      });
      const currentParts = currentFormatter.formatToParts(date);
      const currentTz = currentParts.find(p => p.type === 'timeZoneName')?.value || '';

      return janTz !== currentTz;
    } catch (e) {
      return false;
    }
  },

  /**
   * Initialize any timezone selectors on the page
   */
  initSelectors() {
    document.querySelectorAll('.timezone-selector').forEach(select => {
      // Set user's timezone as default if no value selected
      if (!select.value) {
        select.value = this.detectUserTimezone();
      }

      // Add change handler for visual feedback
      select.addEventListener('change', (e) => {
        const tz = e.target.value;
        const tzName = this.commonTimeZones.find(t => t.id === tz)?.name || tz;
        app.utils?.toast(`Time zone changed to ${tzName}`, 'info', 2000);
      });
    });
  }
};

// Initialize timezone selectors when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    app.timezone.initSelectors();
  });
}
