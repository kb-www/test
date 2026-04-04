// --- DATA CONFIGURATION ---
// This is the only section you need to edit for future updates.

// Standard weekly opening hours (0 = Sunday)
const hoursData = {
    0: null,              // Sunday: Closed
    1: null,   // Monday: 10 AM - 6 PM
    2: { o: 10, c: 18 },   // Tuesday: 10 AM - 6 PM
    3: { o: 09, c: 18 },   // Wednesday: 09 AM - 7 PM
    4: { o: 09, c: 18 },   // Thursday: 9 AM - 6 PM
    5: { o: 9, c: 18 },    // Friday: 9 AM - 6 PM
    6: { o: 9, c: 16 }   // Saturday: 9 AM - 4 PM
};

// One-off overrides for specific dates (e.g., special hours, single-day closures)
const overrides = {

"2025-11-24": { hours: null, reason: "" },    
"2025-12-25": { hours: null, reason: "Christmas Day" },
"2025-12-26": { hours: null, reason: "St. Stephen's Day" },
"2026-01-01": { hours: null, reason: "New Years Day" },
"2025-12-22": { hours: { o: 09, c: 18 }, reason: "" },
"2025-12-23": { hours: { o: 09, c: 18 }, reason: "" },
    "2025-12-24": { hours: { o: 09, c: 14 }, reason: "Christmas Eve" },
};

// Temporary closures for a date range (e.g., holidays)
const temporaryClosures = [
    { start: "2025-12-27", end: "2025-12-29", reason: "Christmas Holidays" }
];

// --- HELPER & CORE FUNCTIONS (No need to edit below this line) ---

function formatTime(hour) {
    if (hour === null || typeof hour === 'undefined') return '';
    const suffix = hour >= 12 ? " PM" : " AM";
    let h = Math.floor(hour) % 12;
    if (h === 0) h = 12;
    const minutes = (hour % 1) ? ":30" : "";
    return `${h}${minutes}${suffix}`;
}

function getLocalDateKey(date) {
    // Always return YYYY-MM-DD in local time
    return date.toLocaleDateString("en-CA");
}

function getHoursForDate(date) {
    const dateKey = getLocalDateKey(date);

    const closureRange = temporaryClosures.find(r => {
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        const startDate = new Date(r.start + 'T00:00:00');
        const endDate = new Date(r.end + 'T00:00:00');
        return checkDate >= startDate && checkDate <= endDate;
    });
    if (closureRange) return { hours: null, reason: closureRange.reason };
    if (overrides.hasOwnProperty(dateKey)) return overrides[dateKey];
    return { hours: hoursData[date.getDay()], reason: null };
}

function generateNotices(startDate, daysToCheck = 30) {
    let upcomingEvents = [];
    for (let i = 0; i < daysToCheck; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dayData = getHoursForDate(date);

        if (dayData.reason) {
            upcomingEvents.push({ date, reason: dayData.reason, hours: dayData.hours });
        }
    }

    if (upcomingEvents.length === 0) return [];

    const groupedEvents = [];
    let currentGroup = [];
    for (const event of upcomingEvents) {
        if (event.hours) {
            if (currentGroup.length > 0) groupedEvents.push(currentGroup);
            groupedEvents.push([event]);
            currentGroup = [];
            continue;
        }

        if (currentGroup.length === 0) {
            currentGroup.push(event);
            continue;
        }
        const lastEventInGroup = currentGroup[currentGroup.length - 1];
        const nextDay = new Date(lastEventInGroup.date);
        nextDay.setDate(lastEventInGroup.date.getDate() + 1);

        if (!event.hours && event.date.toDateString() === nextDay.toDateString() && event.reason === lastEventInGroup.reason) {
            currentGroup.push(event);
        } else {
            groupedEvents.push(currentGroup);
            currentGroup = [event];
        }
    }
    if (currentGroup.length > 0) groupedEvents.push(currentGroup);

    return groupedEvents.map(group => {
        const firstEvent = group[0];
        const reasonText = firstEvent.reason ? ` (${firstEvent.reason})` : '';
        const formatDate = (d) => `${d.toLocaleDateString('en-IE', { weekday: 'short' })}, ${d.getDate()} ${d.toLocaleDateString('en-IE', { month: 'short' })}`;

        if (firstEvent.hours) {
            return `Special Hours ${formatDate(firstEvent.date)}: ${formatTime(firstEvent.hours.o)} – ${formatTime(firstEvent.hours.c)}${reasonText}`;
        }
        
        if (group.length === 1) {
            return `Closed ${formatDate(firstEvent.date)}${reasonText}`;
        } else {
            return `Closed ${formatDate(firstEvent.date)} – ${formatDate(group[group.length - 1].date)}${reasonText}`;
        }
    });
}

function setupOpeningHours(config) {
    const { listEl, statusEl, noticesEl, theme } = config;
    if (!listEl || !statusEl) return;

    const today = new Date();

    listEl.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayData = getHoursForDate(date);

        let dayString;
        const dateString = date.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' });

        if (i === 0) dayString = `Today, ${dateString}`;
        else if (i === 1) dayString = `Tomorrow, ${dateString}`;
        else dayString = `${date.toLocaleDateString('en-IE', { weekday: 'short' })}, ${dateString}`;

        const li = document.createElement('li');
        li.className = `flex justify-between items-center ${i === 0 ? `font-bold ${theme.todayColor}` : ''}`;

        if (dayData.hours) {
            li.innerHTML = `<span>${dayString}:</span> <span class="tabular-nums">${formatTime(dayData.hours.o)} – ${formatTime(dayData.hours.c)}</span>`;
        } else {
            li.innerHTML = `<span>${dayString}:</span> <span>CLOSED</span>`;
        }
        listEl.appendChild(li);
    }

    if (noticesEl) {
        const notices = generateNotices(today);
        noticesEl.innerHTML = notices.length > 0 ? notices.map(notice => `<div>⚠️ ${notice}</div>`).join('') : '';
    }

    const todayData = getHoursForDate(today);
    let isOpen = false;
    let openTime = null;
    let closeTime = null;

    if (todayData.hours) {
        openTime = new Date(today); openTime.setHours(Math.floor(todayData.hours.o), (todayData.hours.o % 1) ? 30 : 0, 0, 0);
        closeTime = new Date(today); closeTime.setHours(Math.floor(todayData.hours.c), (todayData.hours.c % 1) ? 30 : 0, 0, 0);
        isOpen = today >= openTime && today < closeTime;
    }

    let statusText = '';
    let statusColorClass = '';

    if (isOpen) {
        // Closing soon check (within 30 mins of close)
        const minutesToClose = (closeTime - today) / 60000;
        if (minutesToClose <= 30) {
            statusText = `Closing soon at ${formatTime(todayData.hours.c)}`;
            statusColorClass = theme.closedColor;
        } else {
            statusText = `Open Now (Closes at ${formatTime(todayData.hours.c)})`;
            statusColorClass = theme.openColor;
        }
    } else {
        // Special case: before opening time today
        if (todayData.hours && today < openTime) {
            const minutesToOpen = (openTime - today) / 60000;
            if (minutesToOpen <= 30) {
                statusText = `Opening soon at ${formatTime(todayData.hours.o)}`;
                statusColorClass = theme.openColor;
            } else {
                statusText = `Currently closed. We open today at ${formatTime(todayData.hours.o)}.`;
                statusColorClass = theme.closedColor;
            }
        } else {
            const findNextOpenTime = (startDate) => {
                for (let i = 1; i <= 14; i++) {
                    const nextDate = new Date(startDate);
                    nextDate.setDate(startDate.getDate() + i);
                    const nextData = getHoursForDate(nextDate);
                    if (nextData.hours) {
                        const label = (i === 1) ? "tomorrow" : nextDate.toLocaleDateString('en-IE', { weekday: 'long' });
                        return `${label} at ${formatTime(nextData.hours.o)}`;
                    }
                }
                return "in the future";
            };
            const reasonText = todayData.reason ? `Closed for ${todayData.reason}.` : "Currently closed.";
            statusText = `${reasonText} We open ${findNextOpenTime(today)}.`;
            statusColorClass = theme.closedColor;
        }
    }

    statusEl.textContent = statusText;
    statusEl.classList.remove(theme.openColor, theme.closedColor);
    statusEl.classList.add(statusColorClass);
    statusEl.classList.add("block", "w-full");
}

// --- INITIALIZATION FUNCTIONS ---

function initializeModalDisplay() {
    const modalConfig = {
        listEl: document.getElementById('opening-hours-modal'),
        statusEl: document.getElementById('open-status-modal'),
        noticesEl: document.getElementById('hours-notices-modal'),
        theme: { todayColor: 'text-amber-400', openColor: 'text-green-500', closedColor: 'text-red-500' }
    };
    setupOpeningHours(modalConfig);
}

function initializeMainDisplay() {
     const mainConfig = {
        listEl: document.getElementById('opening-hours'),
        statusEl: document.getElementById('open-status'),
        noticesEl: document.getElementById('hours-notices'),
        theme: { todayColor: 'text-amber-400', openColor: 'text-green-500', closedColor: 'text-red-500' }
    };
    setupOpeningHours(mainConfig);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeMainDisplay();
    initializeModalDisplay(); // Pre-render immediately so there's no delay when modal opens
    setInterval(initializeMainDisplay, 60000);
    setInterval(initializeModalDisplay, 60000);

    // Simplified modal init
    const bookingModal = document.getElementById('booking-modal');
    const openModalButtons = document.querySelectorAll('.js-open-booking-modal');
    const closeModalButton = document.getElementById('modal-close-button');

    const openModal = () => {
        bookingModal.classList.remove('hidden');
    };

    const closeModal = () => bookingModal.classList.add('hidden');

    openModalButtons.forEach(btn => btn.addEventListener('click', openModal));
    closeModalButton.addEventListener('click', closeModal);
    bookingModal.addEventListener('click', (e) => { if (e.target === bookingModal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === "Escape" && !bookingModal.classList.contains('hidden')) closeModal(); });
});
