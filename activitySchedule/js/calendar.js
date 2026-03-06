/**
 * Calendar View Component
 * Handles calendar rendering, navigation, and event display
 */

import { events, categories } from './data.js';
import { updateFilteredEvents } from './app.js';

let currentMonth = new Date();
let currentEvents = [...events];

// Initialize calendar
export function initializeCalendar(date, events) {
    currentMonth = date;
    currentEvents = events;
    renderCalendar();
}

// Render calendar
export function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthTitle = document.getElementById('current-month');

    if (!calendar) return;

    // Update month title
    monthTitle.textContent = currentMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    // Clear existing calendar (keep headers)
    const headers = calendar.querySelectorAll('.calendar-day-header');
    calendar.innerHTML = '';
    headers.forEach(header => calendar.appendChild(header));

    // Get calendar data
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Get previous month's end
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    // Get today's date
    const today = new Date();

    // Calculate total cells needed (6 weeks max)
    const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;

    // Render calendar cells
    for (let i = 0; i < totalCells; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';

        let dayNumber;
        let cellDate;

        // Previous month days
        if (i < startingDayOfWeek) {
            dayNumber = prevMonthLastDay - startingDayOfWeek + i + 1;
            dayCell.classList.add('other-month');
            cellDate = new Date(year, month - 1, dayNumber);
        }
        // Current month days
        else if (i < startingDayOfWeek + daysInMonth) {
            dayNumber = i - startingDayOfWeek + 1;
            cellDate = new Date(year, month, dayNumber);

            // Check if today
            if (cellDate.toDateString() === today.toDateString()) {
                dayCell.classList.add('today');
            }
        }
        // Next month days
        else {
            dayNumber = i - startingDayOfWeek - daysInMonth + 1;
            dayCell.classList.add('other-month');
            cellDate = new Date(year, month + 1, dayNumber);
        }

        // Add day number
        const dayNumberEl = document.createElement('div');
        dayNumberEl.className = 'calendar-day-number';
        dayNumberEl.textContent = dayNumber;
        dayCell.appendChild(dayNumberEl);

        // Find events for this day
        const dayEvents = getEventsForDate(cellDate);

        if (dayEvents.length > 0) {
            const eventContainer = document.createElement('div');

            if (dayEvents.length > 3) {
                // Show dots if more than 3 events
                const dotsContainer = document.createElement('div');
                dotsContainer.className = 'event-dots';

                dayEvents.slice(0, 5).forEach(event => {
                    const dot = document.createElement('span');
                    dot.className = `event-dot ${event.category}`;
                    dotsContainer.appendChild(dot);
                });

                eventContainer.appendChild(dotsContainer);
            } else {
                // Show event summaries
                dayEvents.forEach(event => {
                    const eventEl = document.createElement('div');
                    eventEl.className = `event-summary ${event.category}`;
                    eventEl.textContent = event.name;
                    eventEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        window.showEventDetails(event.id);
                    });
                    eventContainer.appendChild(eventEl);
                });
            }

            dayCell.appendChild(eventContainer);

            // Make cell clickable
            dayCell.addEventListener('click', () => {
                if (dayEvents.length === 1) {
                    window.showEventDetails(dayEvents[0].id);
                } else {
                    // Show list of events for this day
                    showDayEvents(dayEvents);
                }
            });
        }

        calendar.appendChild(dayCell);
    }
}

// Get events for specific date
function getEventsForDate(date) {
    return currentEvents.filter(event => {
        const eventDate = new Date(event.date);
        return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
        );
    });
}

// Show events for a specific day
function showDayEvents(dayEvents) {
    // For now, just show the first event
    // In a full implementation, this could show a modal with all events
    if (dayEvents.length > 0) {
        window.showEventDetails(dayEvents[0].id);
    }
}

// Navigate between months
export function navigateMonth(direction) {
    currentMonth.setMonth(currentMonth.getMonth() + direction);
    renderCalendar();
}

// Go to specific month
export function goToMonth(year, month) {
    currentMonth = new Date(year, month, 1);
    renderCalendar();
}

// Update calendar events (called when filters change)
export function updateCalendarEvents(events) {
    currentEvents = events;
    renderCalendar();
}

// Export functions
export { currentMonth, currentEvents };

// Listen for filter updates
document.addEventListener('eventsFiltered', (e) => {
    if (e.detail && e.detail.events) {
        updateCalendarEvents(e.detail.events);
    }
});
