/**
 * Event Booking System - Data & State Management
 */

const app = app || {};

// Venues configuration
const venues = {
  msg: {
    id: 'msg',
    name: 'Madison Square Garden',
    city: 'New York',
    state: 'NY',
    capacity: 20000,
    seatMap: 'theater',
    sections: ['Floor', '100 Level', '200 Level', '300 Level'],
    rows: 25,
    seatsPerRow: 30,
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800'
  },
  wework: {
    id: 'wework',
    name: 'WeWork Conference Center',
    city: 'San Francisco',
    state: 'CA',
    capacity: 500,
    seatMap: 'conference',
    sections: ['Main Hall', 'Side Room A', 'Side Room B'],
    rows: 10,
    seatsPerRow: 20,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
  },
  stadium: {
    id: 'stadium',
    name: 'National Stadium',
    city: 'Los Angeles',
    state: 'CA',
    capacity: 80000,
    seatMap: 'stadium',
    sections: ['North Stand', 'South Stand', 'East Stand', 'West Stand', 'VIP Suites'],
    rows: 50,
    seatsPerRow: 40,
    image: 'https://images.unsplash.com/photo-1489945052260-4f21c52571fd?w=800'
  },
  theater: {
    id: 'theater',
    name: 'Broadway Theater',
    city: 'New York',
    state: 'NY',
    capacity: 1800,
    seatMap: 'theater',
    sections: ['Orchestra', 'Mezzanine', 'Balcony'],
    rows: 20,
    seatsPerRow: 25,
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800'
  }
};

// Sample events
const defaultEvents = [
  {
    id: 'evt_001',
    name: 'Summer Music Festival',
    date: '2026-06-15T19:00:00Z',
    timezone: 'America/New_York',
    venue: 'Madison Square Garden',
    venueId: 'msg',
    category: 'Concert',
    price: 150,
    basePrice: 150,
    currency: 'USD',
    capacity: 20000,
    bookedSeats: 850,
    description: 'An amazing outdoor music experience featuring top artists from around the world. Join us for three days of incredible performances, food vendors, and memorable moments.',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    featured: true,
    soldOutSeats: ['A1', 'A2', 'A3', 'B5', 'B6', 'C10', 'C11', 'D15']
  },
  {
    id: 'evt_002',
    name: 'Tech Innovation Summit 2026',
    date: '2026-04-20T09:00:00Z',
    timezone: 'America/Los_Angeles',
    venue: 'WeWork Conference Center',
    venueId: 'wework',
    category: 'Conference',
    price: 299,
    basePrice: 299,
    currency: 'USD',
    capacity: 500,
    bookedSeats: 320,
    description: 'The premier technology conference featuring industry leaders, hands-on workshops, and networking opportunities.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    featured: true,
    soldOutSeats: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'C3', 'C4']
  },
  {
    id: 'evt_003',
    name: 'NBA Finals - Game 7',
    date: '2026-06-10T20:00:00Z',
    timezone: 'America/Los_Angeles',
    venue: 'National Stadium',
    venueId: 'stadium',
    category: 'Sports',
    price: 450,
    basePrice: 450,
    currency: 'USD',
    capacity: 80000,
    bookedSeats: 75000,
    description: 'The decisive game of the NBA Finals. Witness history as two legendary teams battle for the championship.',
    image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800',
    featured: true,
    soldOutSeats: ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5', 'C1', 'C2', 'C3']
  },
  {
    id: 'evt_004',
    name: 'The Phantom of the Opera',
    date: '2026-04-05T19:30:00Z',
    timezone: 'America/New_York',
    venue: 'Broadway Theater',
    venueId: 'theater',
    category: 'Theater',
    price: 125,
    basePrice: 125,
    currency: 'USD',
    capacity: 1800,
    bookedSeats: 1650,
    description: 'The world\'s most beloved musical returns. Experience the magic of Phantom in this stunning production.',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    featured: false,
    soldOutSeats: ['O1', 'O2', 'O3', 'O4', 'O5', 'M1', 'M2', 'M3', 'M4', 'B1', 'B2']
  },
  {
    id: 'evt_005',
    name: 'Jazz Night Live',
    date: '2026-04-12T20:00:00Z',
    timezone: 'America/Chicago',
    venue: 'Madison Square Garden',
    venueId: 'msg',
    category: 'Concert',
    price: 85,
    basePrice: 85,
    currency: 'USD',
    capacity: 20000,
    bookedSeats: 3200,
    description: 'An intimate evening of world-class jazz performances. Featuring Grammy-winning artists and rising stars.',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
    featured: false,
    soldOutSeats: ['A1', 'A2', 'B1', 'B2']
  },
  {
    id: 'evt_006',
    name: 'Startup Pitch Competition',
    date: '2026-05-01T14:00:00Z',
    timezone: 'America/New_York',
    venue: 'WeWork Conference Center',
    venueId: 'wework',
    category: 'Conference',
    price: 50,
    basePrice: 50,
    currency: 'USD',
    capacity: 500,
    bookedSeats: 250,
    description: 'Watch promising startups pitch their ideas to top investors. Network with entrepreneurs and VCs.',
    image: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800',
    featured: false,
    soldOutSeats: ['A1', 'A2', 'A3', 'B1']
  },
  {
    id: 'evt_007',
    name: 'Championship Boxing',
    date: '2026-05-15T21:00:00Z',
    timezone: 'America/Las_Vegas',
    venue: 'National Stadium',
    venueId: 'stadium',
    category: 'Sports',
    price: 350,
    basePrice: 350,
    currency: 'USD',
    capacity: 80000,
    bookedSeats: 65000,
    description: 'The biggest boxing event of the year. Championship fight with undercard bouts featuring rising contenders.',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
    featured: true,
    soldOutSeats: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2']
  },
  {
    id: 'evt_008',
    name: 'Shakespeare in the Park',
    date: '2026-06-01T18:00:00Z',
    timezone: 'America/New_York',
    venue: 'Broadway Theater',
    venueId: 'theater',
    category: 'Theater',
    price: 45,
    basePrice: 45,
    currency: 'USD',
    capacity: 1800,
    bookedSeats: 900,
    description: 'A magical outdoor production of A Midsummer Night\'s Dream. Bring a blanket and enjoy Shakespeare under the stars.',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    featured: false,
    soldOutSeats: ['O1', 'O2', 'O3', 'M1', 'M2']
  },
  {
    id: 'evt_009',
    name: 'EDM Festival',
    date: '2026-07-20T16:00:00Z',
    timezone: 'America/Los_Angeles',
    venue: 'National Stadium',
    venueId: 'stadium',
    category: 'Concert',
    price: 200,
    basePrice: 200,
    currency: 'USD',
    capacity: 80000,
    bookedSeats: 72000,
    description: 'Three stages, 50+ artists, one unforgettable weekend. The ultimate electronic dance music experience.',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    featured: true,
    soldOutSeats: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10']
  },
  {
    id: 'evt_010',
    name: 'AI & Machine Learning Expo',
    date: '2026-04-25T10:00:00Z',
    timezone: 'America/San_Francisco',
    venue: 'WeWork Conference Center',
    venueId: 'wework',
    category: 'Conference',
    price: 175,
    basePrice: 175,
    currency: 'USD',
    capacity: 500,
    bookedSeats: 380,
    description: 'Explore the latest in AI technology. Keynotes from industry pioneers, hands-on demos, and workshops.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    featured: false,
    soldOutSeats: ['A1', 'A2', 'B1', 'B2', 'B3']
  }
];

// Categories
const categories = [
  { id: 'concert', name: 'Concert', icon: '🎵' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'theater', name: 'Theater', icon: '🎭' },
  { id: 'conference', name: 'Conference', icon: '💼' },
  { id: 'comedy', name: 'Comedy', icon: '😂' },
  { id: 'workshop', name: 'Workshop', icon: '🔧' }
];

// Initialize application data
app.data = {
  events: [],
  venues: venues,
  categories: categories,
  bookings: [],
  currentUser: null,

  /**
   * Initialize data from localStorage or defaults
   */
  init() {
    // Load events
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      this.events = JSON.parse(storedEvents);
    } else {
      this.events = [...defaultEvents];
      this.saveEvents();
    }

    // Load bookings
    const storedBookings = localStorage.getItem('bookings');
    if (storedBookings) {
      this.bookings = JSON.parse(storedBookings);
    } else {
      this.bookings = [];
      this.saveBookings();
    }

    // Load user
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  },

  /**
   * Save events to localStorage
   */
  saveEvents() {
    localStorage.setItem('events', JSON.stringify(this.events));
  },

  /**
   * Save bookings to localStorage
   */
  saveBookings() {
    localStorage.setItem('bookings', JSON.stringify(this.bookings));
  },

  /**
   * Save current user to localStorage
   */
  saveUser(user) {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  },

  /**
   * Get event by ID
   */
  getEvent(eventId) {
    return this.events.find(e => e.id === eventId);
  },

  /**
   * Get venue by ID
   */
  getVenue(venueId) {
    return this.venues[venueId];
  },

  /**
   * Get all unique venues from events
   */
  getEventVenues() {
    const venueSet = new Set(this.events.map(e => e.venue));
    return Array.from(venueSet);
  },

  /**
   * Get bookings by event
   */
  getBookingsByEvent(eventId) {
    return this.bookings.filter(b => b.eventId === eventId);
  },

  /**
   * Get booking by ticket ID
   */
  getBookingByTicketId(ticketId) {
    return this.bookings.find(b => b.ticketId === ticketId);
  },

  /**
   * Create a new booking
   */
  createBooking(bookingData) {
    const booking = {
      id: app.utils.generateId('bk'),
      ticketId: app.utils.generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'confirmed',
      ...bookingData
    };

    this.bookings.push(booking);
    this.saveBookings();

    // Update event booked seats
    const event = this.getEvent(booking.eventId);
    if (event) {
      event.bookedSeats += booking.seats.length;
      if (!event.soldOutSeats) {
        event.soldOutSeats = [];
      }
      event.soldOutSeats.push(...booking.seats);
      this.saveEvents();
    }

    return booking;
  },

  /**
   * Cancel booking
   */
  cancelBooking(bookingId) {
    const index = this.bookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      const booking = this.bookings[index];
      booking.status = 'cancelled';
      booking.cancelledAt = new Date().toISOString();

      // Update event booked seats
      const event = this.getEvent(booking.eventId);
      if (event) {
        event.bookedSeats -= booking.seats.length;
        event.soldOutSeats = event.soldOutSeats.filter(s => !booking.seats.includes(s));
        this.saveEvents();
      }

      this.saveBookings();
      return true;
    }
    return false;
  },

  /**
   * Filter events
   */
  filterEvents(filters = {}) {
    let filtered = [...this.events];

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(e => new Date(e.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(e => new Date(e.date) <= new Date(filters.endDate));
    }

    // Venue filter
    if (filters.venue) {
      filtered = filtered.filter(e => e.venue === filters.venue);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(e => e.category.toLowerCase() === filters.category.toLowerCase());
    }

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search) ||
        e.venue.toLowerCase().includes(search)
      );
    }

    // Featured filter
    if (filters.featured === true) {
      filtered = filtered.filter(e => e.featured === true);
    }

    // Date filter (specific date)
    if (filters.date) {
      const filterDate = new Date(filters.date);
      filtered = filtered.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.toDateString() === filterDate.toDateString();
      });
    }

    return filtered;
  },

  /**
   * Get statistics for admin dashboard
   */
  getStatistics() {
    const totalRevenue = this.bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const eventStats = this.events.map(event => {
      const eventBookings = this.getBookingsByEvent(event.id);
      const confirmedBookings = eventBookings.filter(b => b.status === 'confirmed');
      const seatsSold = confirmedBookings.reduce((sum, b) => sum + b.seats.length, 0);

      return {
        event: event.name,
        venue: event.venue,
        category: event.category,
        totalCapacity: event.capacity,
        seatsSold: seatsSold,
        seatsBooked: event.bookedSeats,
        occupancyRate: app.utils.calculatePercentage(seatsSold, event.capacity),
        revenue: confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0)
      };
    });

    const categoryRevenue = {};
    this.bookings
      .filter(b => b.status === 'confirmed')
      .forEach(booking => {
        const event = this.getEvent(booking.eventId);
        const category = event?.category || 'Other';
        categoryRevenue[category] = (categoryRevenue[category] || 0) + booking.totalPrice;
      });

    return {
      totalBookings: this.bookings.filter(b => b.status === 'confirmed').length,
      totalRevenue: totalRevenue,
      totalEvents: this.events.length,
      totalVenues: Object.keys(this.venues).length,
      eventStats: eventStats,
      categoryRevenue: categoryRevenue,
      mostPopularEvents: eventStats.sort((a, b) => b.seatsSold - a.seatsSold).slice(0, 5)
    };
  },

  /**
   * Reset all data (for testing)
   */
  resetData() {
    localStorage.clear();
    this.events = [...defaultEvents];
    this.bookings = [];
    this.currentUser = null;
    this.saveEvents();
    this.saveBookings();
  }
};

// Initialize data when script loads
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!app.utils) {
      console.error('utils.js must be loaded before data.js');
    } else {
      app.data.init();
    }
  });
}
