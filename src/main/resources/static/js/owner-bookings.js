const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user") || "null");

if (!token || !user || user.role !== "OWNER") {
    window.location.href = "login.html";
}

const bookingsContainer = document.getElementById("bookingsContainer");
const message = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");

const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const avatarInitial = document.getElementById("avatarInitial");

const API_URL = "http://localhost:8080/bookings/owner";

userName.textContent = user.fullName || user.name || user.email;
userRole.textContent = user.role;
avatarInitial.textContent =
    (user.fullName || user.name || user.email).charAt(0).toUpperCase();

function showMessage(text, type = "success") {
    message.textContent = text;
    message.className = type === "success"
        ? "message success"
        : "message error";

    setTimeout(() => {
        message.textContent = "";
        message.className = "message";
    }, 3000);
}

function getStatusClass(status) {
    switch (status) {
        case "PENDING":
            return "status-pending";
        case "CONFIRMED":
            return "status-confirmed";
        case "CANCELLED":
            return "status-cancelled";
        default:
            return "";
    }
}

function formatDate(date) {
    return new Date(date).toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

async function loadBookings() {

    bookingsContainer.innerHTML = `
        <p class="muted">Loading bookings...</p>
    `;

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
            bookingsContainer.innerHTML = `
                <p class="muted">
                    No bookings have been made for your businesses yet.
                </p>
            `;
            return;
        }

        bookingsContainer.innerHTML = "";

        bookings.forEach(booking => {

            bookingsContainer.innerHTML += `
                <div class="glass-card admin-item">

                    <div class="admin-item-header">

                        <div>
                            <h3>${booking.serviceName}</h3>
                            <p>${booking.businessName}</p>
                        </div>

                        <span class="booking-status ${getStatusClass(booking.status)}">
                            ${booking.status}
                        </span>

                    </div>

                    <div class="booking-details">

                        <p><strong>Client:</strong> ${booking.clientName}</p>

                        <p><strong>Email:</strong> ${booking.clientEmail}</p>

                        <p><strong>Appointment:</strong>
                        ${formatDate(booking.appointmentTime)}</p>

                        <p><strong>Price:</strong>
                        $${booking.servicePrice}</p>

                        <p><strong>Duration:</strong>
                        ${booking.serviceDuration} minutes</p>

                    </div>

                </div>
            `;
        });

    } catch (error) {
        console.error(error);
        showMessage(error.message, "error");
    }
}

refreshBtn.addEventListener("click", loadBookings);

logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
});

loadBookings();