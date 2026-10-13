const t = window.bookyI18n.start();

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

    const displayName = user.fullName || user.name || user.email || t("role.owner", "Owner");

    document.getElementById("userName").textContent = displayName;
    document.getElementById("userRole").textContent =
        t(`role.${String(user.role).toLowerCase()}`, user.role);
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
        if (!value) return t("common.na", "N/A");

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return t("common.na", "N/A");

        return date.toLocaleString(bookyI18n.locale, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function appendDetail(container, label, value) {
        const paragraph = document.createElement("p");
        const heading = createElement("strong", "", t("common.labelColon", "{label}: ", { label }));
        const text = createElement("span", "", value ?? t("common.na", "N/A"));

        paragraph.append(heading, text);
        container.append(paragraph);
    }

    function createBookingCard(booking) {
        const card = createElement("div", "glass-card admin-item");
        const header = createElement("div", "admin-item-header");
        const titleGroup = document.createElement("div");

        titleGroup.append(
            createElement("h3", "", booking.serviceName || t("common.service", "Service")),
            createElement("p", "", booking.businessName || t("browse.typeFallback", "Business"))
        );

        const status = createElement(
            "span",
            `booking-status ${getStatusClass(booking.status)}`,
            t(`status.${booking.status || "UNKNOWN"}`, booking.status || "UNKNOWN")
        );

        header.append(titleGroup, status);

        const details = createElement("div", "booking-details");

        appendDetail(details, t("common.client", "Client"), booking.clientName || t("common.na", "N/A"));
        appendDetail(details, t("auth.email", "Email"), booking.clientEmail || t("common.na", "N/A"));
        appendDetail(
            details,
            t("common.appointment", "Appointment"),
            formatDate(booking.appointmentTime)
        );

        appendDetail(
            details,
            t("common.price", "Price"),
            booking.servicePrice == null ? t("common.na", "N/A") : `$${booking.servicePrice}`
        );

        appendDetail(
            details,
            t("common.duration", "Duration"),
            booking.serviceDuration == null
                ? t("common.na", "N/A")
                : bookyI18n.tn("count.minutes", Number(booking.serviceDuration), "minute", "minutes")
        );

        card.append(header, details);

        return card;
    }

    async function loadBookings() {
        showPlaceholder(t("mybookings.loading", "Loading bookings..."));
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
                throw new Error(t("bookings.loadError", "Unable to load bookings."));
            }

            const bookings = await response.json();

            if (!Array.isArray(bookings)) {
                throw new Error(t("bookings.unexpected", "Unexpected booking response."));
            }

            if (bookings.length === 0) {
                showPlaceholder(
                    t("ownerbookings.empty", "No bookings have been made for your businesses yet.")
                );
                return;
            }

            const fragment = document.createDocumentFragment();

            bookings.forEach((booking) => {
                fragment.append(createBookingCard(booking));
            });

            bookingsContainer.replaceChildren(fragment);
        } catch (error) {
            showPlaceholder(t("bookings.loadError", "Unable to load bookings."));
            showMessage(error.message || t("bookings.loadError", "Unable to load bookings."), "error");
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