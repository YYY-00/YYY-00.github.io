# 🎫 Activity Booking System

A complete, interactive activity booking system prototype with calendar view, seat selection, QR code generation, and admin dashboard.

## Features

### For Users
- **Calendar View** - Browse events by month with intuitive calendar interface
- **Event Filtering** - Filter events by date range, venue, and category
- **Interactive Seat Maps** - SVG-based seat selection with visual feedback
- **Instant Booking** - Select seats and confirm bookings in real-time
- **QR Code Tickets** - Each booking generates a unique QR code
- **Email Integration** - Email tickets via mailto: links
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### For Administrators
- **Dashboard Analytics** - View booking statistics and revenue
- **Revenue Tracking** - See revenue by event and venue
- **Occupancy Analytics** - Track venue occupancy rates
- **Category Insights** - View event distribution by category

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Styles**: CSS Grid/Flexbox with CSS custom properties
- **QR Codes**: qrcode.js via CDN
- **Date/Time**: Native Intl.DateTimeFormat with timezone support
- **SVG**: Dynamic seat map generation

## Project Structure

```
activity-booking/
├── index.html              # Main application entry point
├── css/
│   ├── styles.css          # Main styles and component styles
│   └── calendar.css        # Calendar-specific styles
├── js/
│   ├── app.js              # Main app controller
│   ├── data.js             # Mock data for events/venues
│   ├── calendar.js         # Calendar view component
│   ├── seatmap.js          # Interactive SVG seat selection
│   ├── qr-generator.js     # QR code generation
│   ├── filters.js          # Filtering logic
│   └── admin-dashboard.js  # Admin statistics dashboard
├── assets/
│   └── seat-template.svg   # SVG seat template (reference)
└── README.md               # This file
```

## Getting Started

### Prerequisites
- Modern web browser with ES6 module support
- Local web server (for modules to work properly)

### Installation

1. Clone or download this project

2. Serve the project using a local web server:

**Using Python:**
```bash
# Python 3.x
python -m http.server 8000

# Python 2.x
python -m SimpleHTTPServer 8000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

**Using VS Code Live Server extension:**
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

3. Open your browser and navigate to:
   - `http://localhost:8000`

### Quick Start Guide

1. **View the Calendar**
   - Navigate between months using the Previous/Next buttons
   - Click on events to see details

2. **Browse Events**
   - Click "Events" in the navigation to see the full event list
   - Use filters to narrow down by date, venue, or category

3. **Book Tickets**
   - Click on an event to view details
   - Select available seats from the interactive seat map
   - Click "Confirm Booking" to complete your booking
   - Receive a QR code ticket via email link

4. **View Dashboard**
   - Click "Admin Dashboard" to view statistics
   - See revenue, bookings, and occupancy analytics

## Usage Guide

### Calendar Navigation
- Use ← Previous and Next → buttons to navigate between months
- Events are shown as colored bars on calendar days
- Click on events to view details and book tickets
- Today's date is highlighted in blue

### Filtering Events
- **Date Range**: Select start and end dates
- **Venue**: Choose from the dropdown menu
- **Category**: Select multiple categories (concerts, sports, theater, etc.)
- Click "Reset Filters" to clear all filters

### Seat Selection
- Green seats = Available
- Blue seats = Selected
- Red seats = Already sold
- Click seats to select/deselect
- See real-time price updates

### Booking Confirmation
- Each booking generates a unique QR code
- Scan the QR code at the venue for entry
- Email tickets to yourself for reference
- Your Booking ID is displayed on the ticket

## Data Model

### Event Structure
```javascript
{
  id: 'evt-001',
  name: 'Symphony Orchestra Evening',
  date: '2026-03-05',
  time: '19:30:00',
  timezone: 'America/New_York',
  venueId: 'grand-hall',
  category: 'concert',
  description: 'Event description...',
  basePrice: 75,
  bookedSeats: ['seat-id-1', 'seat-id-2'],
  capacity: 500
}
```

### Venue Structure
```javascript
{
  id: 'grand-hall',
  name: 'Grand Hall',
  address: '123 Main Street',
  capacity: 500,
  seatLayout: {
    vip: { rows: 2, seatsPerRow: 10, price: 150 },
    standard: { rows: 5, seatsPerRow: 14, price: 75 }
  },
  sections: ['VIP', 'Standard']
}
```

## Customization

### Adding New Events
Edit `js/data.js` and add to the `events` array:

```javascript
{
  id: 'evt-021',
  name: 'Your Event Name',
  date: '2026-04-15',
  time: '20:00:00',
  timezone: 'America/New_York',
  venueId: 'grand-hall',
  category: 'concert',
  description: 'Event description',
  basePrice: 50,
  bookedSeats: [],
  capacity: 500
}
```

### Adding New Venues
Edit `js/data.js` and add to the `venues` array with your seat layout configuration.

### Changing Colors
Update CSS custom properties in `css/styles.css`:

```css
:root {
  --color-primary: #6366f1;      /* Primary color */
  --seat-available: #10b981;     /* Available seat color */
  --seat-selected: #6366f1;      /* Selected seat color */
  --seat-sold: #ef4444;          /* Sold seat color */
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Features Implementation Details

### Timezone Handling
- Events are stored in UTC
- Displayed in user's local timezone
- Uses `Intl.DateTimeFormat` for formatting

### QR Code Generation
- Uses qrcode.js library
- Encodes booking details in JSON
- 200x200px size for tickets
- High error correction level

### Seat Map Architecture
- Dynamic SVG generation
- Section-based pricing
- Visual state management (available/selected/sold)
- Responsive scaling

## Development

### Module Architecture
The application uses ES6 modules for clean separation of concerns:

- `app.js` - Main controller and state management
- `data.js` - Mock data and helper functions
- `calendar.js` - Calendar rendering and navigation
- `filters.js` - Event filtering logic
- `seatmap.js` - SVG seat map generation
- `qr-generator.js` - QR code and ticket generation
- `admin-dashboard.js` - Statistics and analytics

### State Management
Simple reactive state using vanilla JavaScript:
- Global state object in `app.js`
- Event-driven updates between modules
- Render functions called on state changes

## Known Limitations

This is a prototype/demo application:
- Data is stored in-memory (resets on page refresh)
- No backend/persistence layer
- Email uses mailto: links (opens user's email client)
- No authentication system
- No payment processing

## Future Enhancements

Possible improvements for production:
- Backend API with database
- User authentication
- Payment gateway integration
- Email service integration
- Real-time seat availability
- Advanced analytics dashboard
- Mobile app version
- Print-at-home tickets

## License

This project is open source and available for educational purposes.

## Contributing

Feel free to submit issues and enhancement requests!

---

**Built with ❤️ using vanilla JavaScript**
