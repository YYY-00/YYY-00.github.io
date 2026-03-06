/**
 * Data layer for Activity Booking System
 * Contains mock data for events, venues, and bookings
 */

// Venue configurations with seat layouts
export const venues = [
    {
        id: 'grand-hall',
        name: 'Grand Hall',
        address: '123 Main Street, Downtown',
        capacity: 500,
        seatLayout: {
            vip: { rows: 2, seatsPerRow: 10, price: 150, startY: 0, label: 'VIP' },
            premium: { rows: 3, seatsPerRow: 12, price: 100, startY: 2, label: 'Premium' },
            standard: { rows: 5, seatsPerRow: 14, price: 75, startY: 5, label: 'Standard' },
            economy: { rows: 4, seatsPerRow: 16, price: 50, startY: 10, label: 'Economy' }
        },
        sections: ['VIP', 'Premium', 'Standard', 'Economy']
    },
    {
        id: 'sports-arena',
        name: 'Sports Arena',
        address: '456 Arena Boulevard',
        capacity: 1500,
        seatLayout: {
            courtside: { rows: 2, seatsPerRow: 20, price: 200, startY: 0, label: 'Courtside' },
            lower: { rows: 5, seatsPerRow: 30, price: 100, startY: 2, label: 'Lower Bowl' },
            upper: { rows: 8, seatsPerRow: 35, price: 60, startY: 7, label: 'Upper Bowl' },
            GA: { rows: 0, seatsPerRow: 0, price: 40, startY: 15, label: 'General Admission' }
        },
        sections: ['Courtside', 'Lower Bowl', 'Upper Bowl', 'GA']
    },
    {
        id: 'theater-royal',
        name: 'Theater Royal',
        address: '789 Theater Lane',
        capacity: 300,
        seatLayout: {
            orchestra: { rows: 3, seatsPerRow: 12, price:120, startY: 0, label: 'Orchestra' },
            mezzanine: { rows: 3, seatsPerRow: 10, price: 90, startY: 3, label: 'Mezzanine' },
            balcony: { rows: 2, seatsPerRow: 14, price: 65, startY: 6, label: 'Balcony' }
        },
        sections: ['Orchestra', 'Mezzanine', 'Balcony']
    },
    {
        id: 'comedy-club',
        name: 'Comedy Club Downtown',
        address: '321 Laugh Street',
        capacity: 150,
        seatLayout: {
            tables: { rows: 4, seatsPerRow: 8, price: 45, startY: 0, label: 'Table Seating' }
        },
        sections: ['Table Seating']
    },
    {
        id: 'conference-center',
        name: 'Metropolitan Conference Center',
        address: '555 Business Park',
        capacity: 800,
        seatLayout: {
            front: { rows: 5, seatsPerRow: 20, price: 150, startY: 0, label: 'Front Section' },
            middle: { rows: 8, seatsPerRow: 25, price: 100, startY: 5, label: 'Middle Section' },
            back: { rows: 6, seatsPerRow: 30, price: 75, startY: 13, label: 'Back Section' }
        },
        sections: ['Front Section', 'Middle Section', 'Back Section']
    }
];

// Event categories with colors
export const categories = {
    concert: { name: 'Concert', color: '#ec4899' },
    sports: { name: 'Sports', color: '#3b82f6' },
    theater: { name: 'Theater', color: '#8b5cf6' },
    comedy: { name: 'Comedy', color: '#f59e0b' },
    conference: { name: 'Conference', color: '#14b8a6' }
};

// Generate events for March 2026
export const events = [
    {
        id: 'evt-001',
        name: 'Symphony Orchestra Evening',
        date: '2026-03-05',
        time: '19:30:00',
        timezone: 'America/New_York',
        venueId: 'grand-hall',
        category: 'concert',
        description: 'An evening of classical music featuring the Metropolitan Symphony Orchestra performing Beethoven and Mozart masterpieces.',
        basePrice: 75,
        bookedSeats: [],
        capacity: 500
    },
    {
        id: 'evt-002',
        name: 'Championship Basketball',
        date: '2026-03-07',
        time: '18:00:00',
        timezone: 'America/New_York',
        venueId: 'sports-arena',
        category: 'sports',
        description: 'Season finale basketball game. Watch the top two teams compete for the championship title.',
        basePrice: 60,
        bookedSeats: ['courtside-1-1', 'courtside-1-2', 'courtside-1-3', 'lower-2-5', 'lower-2-6'],
        capacity: 1500
    },
    {
        id: 'evt-003',
        name: 'Shakespeare Festival: Hamlet',
        date: '2026-03-08',
        time: '20:00:00',
        timezone: 'America/New_York',
        venueId: 'theater-royal',
        category: 'theater',
        description: 'A modern adaptation of Shakespeare\'s tragic masterpiece performed by the award-winning Royal Theater Company.',
        basePrice: 65,
        bookedSeats: ['orchestra-1-5', 'orchestra-1-6'],
        capacity: 300
    },
    {
        id: 'evt-004',
        name: 'Stand-Up Comedy Night',
        date: '2026-03-10',
        time: '21:00:00',
        timezone: 'America/New_York',
        venueId: 'comedy-club',
        category: 'comedy',
        description: 'Featuring three top comedians from the national comedy circuit. Two hours of non-stop laughs!',
        basePrice: 45,
        bookedSeats: ['tables-1-3', 'tables-1-4', 'tables-2-5'],
        capacity: 150
    },
    {
        id: 'evt-005',
        name: 'Tech Innovation Summit',
        date: '2026-03-12',
        time: '09:00:00',
        timezone: 'America/New_York',
        venueId: 'conference-center',
        category: 'conference',
        description: 'Annual technology conference featuring keynote speakers from leading tech companies and startups.',
        basePrice: 75,
        bookedSeats: ['front-1-1', 'front-1-2', 'front-2-3', 'front-2-4'],
        capacity: 800
    },
    {
        id: 'evt-006',
        name: 'Rock Concert: The Electrics',
        date: '2026-03-14',
        time: '20:30:00',
        timezone: 'America/New_York',
        venueId: 'grand-hall',
        category: 'concert',
        description: 'High-energy rock concert with chart-topping band The Electrics. Special guest opening act.',
        basePrice: 75,
        bookedSeats: ['vip-1-1', 'vip-1-2', 'premium-3-3', 'premium-3-4', 'standard-6-5', 'standard-6-6'],
        capacity: 500
    },
    {
        id: 'evt-007',
        name: 'Soccer Match: City vs United',
        date: '2026-03-15',
        time: '15:00:00',
        timezone: 'America/New_York',
        venueId: 'sports-arena',
        category: 'sports',
        description: 'Intense rivalry soccer match. Two top league teams face off in this highly anticipated game.',
        basePrice: 60,
        bookedSeats: [
            'courtside-1-5', 'courtside-1-6', 'courtside-1-7', 'courtside-1-8',
            'lower-3-10', 'lower-3-11', 'lower-4-12'
        ],
        capacity: 1500
    },
    {
        id: 'evt-008',
        name: 'Musical: Broadway Nights',
        date: '2026-03-18',
        time: '19:00:00',
        timezone: 'America/New_York',
        venueId: 'theater-royal',
        category: 'theater',
        description: 'Spectacular Broadway-style musical featuring classic songs and dazzling choreography.',
        basePrice: 65,
        bookedSeats: ['orchestra-2-7', 'mezzanine-4-5', 'balcony-7-8'],
        capacity: 300
    },
    {
        id: 'evt-009',
        name: 'Comedy Special: Live Recording',
        date: '2026-03-20',
        time: '20:00:00',
        timezone: 'America/New_York',
        venueId: 'comedy-club',
        category: 'comedy',
        description: 'Exclusive live recording of a new comedy special. Be part of the studio audience!',
        basePrice: 45,
        bookedSeats: ['tables-1-6', 'tables-1-7', 'tables-2-8', 'tables-3-9'],
        capacity: 150
    },
    {
        id: 'evt-010',
        name: 'AI & Machine Learning Expo',
        date: '2026-03-22',
        time: '10:00:00',
        timezone: 'America/New_York',
        venueId: 'conference-center',
        category: 'conference',
        description: 'Explore the latest in AI and ML with industry experts, hands-on workshops, and networking.',
        basePrice: 75,
        bookedSeats: ['front-3-5', 'front-3-6', 'middle-8-10', 'middle-8-11'],
        capacity: 800
    },
    {
        id: 'evt-011',
        name: 'Jazz Night Live',
        date: '2026-03-24',
        time: '20:00:00',
        timezone: 'America/New_York',
        venueId: 'grand-hall',
        category: 'concert',
        description: 'Smooth jazz evening with the Marcus Johnson Quartet. Dinner and drinks available.',
        basePrice: 75,
        bookedSeats: ['premium-4-8', 'premium-4-9', 'standard-7-10'],
        capacity: 500
    },
    {
        id: 'evt-012',
        name: 'Hockey Finals',
        date: '2026-03-26',
        time: '19:00:00',
        timezone: 'America/New_York',
        venueId: 'sports-arena',
        category: 'sports',
        description: 'Stanley Cup finals game. Fast-paced hockey action at its finest!',
        basePrice: 60,
        bookedSeats: [
            'courtside-2-9', 'courtside-2-10', 'lower-5-12', 'lower-5-13',
            'lower-6-14', 'upper-10-15', 'upper-10-16'
        ],
        capacity: 1500
    },
    {
        id: 'evt-013',
        name: 'Drama: The Glass Menagerie',
        date: '2026-03-27',
        time: '19:30:00',
        timezone: 'America/New_York',
        venueId: 'theater-royal',
        category: 'theater',
        description: 'Tennessee Williams\' classic American drama. An intimate and powerful theatrical experience.',
        basePrice: 65,
        bookedSeats: ['orchestra-3-9', 'mezzanine-5-11'],
        capacity: 300
    },
    {
        id: 'evt-014',
        name: 'Improv Comedy Showcase',
        date: '2026-03-28',
        time: '21:30:00',
        timezone: 'America/New_York',
        venueId: 'comedy-club',
        category: 'comedy',
        description: 'Spontaneous comedy fun! Audience participation encouraged. Different every show.',
        basePrice: 45,
        bookedSeats: ['tables-3-10', 'tables-3-11'],
        capacity: 150
    },
    {
        id: 'evt-015',
        name: 'Digital Marketing Conference',
        date: '2026-03-30',
        time: '08:30:00',
        timezone: 'America/New_York',
        venueId: 'conference-center',
        category: 'conference',
        description: 'Learn the latest digital marketing strategies from industry leaders and practitioners.',
        basePrice: 75,
        bookedSeats: ['middle-9-12', 'middle-9-13', 'middle-10-14'],
        capacity: 800
    },
    {
        id: 'evt-016',
        name: 'Pop Music Festival',
        date: '2026-04-02',
        time: '14:00:00',
        timezone: 'America/New_York',
        venueId: 'grand-hall',
        category: 'concert',
        description: 'All-day music festival featuring local and national pop artists. Food vendors on-site.',
        basePrice: 75,
        bookedSeats: ['standard-8-15', 'standard-9-16', 'economy-12-17'],
        capacity: 500
    },
    {
        id: 'evt-017',
        name: 'Tennis Championship Match',
        date: '2026-04-05',
        time: '13:00:00',
        timezone: 'America/New_York',
        venueId: 'sports-arena',
        category: 'sports',
        description: 'Professional tennis championship final. World-class athletes competing.',
        basePrice: 60,
        bookedSeats: ['courtside-1-11', 'lower-7-15'],
        capacity: 1500
    },
    {
        id: 'evt-018',
        name: 'Opera: The Marriage of Figaro',
        date: '2026-04-08',
        time: '19:00:00',
        timezone: 'America/New_York',
        venueId: 'theater-royal',
        category: 'theater',
        description: 'Mozart\'s beloved comedic opera performed by the Metropolitan Opera Company.',
        basePrice: 65,
        bookedSeats: ['balcony-8-12'],
        capacity: 300
    },
    {
        id: 'evt-019',
        name: 'Startup Pitch Competition',
        date: '2026-04-10',
        time: '18:00:00',
        timezone: 'America/New_York',
        venueId: 'conference-center',
        category: 'conference',
        description: 'Watch innovative startups pitch to investors. Networking reception follows.',
        basePrice: 75,
        bookedSeats: ['front-4-13', 'middle-11-15', 'back-15-16'],
        capacity: 800
    },
    {
        id: 'evt-020',
        name: 'Acoustic Guitar Night',
        date: '2026-04-12',
        time: '20:00:00',
        timezone: 'America/New_York',
        venueId: 'grand-hall',
        category: 'concert',
        description: 'Intimate acoustic performances by renowned guitarists. Perfect for music lovers.',
        basePrice: 75,
        bookedSeats: [],
        capacity: 500
    }
];

// Booking storage (in-memory for prototype)
export const bookings = [];

// Helper functions for date/time handling
export function formatDate(dateString, includeTime = false) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(includeTime && {
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
        })
    };
    return date.toLocaleDateString('en-US', options);
}

export function formatTime(timeString, timezone = 'America/New_York') {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const options = {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: timezone
    };

    return date.toLocaleTimeString('en-US', options);
}

export function getUserTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Helper function to get events by date range
export function getEventsInRange(startDate, endDate) {
    return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
    });
}

// Helper function to get events by venue
export function getEventsByVenue(venueId) {
    return events.filter(event => event.venueId === venueId);
}

// Helper function to get events by category
export function getEventsByCategory(category) {
    return events.filter(event => event.category === category);
}

// Helper function to get event by ID
export function getEventById(eventId) {
    return events.find(event => event.id === eventId);
}

// Helper function to get venue by ID
export function getVenueById(venueId) {
    return venues.find(venue => venue.id === venueId);
}

// Calculate total seats for a venue
export function getTotalSeatsForVenue(venueId) {
    const venue = getVenueById(venueId);
    if (!venue) return 0;

    let total = 0;
    Object.values(venue.seatLayout).forEach(section => {
        total += section.rows * section.seatsPerRow;
    });
    return total;
}

// Generate unique booking ID
export function generateBookingId() {
    return 'BK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Create booking
export function createBooking(eventId, selectedSeats) {
    const event = getEventById(eventId);
    const venue = getVenueById(event.venueId);

    const booking = {
        id: generateBookingId(),
        eventId,
        eventName: event.name,
        eventDate: event.date,
        eventTime: event.time,
        venueName: venue.name,
        seats: selectedSeats.map(seat => ({
            id: seat.id,
            label: seat.label,
            price: seat.price,
            section: seat.section
        })),
        totalPrice: selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
        bookingDate: new Date().toISOString(),
        status: 'confirmed'
    };

    bookings.push(booking);

    // Mark seats as booked in the event
    selectedSeats.forEach(seat => {
        if (!event.bookedSeats.includes(seat.id)) {
            event.bookedSeats.push(seat.id);
        }
    });

    return booking;
}

// Get all bookings (for admin dashboard)
export function getAllBookings() {
    return bookings;
}

// Calculate statistics for admin dashboard
export function getStatistics() {
    const stats = {
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
        avgOccupancy: 0,
        activeEvents: events.length,
        eventsByCategory: {},
        revenueByEvent: {},
        popularVenues: {}
    };

    // Calculate revenue by event
    events.forEach(event => {
        const eventBookings = bookings.filter(b => b.eventId === event.id);
        stats.revenueByEvent[event.id] = {
            name: event.name,
            revenue: eventBookings.reduce((sum, b) => sum + b.totalPrice, 0)
        };
    });

    // Calculate category distribution
    events.forEach(event => {
        if (!stats.eventsByCategory[event.category]) {
            stats.eventsByCategory[event.category] = 0;
        }
        stats.eventsByCategory[event.category]++;
    });

    // Calculate popular venues
    events.forEach(event => {
        if (!stats.popularVenues[event.venueId]) {
            stats.popularVenues[event.venueId] = {
                name: getVenueById(event.venueId).name,
                bookings: 0
            };
        }
        stats.popularVenues[event.venueId].bookings += bookings.filter(b => b.eventId === event.id).length;
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
