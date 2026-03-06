/**
 * QR Code Generator Module
 * Handles booking confirmation and QR code generation
 */

// Show booking confirmation with QR code
export function showBookingConfirmation(booking) {
    const modal = document.getElementById('booking-modal');
    const confirmationContainer = document.getElementById('booking-confirmation');

    if (!modal || !confirmationContainer) return;

    // Format date and time
    const eventDate = new Date(booking.eventDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const [hours, minutes] = booking.eventTime.split(':');
    const eventTime = new Date();
    eventTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const formattedTime = eventTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });

    // Create ticket HTML
    confirmationContainer.innerHTML = `
        <div class="event-details">
            <div class="ticket">
                <div class="ticket-header">
                    <div class="ticket-title">🎉 Booking Confirmed!</div>
                    <div class="ticket-subtitle">Your tickets have been reserved</div>
                </div>

                <div id="qrcode"></div>

                <div class="ticket-details">
                    <div class="ticket-row">
                        <span class="ticket-label">Booking ID:</span>
                        <span class="ticket-value">${booking.id}</span>
                    </div>
                    <div class="ticket-row">
                        <span class="ticket-label">Event:</span>
                        <span class="ticket-value">${booking.eventName}</span>
                    </div>
                    <div class="ticket-row">
                        <span class="ticket-label">Date:</span>
                        <span class="ticket-value">${formattedDate}</span>
                    </div>
                    <div class="ticket-row">
                        <span class="ticket-label">Time:</span>
                        <span class="ticket-value">${formattedTime}</span>
                    </div>
                    <div class="ticket-row">
                        <span class="ticket-label">Venue:</span>
                        <span class="ticket-value">${booking.venueName}</span>
                    </div>
                    <div class="ticket-row">
                        <span class="ticket-label">Seats:</span>
                        <span class="ticket-value">${booking.seats.map(s => s.label).join(', ')}</span>
                    </div>
                    <div class="ticket-row">
                        <span class="ticket-label">Total Paid:</span>
                        <span class="ticket-value">$${booking.totalPrice.toFixed(2)}</span>
                    </div>
                </div>

                <div class="ticket-actions">
                    <a href="mailto:?subject=Booking Confirmation: ${encodeURIComponent(booking.eventName)} - ${formattedDate}&body=
Event: ${booking.eventName}%0D%0A
Booking ID: ${booking.id}%0D%0A
Date: ${formattedDate}%0D%0A
Time: ${formattedTime}%0D%0A
Venue: ${booking.venueName}%0D%0A
Seats: ${booking.seats.map(s => s.label).join(', ')}%0D%0A
Total: $${booking.totalPrice.toFixed(2)}%0D%0A
%0D%0A
Please present this confirmation (and your QR code) at the venue.%0D%0A
%0D%0A
Thank you for your booking!
                    " class="btn btn-primary">
                        📧 Email Ticket
                    </a>
                    <button class="btn btn-secondary" id="close-confirmation">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');

    // Generate QR code
    generateQRCode(booking);

    // Set up close button handler
    document.getElementById('close-confirmation').addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

// Generate QR code
export function generateQRCode(booking) {
    const qrContainer = document.getElementById('qrcode');
    if (!qrContainer) return;

    // Clear existing QR code
    qrContainer.innerHTML = '';

    // Create QR code data
    const qrData = JSON.stringify({
        bookingId: booking.id,
        eventId: booking.eventId,
        eventName: booking.eventName,
        eventDate: booking.eventDate,
        eventTime: booking.eventTime,
        venueName: booking.venueName,
        seats: booking.seats.map(s => ({ id: s.id, label: s.label })),
        totalPrice: booking.totalPrice,
        status: booking.status
    });

    // Generate QR code using qrcode.js library
    try {
        new QRCode(qrContainer, {
            text: qrData,
            width: 180,
            height: 180,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        console.error('Error generating QR code:', error);

        // Fallback: show booking ID as text
        qrContainer.innerHTML = `
            <div style="
                width: 180px;
                height: 180px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                border-radius: 8px;
                padding: 1rem;
                text-align: center;
                font-size: 0.75rem;
                color: #000;
            ">
                <div>
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📱</div>
                    <div style="font-weight: bold; margin-bottom: 0.25rem;">Booking ID</div>
                    <div style="font-family: monospace; font-size: 0.625rem;">${booking.id}</div>
                </div>
            </div>
        `;
    }
}

// Generate shareable booking link
export function generateBookingLink(booking) {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
        booking: booking.id
    });
    return `${baseUrl}?${params.toString()}`;
}

// Download ticket as image
export function downloadTicket(booking) {
    // In a production app, this would use html2canvas or similar
    // For this prototype, we'll show an alert
    alert('Ticket download feature coming soon! Please use the Email Ticket button to save your booking information.');
}

// Print ticket
export function printTicket(booking) {
    window.print();
}

// Verify booking (for QR code scanning at venue)
export function verifyBooking(bookingId) {
    // In a production app, this would make an API call
    // For this prototype, we return a mock response
    return {
        valid: true,
        status: 'confirmed',
        message: 'Booking verified successfully'
    };
}

// Export functions
export { generateQRCode as default };
