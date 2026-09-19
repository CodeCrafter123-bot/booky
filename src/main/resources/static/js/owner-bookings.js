(() => {
    const token = localStorage.getItem("booky_token");
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("booky_user") || "null");
    } catch {
        user = null;
    }

    if (!token || !user || user.role !== "OWNER") {
        window.location.replace("login.html");
        return;
    }

    const bookingsContainer = document.getElementById("bookingsContainer");
    const message = document.getElementById("message");
    const refreshBtn = document.getElementById("refreshBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    const displayName = user.fullName || user.name || user.email || "Owner";

    document.getElementById("userName").textContent = displayName;
    document.getElementById("userRole").textContent = user.role;
    document.getElementById("avatarInitial").textContent =
        String(displayName).charAt(0).toUpperCase();

    let messageTimer;

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = String(text);
        }

        return element;
    }

    function showMessage(text, type = "success") {
        clearTimeout(messageTimer);

        message.textContent = text;
        message.className =
            type === "success" ? "message success" : "message error";

        messageTimer = setTimeout(() => {
            message.textContent = "";
            message.className = "message";
        }, 3000);
    }

    function showPlaceholder(text) {
        bookingsContainer.replaceChildren(
            createElement("p", "muted", text)
        );
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

    function formatDate(value) {
        if (!value) return "N/A";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "N/A";

        return date.toLocaleString([], {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function appendDetail(container, label, value) {
        const paragraph = document.createElement("p");
        const heading = createElement("strong", "", `${label}: `);
        const text = createElement("span", "", value ?? "N/A");

        paragraph.append(heading, text);
        container.append(paragraph);
    }

    function createBookingCard(booking) {
        const card = createElement("div", "glass-card admin-item");
        const header = createElement("div", "admin-item-header");
        const titleGroup = document.createElement("div");

        titleGroup.append(
            createElement("h3", "", booking.serviceName || "Service"),
            createElement("p", "", booking.businessName || "Business")
        );

        const status = createElement(
            "span",
            `booking-status ${getStatusClass(booking.status)}`,
            booking.status || "UNKNOWN"
        );

        header.append(titleGroup, status);

        const details = createElement("div", "booking-details");

        appendDetail(details, "Client", booking.clientName || "N/A");
        appendDetail(details, "Email", booking.clientEmail || "N/A");
        appendDetail(
            details,
            "Appointment",
            formatDate(booking.appointmentTime)
        );

        appendDetail(
            details,
            "Price",
            booking.servicePrice == null ? "N/A" : `$${booking.servicePrice}`
        );

        appendDetail(
            details,
            "Duration",
            booking.serviceDuration == null
                ? "N/A"
                : `${booking.serviceDuration} minutes`
        );

        card.append(header, details);

        return card;
    }

    async function loadBookings() {
        showPlaceholder("Loading bookings...");
        refreshBtn.disabled = true;

        try {
            const response = await fetch("/bookings/owner", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                window.location.replace("login.html");
                return;
            }

            if (!response.ok) {
                throw new Error("Unable to load bookings.");
            }

            const bookings = await response.json();

            if (!Array.isArray(bookings)) {
                throw new Error("Unexpected booking response.");
            }

            if (bookings.length === 0) {
                showPlaceholder(
                    "No bookings have been made for your businesses yet."
                );
                return;
            }

            const fragment = document.createDocumentFragment();

            bookings.forEach((booking) => {
                fragment.append(createBookingCard(booking));
            });

            bookingsContainer.replaceChildren(fragment);
        } catch (error) {
            showPlaceholder("Unable to load bookings.");
            showMessage(error.message || "Unable to load bookings.", "error");
        } finally {
            refreshBtn.disabled = false;
        }
    }

    refreshBtn.addEventListener("click", loadBookings);

    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.replace("login.html");
    });

    loadBookings();
})();