/**
 * Seat Map Module
 * Handles interactive SVG seat selection
 */

import { getVenueById } from './data.js';

let selectedSeats = [];
let currentVenue = null;
let currentEvent = null;

// Render seat map for an event
export function renderSeatMap(event, venue) {
    currentEvent = event;
    currentVenue = venue;
    selectedSeats = [];

    const seatMapContainer = document.getElementById('seat-map');
    if (!seatMapContainer) return;

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'seat-map-svg');
    svg.setAttribute('viewBox', '0 0 800 600');
    svg.setAttribute('width', '100%');

    const seatLayout = venue.seatLayout;

    // Add stage indicator
    const stage = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    stage.setAttribute('x', '150');
    stage.setAttribute('y', '20');
    stage.setAttribute('width', '500');
    stage.setAttribute('height', '30');
    stage.setAttribute('fill', '#f59e0b');
    stage.setAttribute('rx', '5');

    const stageText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    stageText.setAttribute('x', '400');
    stageText.setAttribute('y', '40');
    stageText.setAttribute('class', 'seat-section-label');
    stageText.textContent = 'STAGE';

    svg.appendChild(stage);
    svg.appendChild(stageText);

    let currentY = 70;

    // Render seats by section
    Object.entries(seatLayout).forEach(([sectionKey, sectionData]) => {
        if (sectionData.rows === 0 && sectionData.seatsPerRow === 0) {
            // GA section - just show text
            const gaLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            gaLabel.setAttribute('x', '400');
            gaLabel.setAttribute('y', currentY);
            gaLabel.setAttribute('class', 'seat-section-label');
            gaLabel.textContent = `${sectionData.label} - General Admission`;

            svg.appendChild(gaLabel);
            currentY += 40;

            // Add some GA seat indicators
            for (let i = 0; i < 10; i++) {
                const gaCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                const x = 200 + (i % 5) * 100;
                const y = currentY + Math.floor(i / 5) * 30;

                gaCircle.setAttribute('cx', x.toString());
                gaCircle.setAttribute('cy', y.toString());
                gaCircle.setAttribute('r', '15');
                gaCircle.setAttribute('class', 'seat');

                const seatId = `ga-${i + 1}`;
                const isBooked = event.bookedSeats.includes(seatId);

                if (isBooked) {
                    gaCircle.classList.add('sold');
                } else {
                    gaCircle.classList.add('available');
                    gaCircle.addEventListener('click', () => handleSeatClick(gaCircle, seatId, i + 1, sectionData.label, sectionData.price));
                }

                svg.appendChild(gaCircle);
            }
            currentY += 80;
        } else {
            // Seated section
            // Add section label
            const sectionLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            sectionLabel.setAttribute('x', '50');
            sectionLabel.setAttribute('y', currentY + 15);
            sectionLabel.setAttribute('class', 'seat-section-label');
            sectionLabel.textContent = `${sectionData.label} - $${sectionData.price}`;

            svg.appendChild(sectionLabel);

            // Render seats in this section
            for (let row = 0; row < sectionData.rows; row++) {
                const actualRow = sectionData.startY + row;
                const rowY = currentY + row * 35;

                // Center the row
                const rowWidth = sectionData.seatsPerRow * 40;
                const startX = (800 - rowWidth) / 2;

                for (let seat = 0; seat < sectionData.seatsPerRow; seat++) {
                    const seatNum = seat + 1;
                    const seatId = `${sectionKey}-${actualRow}-${seatNum}`;
                    const seatX = startX + seat * 40;

                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', seatX.toString());
                    circle.setAttribute('cy', rowY.toString());
                    circle.setAttribute('r', '12');
                    circle.setAttribute('class', 'seat');
                    circle.setAttribute('data-seat-id', seatId);

                    // Check if seat is booked
                    const isBooked = event.bookedSeats.includes(seatId);

                    if (isBooked) {
                        circle.classList.add('sold');
                    } else {
                        circle.classList.add('available');
                        circle.addEventListener('click', () =>
                            handleSeatClick(circle, seatId, `${String.fromCharCode(65 + actualRow)}${seatNum}`, sectionData.label, sectionData.price)
                        );
                    }

                    svg.appendChild(circle);

                    // Add seat number for outer seats
                    if (seat === 0 || seat === sectionData.seatsPerRow - 1) {
                        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        text.setAttribute('x', seatX.toString());
                        text.setAttribute('y', rowY + 4);
                        text.setAttribute('class', 'seat-label');
                        text.textContent = `${String.fromCharCode(65 + actualRow)}${seatNum}`;
                        svg.appendChild(text);
                    }
                }
            }

            currentY += sectionData.rows * 35 + 20;
        }
    });

    seatMapContainer.innerHTML = '';
    seatMapContainer.appendChild(svg);

    updateSeatSummary();
}

// Handle seat click
function handleSeatClick(seatElement, seatId, seatLabel, section, price) {
    const isSold = seatElement.classList.contains('sold');

    if (isSold) {
        return; // Don't allow selection of sold seats
    }

    if (selectedSeats.find(s => s.id === seatId)) {
        // Deselect seat
        deselectSeat(seatId);
        seatElement.classList.remove('selected');
        seatElement.classList.add('available');
    } else {
        // Select seat
        selectSeatInternal(seatId, seatLabel, section, price);
        seatElement.classList.remove('available');
        seatElement.classList.add('selected');
    }

    updateSeatSummary();
}

// Select a seat
function selectSeatInternal(seatId, label, section, price) {
    selectedSeats.push({
        id: seatId,
        label: label,
        section: section,
        price: price
    });
}

// Deselect a seat
export function deselectSeat(seatId) {
    selectedSeats = selectedSeats.filter(s => s.id !== seatId);
}

// Get currently selected seats
export function getSelectedSeats() {
    return [...selectedSeats];
}

// Clear all selected seats
export function clearSelectedSeats() {
    selectedSeats = [];

    // Update visual seats
    document.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
        seat.classList.add('available');
    });
}

// Update seat summary in the modal
function updateSeatSummary() {
    const selectedCountElement = document.getElementById('selected-count');
    const selectedSeatsListElement = document.getElementById('selected-seats-list');
    const totalPriceElement = document.getElementById('total-price');
    const confirmBtn = document.getElementById('confirm-booking');

    if (!selectedCountElement) return;

    // Update count
    selectedCountElement.textContent = `${selectedSeats.length} seat${selectedSeats.length !== 1 ? 's' : ''}`;

    // Update seats list
    if (selectedSeatsListElement) {
        selectedSeatsListElement.innerHTML = '';

        if (selectedSeats.length === 0) {
            selectedSeatsListElement.innerHTML = '<p style="color: var(--color-gray); font-size: 0.875rem;">No seats selected</p>';
        } else {
            selectedSeats.forEach((seat, index) => {
                const seatTag = document.createElement('span');
                seatTag.className = 'seat-tag';
                seatTag.innerHTML = `
                    ${seat.label} ($${seat.price})
                    <button onclick="window.appDeselectSeat('${seat.id}')">&times;</button>
                `;
                selectedSeatsListElement.appendChild(seatTag);
            });
        }
    }

    // Update total price
    const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    if (totalPriceElement) {
        totalPriceElement.textContent = `$${total.toFixed(2)}`;
    }

    // Enable/disable confirm button
    if (confirmBtn) {
        confirmBtn.disabled = selectedSeats.length === 0;
    }
}

// Global function for seat deselection
window.appDeselectSeat = function(seatId) {
    deselectSeat(seatId);

    // Update visual state
    const seatElement = document.querySelector(`[data-seat-id="${seatId}"]`);
    if (seatElement) {
        seatElement.classList.remove('selected');
        seatElement.classList.add('available');
    }

    updateSeatSummary();
};

// Export functions
export { selectSeat, selectedSeats };
