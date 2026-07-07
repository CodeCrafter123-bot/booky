const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user") || "null");

if (!token || !user || user.role !== "ADMIN") {
    window.location.href = "login.html";
}

const bookingsContainer = document.getElementById("bookingsContainer");
const message = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");

const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const avatarInitial = document.getElementById("avatarInitial");

const API_URL = "http://localhost:8080/bookings/admin";

userName.textContent = user.name || user.email || "Admin";
userRole.textContent = user.role;
avatarInitial.textContent = (user.name || user.email || "A").charAt(0).toUpperCase();

function showMessage(text, type = "success") {
    message.textContent = text;
    message.className = type === "success" ? "message success" : "message error";

    setTimeout(() => {
        message.textContent = "";
        message.className = "message";
    }, 3000);
}

function getStatusClass(status) {
    if (status === "PENDING") return "status-pending";
    if (status === "CONFIRMED") return "status-confirmed";
    if (status === "CANCELLED") return "status-cancelled";
    return "";
}

function formatDate(dateValue) {
    return new Date(dateValue).toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

async function loadBookings() {
    bookingsContainer.innerHTML = `<p class="muted">Loading bookings...</p>`;

    try {
        const response = await fetch(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load bookings.");
        }

        const bookings = await response.json();

        if (bookings.length === 0) {
            bookingsContainer.innerHTML = `<p class="muted">No bookings found.</p>`;
            return;
        }

        bookingsContainer.innerHTML = "";

        bookings.forEach((booking) => {
            const isPending = booking.status === "PENDING";
bookingsContainer.innerHTML += `
    <div class="glass-card admin-item">
        <div class="admin-item-header">
            <div>
                <h3>${booking.serviceName || "Service"}</h3>
                <p>Booking #${booking.id}</p>
            </div>

            <span class="booking-status ${getStatusClass(booking.status)}">
                ${booking.status}
            </span>
        </div>

        <div class="booking-details">
            <p><strong>👤 Client:</strong> ${booking.clientName || "N/A"}</p>
            <p><strong>📧 Email:</strong> ${booking.clientEmail || "N/A"}</p>

            <p><strong>🏢 Business:</strong> ${booking.businessName || "N/A"}</p>
            <p><strong>📍 Location:</strong> ${booking.businessLocation || "N/A"}</p>

            <p><strong>💰 Price:</strong> $${booking.servicePrice ?? "N/A"}</p>
            <p><strong>⏱ Duration:</strong> ${booking.serviceDuration || "N/A"} minutes</p>

            <p><strong>📅 Appointment:</strong> ${formatDate(booking.appointmentTime)}</p>
        </div>

        <div class="admin-item-actions">
            <button
                class="btn btn-primary btn-sm"
                onclick="acceptBooking(${booking.id})"
                ${!isPending ? "disabled" : ""}>
                ✓ Accept
            </button>

            <button
                class="btn btn-danger btn-sm"
                onclick="declineBooking(${booking.id})"
                ${!isPending ? "disabled" : ""}>
                ✕ Decline
            </button>
        </div>
    </div>
`;
        });

    } catch (error) {
        bookingsContainer.innerHTML = `<p class="muted">Unable to load bookings.</p>`;
        showMessage("Unable to load bookings.", "error");
        console.error(error);
    }
}

async function acceptBooking(id) {
    try {
        const response = await fetch(`http://localhost:8080/bookings/accept/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to accept booking.");
        }

        showMessage("Booking accepted successfully.");
        loadBookings();

    } catch (error) {
        showMessage("Failed to accept booking.", "error");
        console.error(error);
    }
}

async function declineBooking(id) {
    try {
        const response = await fetch(`http://localhost:8080/bookings/decline/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to decline booking.");
        }

        showMessage("Booking declined successfully.");
        loadBookings();

    } catch (error) {
        showMessage("Failed to decline booking.", "error");
        console.error(error);
    }
}

refreshBtn.addEventListener("click", loadBookings);

logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
});

loadBookings();