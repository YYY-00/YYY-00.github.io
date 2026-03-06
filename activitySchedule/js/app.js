/**
 * Main App Controller
 * Coordinates all components and manages application state
 */

import { events, venues, categories, bookings, createBooking, getAllBookings, getStatistics } from './data.js';
import { renderCalendar, navigateMonth, initializeCalendar } from './calendar.js';
import { applyFilters, initializeFilters } from './filters.js';
import { renderEventList } from './filters.js';
import { renderSeatMap, selectSeat, deselectSeat, getSelectedSeats } from './seatmap.js';
import { generateQRCode, showBookingConfirmation } from './qr-generator.js';
import { renderDashboard } from './admin-dashboard.js';

// Application state
const state = {
    currentView: 'calendar',
    currentDate: new Date(),
    filteredEvents: [...events],
    selectedEvent: null,
    selectedSeats: [],
    activeMonth: new Date()
};

// DOM Elements
const appContainer = document.getElementById('app');

// Initialize application
function init() {
    console.log('Initializing Activity Booking System...');

    // Initialize all components
    initializeComponents();

    // Set up event listeners
    setupEventListeners();

    // Render initial view
    renderState();

    console.log('Application initialized successfully!');
}

function initializeComponents() {
    // Initialize calendar
    initializeCalendar(state.activeMonth, state.filteredEvents);

    // Initialize filters
    initializeFilters();

    // Render event list
    renderEventList(state.filteredEvents);

    // Render admin dashboard
    renderDashboard();

    // Populate venue filter
    const venueFilter = document.getElementById('venue-filter');
    venues.forEach(venue => {
        const option = document.createElement('option');
        option.value = venue.id;
        option.textContent = venue.name;
        venueFilter.appendChild(option);
    });
}

function setupEventListeners() {
    // Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            switchView(view);
        });
    });

    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', () => navigateMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => navigateMonth(1));

    // Filter reset
    document.getElementById('reset-filters').addEventListener('click', resetFilters);

    // Modal close buttons
    document.getElementById('modal-close').addEventListener('click', closeEventModal);
    document.getElementById('booking-modal-close').addEventListener('click', closeBookingModal);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEventModal();
            closeBookingModal();
        }
    });
}

function switchView(viewName) {
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        }
    });

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }

    state.currentView = viewName;

    // Refresh view-specific content
    if (viewName === 'admin') {
        renderDashboard();
    }
}

function renderState() {
    // Re-render current view with updated state
    switch (state.currentView) {
        case 'calendar':
            // Calendar is re-rendered via filters
            break;
        case 'events':
            renderEventList(state.filteredEvents);
            break;
        case 'admin':
            renderDashboard();
            break;
    }
}

function resetFilters() {
    // Reset date filters
    document.getElementById('date-filter-start').value = '';
    document.getElementById('date-filter-end').value = '';

    // Reset venue filter
    document.getElementById('venue-filter').value = '';

    // Reset category filters
    document.querySelectorAll('#category-filters input').forEach(checkbox => {
        checkbox.checked = true;
    });

    // Re-apply filters (which will reset to showing all events)
    applyFilters();
}

function showEventDetails(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    state.selectedEvent = event;
    state.selectedSeats = [];

    const modal = document.getElementById('event-modal');
    const detailsContainer = document.getElementById('event-details');

    const venue = venues.find(v => v.id === event.venueId);
    const category = categories[event.category];

    // Calculate available seats
    const bookedCount = event.bookedSeats.length;
    const availableCount = event.capacity - bookedCount;
    const occupancyRate = ((bookedCount / event.capacity) * 100).toFixed(1);

    detailsContainer.innerHTML = `
        <div class="event-details">
            <span class="event-category ${event.category}">${category.name}</span>
            <h2 class="event-detail-title">${event.name}</h2>

            <div class="event-detail-meta">
                <div class="event-detail-row">
                    <span class="event-detail-label">Date & Time:</span>
                    <span class="event-detail-value">
                        ${new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                        at ${new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
                <div class="event-detail-row">
                    <span class="event-detail-label">Venue:</span>
                    <span class="event-detail-value">${venue ? venue.name : 'Unknown'}</span>
                </div>
                <div class="event-detail-row">
                    <span class="event-detail-label">Address:</span>
                    <span class="event-detail-value">${venue ? venue.address : 'Unknown'}</span>
                </div>
                <div class="event-detail-row">
                    <span class="event-detail-label">Availability:</span>
                    <span class="event-detail-value">
                        ${availableCount} seats available (${occupancyRate}% sold)
                    </span>
                </div>
            </div>

            <div class="event-detail-description">
                <p><strong>About this event:</strong></p>
                <p>${event.description}</p>
            </div>

            <div class="seat-map-section">
                <div class="seat-map-header">
                    <h3>Select Seats</h3>
                    <div class="seat-map-legend">
                        <div class="legend-item">
                            <div class="legend-color available"></div>
                            <span>Available</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color selected"></div>
                            <span>Selected</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color sold"></div>
                            <span>Sold</span>
                        </div>
                    </div>
                </div>

                <div class="seat-map-container">
                    <div id="seat-map"></div>
                </div>

                <div class="seat-summary">
                    <div class="seat-summary-header">
                        <span>Selected Seats</span>
                        <span id="selected-count">0 seats</span>
                    </div>
                    <div id="selected-seats-list" class="selected-seats-list"></div>
                    <div class="seat-summary-footer">
                        <div class="total-price" id="total-price">$0</div>
                        <button class="btn btn-success" id="confirm-booking" disabled>
                            Confirm Booking
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');

    // Render seat map
    renderSeatMap(event, venue);

    // Set up booking confirmation
    const confirmBtn = document.getElementById('confirm-booking');
    confirmBtn.addEventListener('click', handleBookingConfirmation);
}

function handleBookingConfirmation() {
    const selectedSeats = getSelectedSeats();

    if (selectedSeats.length === 0) {
        alert('Please select at least one seat to continue.');
        return;
    }

    // Create booking
    const booking = createBooking(state.selectedEvent.id, selectedSeats);

    if (booking) {
        // Close event modal
        closeEventModal();

        // Show booking confirmation with QR code
        showBookingConfirmation(booking);

        // Update views
        state.filteredEvents = [...events];
        renderState();
    }
}

function closeEventModal() {
    const modal = document.getElementById('event-modal');
    modal.classList.remove('active');
    state.selectedEvent = null;
    state.selectedSeats = [];
}

function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    modal.classList.remove('active');
}

// Export state management functions
export function updateFilteredEvents(filteredEvents) {
    state.filteredEvents = filteredEvents;

    // Update calendar
    if (typeof renderCalendar === 'function') {
        // Calendar will be updated by calendar.js module
    }

    // Update event list
    renderEventList(filteredEvents);

    // Update events count
    const countElement = document.getElementById('events-count');
    if (countElement) {
        countElement.textContent = `${filteredEvents.length} events`;
    }
}

export function getState() {
    return state;
}

// Make state accessible to other modules
window.appState = state;
window.showEventDetails = showEventDetails;

// Initialize on DOM content loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

export { init };
