const t = window.bookyI18n.start();

const API_URL = "";

const token = localStorage.getItem("booky_token");
const user = JSON.parse(
    localStorage.getItem("booky_user") || "null"
);

if (!token || !user) {
    window.location.href = "login.html";
}

if (user?.role !== "OWNER") {
    alert(t("owner.ownersOnly", "Access denied. Owners only."));
    window.location.href = "dashboard.html";
}

const elements = {
    todayBookings: document.getElementById("todayBookings"),
    pendingBookings: document.getElementById("pendingBookings"),
    confirmedBookings: document.getElementById("confirmedBookings"),
    cancelledBookings: document.getElementById("cancelledBookings"),
    averageRating: document.getElementById("averageRating"),
    totalReviews: document.getElementById("totalReviews"),
    totalBusinesses: document.getElementById("totalBusinesses"),
    totalServices: document.getElementById("totalServices"),
    popularServices: document.getElementById("popularServices"),
    recentBookings: document.getElementById("recentBookings"),
    message: document.getElementById("message"),
    welcomeHeading: document.getElementById("welcomeHeading")
};

document
    .getElementById("refreshBtn")
    ?.addEventListener("click", loadDashboard);

document
    .getElementById("logoutBtn")
    ?.addEventListener("click", logout);

const ownerName = user.fullName || user.name || t("role.owner", "Owner");

elements.welcomeHeading.textContent =
    t("ownerdash.welcome", "Welcome back, {name}", { name: ownerName });

loadDashboard();

async function loadDashboard() {
    showMessage(t("ownerdash.loading", "Loading dashboard..."), "info");

    try {
        const response = await fetch(
            `${API_URL}/owner/dashboard`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            }
        );

        const data = await readResponse(response);

        if (!response.ok) {
            handleApiError(response, data);
            return;
        }

        renderStatistics(data);
        renderPopularServices(data.popularServices || []);
        renderRecentBookings(data.recentBookings || []);

        showMessage("", "");
    } catch (error) {
        console.error("Dashboard error:", error);

        showMessage(
            t("common.offline", "Could not connect to the backend."),
            "error"
        );
    }
}

function renderStatistics(data) {
    elements.todayBookings.textContent =
        data.todayBookings ?? 0;

    elements.pendingBookings.textContent =
        data.pendingBookings ?? 0;

    elements.confirmedBookings.textContent =
        data.confirmedBookings ?? 0;

    elements.cancelledBookings.textContent =
        data.cancelledBookings ?? 0;

    elements.averageRating.textContent =
        `★ ${Number(data.averageRating || 0).toFixed(1)}`;

    elements.totalReviews.textContent =
        data.totalReviews ?? 0;

    elements.totalBusinesses.textContent =
        data.totalBusinesses ?? 0;

    elements.totalServices.textContent =
        data.totalServices ?? 0;
}

function renderPopularServices(services) {
    if (!services.length) {
        elements.popularServices.innerHTML = `
            <p class="empty-state">
                ${t("ownerdash.popularEmptyShort", "No service booking data available.")}
            </p>
        `;
        return;
    }

    elements.popularServices.innerHTML = services
        .map((service, index) => `
            <div class="popular-service-row">
                <div>
                    <span class="service-rank">
                        ${index + 1}
                    </span>

                    <strong>
                        ${escapeHtml(service.serviceName)}
                    </strong>
                </div>

                <span class="booking-count">
                    ${bookyI18n.tn("count.bookings", service.bookingCount, "booking", "bookings")}
                </span>
            </div>
        `)
        .join("");
}

function renderRecentBookings(bookings) {
    if (!bookings.length) {
        elements.recentBookings.innerHTML = `
            <p class="empty-state">
                ${t("ownerdash.recentEmptyShort", "No recent bookings available.")}
            </p>
        `;
        return;
    }

    elements.recentBookings.innerHTML = bookings
        .map(booking => `
            <article class="recent-booking-card">

                <div class="recent-booking-details">
                    <strong>
                        ${escapeHtml(booking.clientName)}
                    </strong>

                    <span>
                        ${escapeHtml(booking.serviceName)}
                    </span>

                    <small>
                        ${escapeHtml(booking.businessName)}
                    </small>
                </div>

                <div class="recent-booking-meta">
                    <span class="status-badge status-${booking.status.toLowerCase()}">
                        ${escapeHtml(t(`status.${booking.status}`, booking.status))}
                    </span>

                    <time class="recent-booking-time">
                        ${formatAppointmentTime(
                            booking.appointmentTime
                        )}
                    </time>
                </div>

            </article>
        `)
        .join("");
}

async function readResponse(response) {
    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch {
        return {
            message: text
        };
    }
}

function handleApiError(response, data) {
    if (
        response.status === 403 &&
        data.code === "ACCOUNT_FROZEN"
    ) {
        localStorage.removeItem("booky_token");
        localStorage.removeItem("booky_user");

        alert(
            `${bookyI18n.tm(data.message)}\n` +
            t("common.frozenReason", "Reason: {reason}", {
                reason: data.reason || t("common.noReason", "No reason provided")
            })
        );

        window.location.href = "login.html";
        return;
    }

    if (response.status === 401) {
        logout();
        return;
    }

    showMessage(
        bookyI18n.tm(data.message) || t("ownerdash.loadError", "Could not load dashboard."),
        "error"
    );
}

function formatAppointmentTime(value) {
    if (!value) {
        return t("common.noDate", "No date");
    }

    const appointmentDate = new Date(value);
    const today = new Date();

    const appointmentDay = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate()
    );

    const currentDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const difference =
        appointmentDay.getTime() - currentDay.getTime();

    const dayDifference =
        Math.round(difference / 86400000);

    let dateLabel;

    if (dayDifference === 0) {
        dateLabel = t("common.today", "Today");
    } else if (dayDifference === -1) {
        dateLabel = t("common.yesterday", "Yesterday");
    } else if (dayDifference === 1) {
        dateLabel = t("common.tomorrow", "Tomorrow");
    } else {
        dateLabel = appointmentDate.toLocaleDateString(
            bookyI18n.locale || "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }

    const timeLabel =
        appointmentDate.toLocaleTimeString(
            bookyI18n.locale || "en-US",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

    return t("common.dateTime", "{date}, {time}", { date: dateLabel, time: timeLabel });
}

function showMessage(text, type) {
    elements.message.textContent = text;
    elements.message.className =
        `dashboard-message ${type || ""}`;

    elements.message.style.display =
        text ? "block" : "none";
}

function logout() {
    localStorage.removeItem("booky_token");
    localStorage.removeItem("booky_user");

    window.location.href = "login.html";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}