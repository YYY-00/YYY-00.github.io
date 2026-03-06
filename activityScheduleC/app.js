// 活动数据（带时区）
const events = [
    {
        id: 1,
        title: '周杰伦演唱会',
        datetime: '2026-03-15T19:30:00+08:00',
        venue: '大剧院',
        category: 'concert',
        price: 880,
        availableSeats: 50,
        totalSeats: 100,
        occupiedSeats: ['A1', 'A2', 'B5'],
        timezone: 'Asia/Shanghai'
    },
    {
        id: 2,
        title: 'NBA季前赛',
        datetime: '2026-03-20T19:00:00-05:00',
        venue: '体育馆',
        category: 'sports',
        price: 580,
        availableSeats: 80,
        totalSeats: 150,
        occupiedSeats: ['C3', 'C4', 'D8', 'E1'],
        timezone: 'America/New_York'
    },
    {
        id: 3,
        title: 'AI技术前沿讲座',
        datetime: '2026-03-25T14:00:00+09:00',
        venue: '音乐厅',
        category: 'talk',
        price: 200,
        availableSeats: 45,
        totalSeats: 80,
        occupiedSeats: ['F2'],
        timezone: 'Asia/Tokyo'
    },
    {
        id: 4,
        title: '当代艺术展览',
        datetime: '2026-03-28T10:00:00+08:00',
        venue: '展览中心',
        category: 'exhibition',
        price: 120,
        availableSeats: 100,
        totalSeats: 200,
        occupiedSeats: [],
        timezone: 'Asia/Shanghai'
    },
    {
        id: 5,
        title: '摇滚之夜',
        datetime: '2026-04-05T20:00:00+08:00',
        venue: '大剧院',
        category: 'concert',
        price: 680,
        availableSeats: 60,
        totalSeats: 120,
        occupiedSeats: ['G6', 'G7'],
        timezone: 'Asia/Shanghai'
    },
    {
        id: 6,
        title: '网球公开赛',
        datetime: '2026-04-10T15:30:00+01:00',
        venue: '体育馆',
        category: 'sports',
        price: 450,
        availableSeats: 70,
        totalSeats: 100,
        occupiedSeats: ['H3', 'H4', 'I5'],
        timezone: 'Europe/London'
    }
];

// 预订数据存储
let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

// 当前状态
let currentMonth = new Date();
let selectedEvent = null;
let selectedSeats = [];
let currentDate = new Date();

// 初始化应用
function init() {
    renderCalendar();
    renderEvents();
    setupEventListeners();
    updateAdminStats();
}

// 格式化时区时间
function formatDateTimeWithTimezone(datetime, timezone) {
    const date = new Date(datetime);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: userTimezone,
        timeZoneName: 'short'
    };

    const formatter = new Intl.DateTimeFormat('zh-CN', options);
    return formatter.format(date);
}

// 获取时区信息
function getTimezoneInfo(datetime, timezone) {
    const date = new Date(datetime);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const eventTime = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const userTime = new Date(date.toLocaleString('en-US', { timeZone: userTimezone }));

    const diffHours = Math.round((userTime - eventTime) / (1000 * 60 * 60));

    return {
        eventTimezone: timezone,
        userTimezone: userTimezone,
        timeDifference: diffHours
    };
}

// 渲染日历
function renderCalendar() {
    const grid = document.getElementById('calendar-days');
    const monthDisplay = document.getElementById('current-month');

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    monthDisplay.textContent = `${year}年${month + 1}月`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    let html = '';

    // 上月日期
    for (let i = startingDay - 1; i >= 0; i--) {
        html += `<div class="calendar-day other-month">${prevMonthLastDay - i}</div>`;
    }

    // 当月日期
    const today = new Date();
    for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = today.getDate() === day &&
                       today.getMonth() === month &&
                       today.getFullYear() === year;

        const dayEvents = events.filter(event =>
            event.datetime.startsWith(dateStr)
        );

        let eventDots = '';
        if (dayEvents.length > 0) {
            eventDotts = dayEvents.map(e =>
                `<div class="event-dot ${e.category}"></div>`
            ).join('');

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} has-event" data-date="${dateStr}">
                    ${day}
                    <div class="event-dots">
                        ${dayEvents.map(e => `<div class="event-dot ${e.category}"></div>`).join('')}
                    </div>
                </div>
            `;
        } else {
            html += `<div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">${day}</div>`;
        }
    }

    // 下月日期
    const remainingCells = 42 - (startingDay + totalDays);
    for (let day = 1; day <= remainingCells; day++) {
        html += `<div class="calendar-day other-month">${day}</div>`;
    }

    grid.innerHTML = html;
}

// 渲染活动列表
function renderEvents() {
    const list = document.getElementById('events-list');
    const dateStart = document.getElementById('filter-date-start').value;
    const dateEnd = document.getElementById('filter-date-end').value;
    const venue = document.getElementById('filter-venue').value;
    const category = document.getElementById('filter-category').value;

    let filteredEvents = events.filter(event => {
        if (dateStart && event.datetime < dateStart) return false;
        if (dateEnd && event.datetime > dateEnd + 'T23:59:59') return false;
        if (venue && event.venue !== venue) return false;
        if (category && event.category !== category) return false;
        return true;
    });

    if (filteredEvents.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">没有找到符合条件的活动</p>';
        return;
    }

    const categoryNames = {
        concert: '演唱会',
        sports: '体育赛事',
        talk: '演讲',
        exhibition: '展览'
    };

    list.innerHTML = filteredEvents.map(event => {
        const tzInfo = getTimezoneInfo(event.datetime, event.timezone);
        const timeDiffText = tzInfo.timeDifference !== 0 ?
            ` (${tzInfo.timeDifference > 0 ? '+' : ''}${tzInfo.timeDifference}h)` : '';

        return `
            <div class="event-card" onclick="selectEvent(${event.id})">
                <div class="event-card-header">
                    <h3 class="event-card-title">${event.title}</h3>
                    <span class="event-category">${categoryNames[event.category]}</span>
                </div>
                <div class="event-card-body">
                    <div class="event-info-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        ${formatDateTimeWithTimezone(event.datetime, event.timezone)}
                    </div>
                    <div class="event-info-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        ${event.venue}
                    </div>
                    <div class="event-info-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        时区: ${event.timezone}${timeDiffText}
                    </div>
                </div>
                <div class="event-card-footer">
                    <span class="event-price">¥${event.price}</span>
                    <span class="event-availability">剩余 ${event.availableSeats} 个座位</span>
                </div>
            </div>
        `;
    }).join('');
}

// 选择活动
function selectEvent(eventId) {
    selectedEvent = events.find(e => e.id === eventId);
    selectedSeats = [];

    document.getElementById('selected-event-title').textContent = selectedEvent.title;
    document.getElementById('event-datetime').textContent = formatDateTimeWithTimezone(
        selectedEvent.datetime,
        selectedEvent.timezone
    );
    document.getElementById('event-venue').textContent = selectedEvent.venue;

    const categoryNames = {
        concert: '演唱会',
        sports: '体育赛事',
        talk: '演讲',
        exhibition: '展览'
    };
    document.getElementById('event-category').textContent = categoryNames[selectedEvent.category];

    renderSeatingChart();

    // 切换视图
    document.getElementById('events-view').classList.remove('active');
    document.getElementById('seating-view').classList.add('active');
}

// 渲染座位图
function renderSeatingChart() {
    const svg = document.getElementById('seating-chart');
    const rows = 8;
    const seatsPerRow = 10;

    let html = `
        <rect x="180" y="10" width="40" height="20" fill="#333" rx="5"/>
        <text x="200" y="25" text-anchor="middle" fill="white" font-size="12">舞台</text>
    `;

    for (let row = 0; row < rows; row++) {
        const rowLabel = String.fromCharCode(65 + row);

        for (let seat = 1; seat <= seatsPerRow; seat++) {
            const seatId = `${rowLabel}${seat}`;
            const x = seat * 38;
            const y = row * 30 + 50;

            const isOccupied = selectedEvent.occupiedSeats.includes(seatId);
            const seatClass = isOccupied ? 'occupied' : 'available';

            html += `
                <g class="seat ${seatClass}" data-seat="${seatId}" onclick="toggleSeat('${seatId}')">
                    <rect x="${x}" y="${y}" width="28" height="24" rx="4"
                          fill="${isOccupied ? '#6b7280' : '#10b981'}"
                          stroke="${isOccupied ? '#6b7280' : '#10b981'}"
                          stroke-width="2" class="seat-rect"/>
                    <text x="${x + 14}" y="${y + 17}" text-anchor="middle"
                          fill="white" font-size="11" font-weight="600">${seatId}</text>
                </g>
            `;
        }
    }

    svg.innerHTML = html;
    updateSeatingSummary();
}

// 切换座位选择
function toggleSeat(seatId) {
    if (selectedEvent.occupiedSeats.includes(seatId)) {
        return; // 已占座位不能选择
    }

    const seatGroup = document.querySelector(`[data-seat="${seatId}"]`);
    const seatRect = seatGroup.querySelector('.seat-rect');

    if (selectedSeats.includes(seatId)) {
        selectedSeats = selectedSeats.filter(s => s !== seatId);
        seatGroup.classList.remove('selected');
        seatGroup.classList.add('available');
        seatRect.setAttribute('fill', '#10b981');
        seatRect.setAttribute('stroke', '#10b981');
    } else {
        selectedSeats.push(seatId);
        seatGroup.classList.remove('available');
        seatGroup.classList.add('selected');
        seatRect.setAttribute('fill', '#4f46e5');
        seatRect.setAttribute('stroke', '#4f46e5');
    }

    updateSeatingSummary();
}

// 更新座位摘要
function updateSeatingSummary() {
    document.getElementById('selected-count').textContent = selectedSeats.length;
    document.getElementById('total-price').textContent = selectedSeats.length * selectedEvent.price;

    const bookBtn = document.getElementById('book-seats');
    bookBtn.disabled = selectedSeats.length === 0;

    // 更新已选座位列表
    const listContainer = document.getElementById('selected-seats-list');
    if (selectedSeats.length > 0) {
        listContainer.style.display = 'block';
        listContainer.innerHTML = `
            <h4>已选座位</h4>
            <div class="selected-seats-list">
                ${selectedSeats.map(seat => `
                    <span class="seat-tag">${seat}</span>
                `).join('')}
            </div>
        `;
    } else {
        listContainer.style.display = 'none';
    }
}

// 显示确认模态框
function showConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    const seatsList = document.getElementById('confirm-seats');

    seatsList.innerHTML = selectedSeats.map(seat => `
        <li>座位 ${seat} - ¥${selectedEvent.price}</li>
    `).join('');

    document.getElementById('confirm-total').textContent = selectedSeats.length * selectedEvent.price;

    modal.classList.add('active');
}

// 确认预订
function confirmBooking() {
    const bookingId = 'BK' + Date.now().toString(36).toUpperCase();

    // 创建预订记录
    const booking = {
        id: bookingId,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        seats: [...selectedSeats],
        total: selectedSeats.length * selectedEvent.price,
        datetime: new Date().toISOString(),
        eventDatetime: selectedEvent.datetime,
        venue: selectedEvent.venue
    };

    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    // 更新活动已占座位
    selectedEvent.occupiedSeats.push(...selectedSeats);
    selectedEvent.availableSeats -= selectedSeats.length;

    // 生成门票
    showTicket(booking);

    // 更新管理面板
    updateAdminStats();
}

// 显示门票
function showTicket(booking) {
    const modal = document.getElementById('ticket-modal');

    document.getElementById('ticket-booking-id').textContent = booking.id;
    document.getElementById('ticket-event-title').textContent = booking.eventTitle;
    document.getElementById('ticket-datetime').textContent = formatDateTimeWithTimezone(
        booking.eventDatetime,
        selectedEvent.timezone
    );
    document.getElementById('ticket-venue').textContent = booking.venue;
    document.getElementById('ticket-seats').textContent = booking.seats.join(', ');

    // 生成二维码
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';

    const qrData = JSON.stringify({
        bookingId: booking.id,
        event: booking.eventTitle,
        seats: booking.seats,
        total: booking.total
    });

    QRCode.toCanvas(qrContainer, qrData, {
        width: 200,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    });

    modal.classList.add('active');
}

// 发送提醒邮件
function sendReminderEmail() {
    const lastBooking = bookings[bookings.length - 1];

    const subject = encodeURIComponent(`活动门票提醒 - ${lastBooking.eventTitle}`);
    const body = encodeURIComponent(
        `您好！\n\n` +
        `您的活动门票信息如下：\n\n` +
        `预订号：${lastBooking.id}\n` +
        `活动：${lastBooking.eventTitle}\n` +
        `座位：${lastBooking.seats.join(', ')}\n` +
        `金额：¥${lastBooking.total}\n` +
        `时间：${formatDateTimeWithTimezone(lastBooking.eventDatetime, selectedEvent.timezone)}\n\n` +
        `请提前30分钟到场。\n` +
        `祝您观演愉快！`
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// 更新管理面板统计
function updateAdminStats() {
    document.getElementById('total-events').textContent = events.length;
    document.getElementById('total-bookings').textContent = bookings.length;

    const totalRevenue = bookings.reduce((sum, b) => sum + b.total, 0);
    document.getElementById('total-revenue').textContent = `¥${totalRevenue.toLocaleString()}`;

    // 计算上座率
    const totalSeats = events.reduce((sum, e) => sum + e.totalSeats, 0);
    const occupiedSeats = events.reduce((sum, e) => sum + e.occupiedSeats.length, 0);
    const occupancyRate = totalSeats > 0 ? ((occupiedSeats / totalSeats) * 100).toFixed(1) : 0;
    document.getElementById('occupancy-rate').textContent = `${occupancyRate}%`;

    // 更新预订表格
    const tbody = document.getElementById('bookings-table');
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">暂无预订记录</td></tr>';
    } else {
        tbody.innerHTML = bookings.slice().reverse().map(booking => `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.eventTitle}</td>
                <td>${booking.seats.join(', ')}</td>
                <td>¥${booking.total}</td>
                <td>${new Date(booking.datetime).toLocaleString('zh-CN')}</td>
            </tr>
        `).join('');
    }

    // 绘制图表（使用简单的HTML/CSS柱状图）
    drawCategoryChart();
    drawVenueChart();
}

// 绘制类别分布图
function drawCategoryChart() {
    const canvas = document.getElementById('category-chart');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = 250;

    const categoryData = {};
    bookings.forEach(b => {
        const category = events.find(e => e.id === b.eventId)?.category || 'other';
        categoryData[category] = (categoryData[category] || 0) + 1;
    });

    const categoryNames = {
        concert: '演唱会',
        sports: '体育赛事',
        talk: '演讲',
        exhibition: '展览'
    };

    const categories = Object.keys(categoryData);
    const values = Object.values(categoryData);
    const maxValue = Math.max(...values, 1);

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];
    const barWidth = 60;
    const barSpacing = (canvas.width - categories.length * barWidth) / (categories.length + 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    categories.forEach((cat, i) => {
        const barHeight = (categoryData[cat] / maxValue) * 180;
        const x = barSpacing + i * (barWidth + barSpacing);
        const y = canvas.height - barHeight - 40;

        // 绘制柱子
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [5, 5, 0, 0]);
        ctx.fill();

        // 绘制标签
        ctx.fillStyle = '#374151';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(categoryNames[cat] || cat, x + barWidth / 2, canvas.height - 15);

        // 绘制数值
        ctx.fillText(categoryData[cat], x + barWidth / 2, y - 10);
    });
}

// 绘制场地分布图
function drawVenueChart() {
    const canvas = document.getElementById('venue-chart');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = 250;

    const venueData = {};
    bookings.forEach(b => {
        const venue = b.venue;
        venueData[venue] = (venueData[venue] || 0) + 1;
    });

    const venues = Object.keys(venueData);
    const values = Object.values(venueData);
    const maxValue = Math.max(...values, 1);

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];
    const barWidth = 60;
    const barSpacing = (canvas.width - venues.length * barWidth) / (venues.length + 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    venues.forEach((venue, i) => {
        const barHeight = (venueData[venue] / maxValue) * 180;
        const x = barSpacing + i * (barWidth + barSpacing);
        const y = canvas.height - barHeight - 40;

        // 绘制柱子
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [5, 5, 0, 0]);
        ctx.fill();

        // 绘制标签
        ctx.fillStyle = '#374151';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(venue, x + barWidth / 2, canvas.height - 15);

        // 绘制数值
        ctx.fillText(venueData[venue], x + barWidth / 2, y - 10);
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 导航
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(`${btn.dataset.view}-view`).classList.add('active');

            if (btn.dataset.view === 'admin') {
                updateAdminStats();
            }
        });
    });

    // 日历导航
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
    });

    // 筛选器
    document.getElementById('filter-date-start').addEventListener('change', renderEvents);
    document.getElementById('filter-date-end').addEventListener('change', renderEvents);
    document.getElementById('filter-venue').addEventListener('change', renderEvents);
    document.getElementById('filter-category').addEventListener('change', renderEvents);

    document.getElementById('reset-filters').addEventListener('click', () => {
        document.getElementById('filter-date-start').value = '';
        document.getElementById('filter-date-end').value = '';
        document.getElementById('filter-venue').value = '';
        document.getElementById('filter-category').value = '';
        renderEvents();
    });

    // 座位选择
    document.getElementById('back-to-events').addEventListener('click', () => {
        document.getElementById('seating-view').classList.remove('active');
        document.getElementById('events-view').classList.add('active');
        selectedSeats = [];
    });

    document.getElementById('book-seats').addEventListener('click', showConfirmModal);

    // 确认预订
    document.getElementById('cancel-booking').addEventListener('click', () => {
        document.getElementById('confirm-modal').classList.remove('active');
    });

    document.getElementById('confirm-booking').addEventListener('click', () => {
        document.getElementById('confirm-modal').classList.remove('active');
        confirmBooking();
    });

    // 门票
    document.getElementById('close-ticket').addEventListener('click', () => {
        document.getElementById('ticket-modal').classList.remove('active');
        selectedSeats = [];
        renderSeatingChart();
        renderEvents();
    });

    document.getElementById('send-reminder').addEventListener('click', sendReminderEmail);

    // 点击模态框背景关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', init);
