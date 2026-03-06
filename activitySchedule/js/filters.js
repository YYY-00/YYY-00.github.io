/**
 * Filters Module
 * Handles event filtering by date, venue, and category
 */

import { events, venues, categories } from './data.js';
import { updateFilteredEvents } from './app.js';
import { updateCalendarEvents } from './calendar.js';

let currentFilters = {
    startDate: null,
    endDate: null,
    venueId: '',
    categories: ['concert', 'sports', 'theater', 'comedy', 'conference']
};

// Initialize filters
export function initializeFilters() {
    // Date filter listeners
    const startDateInput = document.getElementById('date-filter-start');
    const endDateInput = document.getElementById('date-filter-end');

    if (startDateInput) {
        startDateInput.addEventListener('change', handleDateFilterChange);
    }
    if (endDateInput) {
        endDateInput.addEventListener('change', handleDateFilterChange);
    }

    // Venue filter listener
    const venueFilter = document.getElementById('venue-filter');
    if (venueFilter) {
        venueFilter.addEventListener('change', handleVenueFilterChange);
    }

    // Category filter listeners
    const categoryCheckboxes = document.querySelectorAll('#category-filters input');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCategoryFilterChange);
    });
}

// Handle date filter changes
function handleDateFilterChange() {
    const startDateInput = document.getElementById('date-filter-start');
    const endDateInput = document.getElementById('date-filter-end');

    currentFilters.startDate = startDateInput.value ? new Date(startDateInput.value) : null;
    currentFilters.endDate = endDateInput.value ? new Date(endDateInput.value) : null;

    applyFilters();
}

// Handle venue filter changes
function handleVenueFilterChange(e) {
    currentFilters.venueId = e.target.value;
    applyFilters();
}

// Handle category filter changes
function handleCategoryFilterChange() {
    const checkboxes = document.querySelectorAll('#category-filters input:checked');
    currentFilters.categories = Array.from(checkboxes).map(cb => cb.value);
    applyFilters();
}

// Apply all filters
export function applyFilters() {
    let filteredEvents = [...events];

    // Filter by date range
    if (currentFilters.startDate || currentFilters.endDate) {
        filteredEvents = filteredEvents.filter(event => {
            const eventDate = new Date(event.date);

            if (currentFilters.startDate && eventDate < currentFilters.startDate) {
                return false;
            }

            if (currentFilters.endDate) {
                const endDate = new Date(currentFilters.endDate);
                endDate.setHours(23, 59, 59, 999);
                if (eventDate > endDate) {
                    return false;
                }
            }

            return true;
        });
    }

    // Filter by venue
    if (currentFilters.venueId) {
        filteredEvents = filteredEvents.filter(event => event.venueId === currentFilters.venueId);
    }

    // Filter by category
    if (currentFilters.categories.length > 0) {
        filteredEvents = filteredEvents.filter(event =>
            currentFilters.categories.includes(event.category)
        );
    }

    // Update app state
    updateFilteredEvents(filteredEvents);

    // Update calendar
    updateCalendarEvents(filteredEvents);

    // Dispatch event for other modules
    const event = new CustomEvent('eventsFiltered', {
        detail: { events: filteredEvents }
    });
    document.dispatchEvent(event);
}

// Render event list
export function renderEventList(events) {
    const eventsListContainer = document.getElementById('events-list');
    const countElement = document.getElementById('events-count');

    if (!eventsListContainer) return;

    // Update count
    if (countElement) {
        countElement.textContent = `${events.length} events`;
    }

    // Clear existing content
    eventsListContainer.innerHTML = '';

    if (events.length === 0) {
        eventsListContainer.innerHTML = `
            <div class="no-events">
                <p>No events match your filters. Try adjusting your criteria.</p>
            </div>
        `;
        return;
    }

    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    // Render event cards
    sortedEvents.forEach(event => {
        const eventCard = createEventCard(event);
        eventsListContainer.appendChild(eventCard);
    });
}

// Create event card element
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.addEventListener('click', () => {
        window.showEventDetails(event.id);
    });

    const eventDate = new Date(event.date);
    const venue = venues.find(v => v.id === event.venueId);
    const category = categories[event.category];

    // Calculate availability
    const bookedCount = event.bookedSeats.length;
    const availableCount = event.capacity - bookedCount;
    const availabilityPercent = ((availableCount / event.capacity) * 100).toFixed(0);

    card.innerHTML = `
        <div class="event-date">
            <div class="event-date-day">${eventDate.getDate()}</div>
            <div class="event-date-month">${eventDate.toLocaleDateString('en-US', { month: 'short' })}</div>
            <div class="event-date-year">${eventDate.getFullYear()}</div>
        </div>
        <div class="event-info">
            <div class="event-title">${event.name}</div>
            <div class="event-meta">
                <div class="event-meta-item">
                    <span>🕐</span>
                    <span>${new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                    })}</span>
                </div>
                <div class="event-meta-item">
                    <span>📍</span>
                    <span>${venue ? venue.name : 'Unknown Venue'}</span>
                </div>
                <div class="event-meta-item">
                    <span>💺</span>
                    <span>${availableCount} seats left</span>
                </div>
            </div>
            <div class="event-meta">
                <span class="event-category ${event.category}">${category.name}</span>
            </div>
        </div>
    `;

    return card;
}

// Get current filters
export function getCurrentFilters() {
    return { ...currentFilters };
}

// Reset filters to defaults
export function resetFilters() {
    currentFilters = {
        startDate: null,
        endDate: null,
        venueId: '',
        categories: ['concert', 'sports', 'theater', 'comedy', 'conference']
    };

    // Reset UI
    document.getElementById('date-filter-start').value = '';
    document.getElementById('date-filter-end').value = '';
    document.getElementById('venue-filter').value = '';

    document.querySelectorAll('#category-filters input').forEach(checkbox => {
        checkbox.checked = true;
    });

    applyFilters();
}

// Search events by name
export function searchEvents(query) {
    if (!query || query.trim() === '') {
        return events;
    }

    const lowerQuery = query.toLowerCase();
    return events.filter(event =>
        event.name.toLowerCase().includes(lowerQuery) ||
        event.description.toLowerCase().includes(lowerQuery)
    );
}

// Export current filters for other modules
export { currentFilters };
