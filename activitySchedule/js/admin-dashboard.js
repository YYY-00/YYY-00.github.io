/**
 * Admin Dashboard Module
 * Displays booking statistics and analytics
 */

import { getStatistics, events, bookings, categories } from './data.js';

// Render admin dashboard
export function renderDashboard() {
    const stats = calculateStatistics();

    // Update stat cards
    updateStatCards(stats);

    // Render revenue chart
    renderRevenueChart(stats.revenueByEvent);

    // Render venues chart
    renderVenuesChart(stats.popularVenues);

    // Render category chart
    renderCategoryChart(stats.eventsByCategory);
}

// Calculate statistics
function calculateStatistics() {
    const stats = {
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
        avgOccupancy: 0,
        activeEvents: events.length,
        revenueByEvent: [],
        popularVenues: [],
        eventsByCategory: {}
    };

    // Calculate revenue by event
    stats.revenueByEvent = events.map(event => {
        const eventBookings = bookings.filter(b => b.eventId === event.id);
        return {
            id: event.id,
            name: event.name,
            revenue: eventBookings.reduce((sum, b) => sum + b.totalPrice, 0),
            bookings: eventBookings.length
        };
    }).filter(e => e.revenue > 0).sort((a, b) => b.revenue - a.revenue);

    // Calculate venue popularity
    const venueMap = {};
    events.forEach(event => {
        const eventBookings = bookings.filter(b => b.eventId === event.id);
        if (!venueMap[event.venueId]) {
            venueMap[event.venueId] = {
                name: getVenueName(event.venueId),
                bookings: 0,
                revenue: 0
            };
        }
        venueMap[event.venueId].bookings += eventBookings.length;
        venueMap[event.venueId].revenue += eventBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    });
    stats.popularVenues = Object.values(venueMap).sort((a, b) => b.bookings - a.bookings);

    // Calculate category distribution
    Object.keys(categories).forEach(cat => {
        stats.eventsByCategory[cat] = events.filter(e => e.category === cat).length;
    });

    // Calculate average occupancy
    let totalCapacity = 0;
    let totalBookedSeats = 0;
    events.forEach(event => {
        totalCapacity += event.capacity;
        totalBookedSeats += event.bookedSeats.length;
    });
    stats.avgOccupancy = totalCapacity > 0 ? (totalBookedSeats / totalCapacity) * 100 : 0;

    return stats;
}

// Get venue name by ID
function getVenueName(venueId) {
    const venueNames = {
        'grand-hall': 'Grand Hall',
        'sports-arena': 'Sports Arena',
        'theater-royal': 'Theater Royal',
        'comedy-club': 'Comedy Club Downtown',
        'conference-center': 'Metropolitan Conference Center'
    };
    return venueNames[venueId] || 'Unknown Venue';
}

// Update stat cards
function updateStatCards(stats) {
    const totalBookingsEl = document.getElementById('total-bookings');
    const totalRevenueEl = document.getElementById('total-revenue');
    const avgOccupancyEl = document.getElementById('avg-occupancy');
    const activeEventsEl = document.getElementById('active-events');

    if (totalBookingsEl) {
        totalBookingsEl.textContent = stats.totalBookings;
    }

    if (totalRevenueEl) {
        totalRevenueEl.textContent = `$${stats.totalRevenue.toFixed(2)}`;
    }

    if (avgOccupancyEl) {
        avgOccupancyEl.textContent = `${stats.avgOccupancy.toFixed(1)}%`;
    }

    if (activeEventsEl) {
        activeEventsEl.textContent = stats.activeEvents;
    }
}

// Render revenue by event chart
function renderRevenueChart(revenueData) {
    const chartContainer = document.getElementById('revenue-chart');
    if (!chartContainer) return;

    if (revenueData.length === 0) {
        chartContainer.innerHTML = '<p style="color: var(--color-gray); text-align: center; padding: 2rem;">No revenue data yet. Complete some bookings to see statistics.</p>';
        return;
    }

    const maxRevenue = Math.max(...revenueData.map(e => e.revenue));

    chartContainer.innerHTML = revenueData.map(event => {
        const percentage = maxRevenue > 0 ? (event.revenue / maxRevenue) * 100 : 0;
        return `
            <div class="bar-item">
                <div class="bar-label">${event.name}</div>
                <div class="bar-container">
                    <div class="bar" style="width: ${percentage}%"></div>
                    <div class="bar-value">$${event.revenue.toFixed(2)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Render venues popularity chart
function renderVenuesChart(venuesData) {
    const chartContainer = document.getElementById('venues-chart');
    if (!chartContainer) return;

    if (venuesData.length === 0 || venuesData.every(v => v.bookings === 0)) {
        chartContainer.innerHTML = '<p style="color: var(--color-gray); text-align: center; padding: 2rem;">No venue data yet. Complete some bookings to see statistics.</p>';
        return;
    }

    const maxBookings = Math.max(...venuesData.map(v => v.bookings));

    chartContainer.innerHTML = venuesData.map(venue => {
        const percentage = maxBookings > 0 ? (venue.bookings / maxBookings) * 100 : 0;
        return `
            <div class="bar-item">
                <div class="bar-label">${venue.name}</div>
                <div class="bar-container">
                    <div class="bar" style="width: ${percentage}%"></div>
                    <div class="bar-value">${venue.bookings} booking${venue.bookings !== 1 ? 's' : ''}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Render category distribution chart
function renderCategoryChart(categoryData) {
    const chartContainer = document.getElementById('category-chart');
    if (!chartContainer) return;

    const maxEvents = Math.max(...Object.values(categoryData));

    chartContainer.innerHTML = Object.entries(categoryData).map(([cat, count]) => {
        const category = categories[cat];
        const percentage = maxEvents > 0 ? (count / maxEvents) * 100 : 0;
        return `
            <div class="bar-item">
                <div class="bar-label">${category.name}</div>
                <div class="bar-container">
                    <div class="bar" style="width: ${percentage}%; background-color: ${category.color}"></div>
                    <div class="bar-value">${count} event${count !== 1 ? 's' : ''}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Export statistics as data
export function exportStatistics() {
    const stats = calculateStatistics();

    // Create a simple text export
    const exportData = `
Activity Booking System - Statistics Report
Generated: ${new Date().toLocaleString()}

SUMMARY
-------
Total Bookings: ${stats.totalBookings}
Total Revenue: $${stats.totalRevenue.toFixed(2)}
Average Occupancy: ${stats.avgOccupancy.toFixed(1)}%
Active Events: ${stats.activeEvents}

REVENUE BY EVENT
----------------
${stats.revenueByEvent.map(e => `${e.name}: $${e.revenue.toFixed(2)} (${e.bookings} bookings)`).join('\n')}

POPULAR VENUES
---------------
${stats.popularVenues.map(v => `${v.name}: ${v.bookings} bookings ($${v.revenue.toFixed(2)})`).join('\n')}

CATEGORY DISTRIBUTION
---------------------
${Object.entries(stats.eventsByCategory).map(([cat, count]) => `${categories[cat].name}: ${count} events`).join('\n')}
    `;

    // Create download link
    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-stats-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Refresh dashboard (call after new booking)
export function refreshDashboard() {
    renderDashboard();
}

// Export functions
export { calculateStatistics };
