const API_BASE_URL = "http://localhost:8080";

const CLIENT_ACTIONS = [
    {
        icon: "📅",
        title: "Book an appointment",
        desc: "Find a time that works and reserve your slot.",
        href: "book.html"
    },
    {
        icon: "🗂",
        title: "My bookings",
        desc: "View, reschedule, or cancel upcoming appointments.",
        href: "my-bookings.html"
    },
    {
        icon: "🔍",
        title: "Find a business",
        desc: "Browse businesses and services available on Booky.",
        href: "browse.html"
    },
    {
        icon: "👤",
        title: "Edit profile",
        desc: "Update your name, phone number, or password.",
        href: "profile.html"
    }
];

const OWNER_ACTIONS = [
    {
        icon: "🕒",
        title: "Manage availability",
        desc: "Set your working hours and open time slots.",
        href: "availability.html"
    },
    {
        icon: "📋",
        title: "View bookings",
        desc: "See every upcoming and past appointment.",
        href: "bookings.html"
    },
    {
        icon: "🧾",
        title: "Manage services",
        desc: "Add, edit, or remove the services you offer.",
        href: "services.html"
    },
    {
        icon: "👤",
        title: "Edit profile",
        desc: "Update your business details or password.",
        href: "profile.html"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const user = getStoredUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    renderUser(user);
    renderActions(user.role);
    setTodayDate();

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});

function getStoredUser() {
    const raw = localStorage.getItem("booky_user");
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.fullName || !parsed.role) return null;
        return parsed;
    } catch {
        return null;
    }
}

function renderUser(user) {
    const nameEl = document.getElementById("userName");
    const roleEl = document.getElementById("userRole");
    const avatarEl = document.getElementById("userAvatar");
    const headlineEl = document.getElementById("welcomeHeadline");
    const subEl = document.getElementById("welcomeSub");

    const firstName = user.fullName.trim().split(" ")[0];
    const roleLabel = user.role === "OWNER" ? "Business owner" : "Client";

    nameEl.textContent = user.fullName;
    roleEl.textContent = roleLabel;
    avatarEl.textContent = user.fullName.trim().charAt(0).toUpperCase();

    headlineEl.textContent = `Welcome back, ${firstName}.`;
    subEl.textContent = user.role === "OWNER"
        ? "Here's a quick look at your business today."
        : "Here's a quick look at your appointments today.";
}

function renderActions(role) {
    const grid = document.getElementById("actionGrid");
    const actions = role === "OWNER" ? OWNER_ACTIONS : CLIENT_ACTIONS;

    grid.innerHTML = actions.map(action => `
        <a class="action-card" href="${action.href}">
            <span class="action-card__icon" aria-hidden="true">${action.icon}</span>
            <span class="action-card__title">${action.title}</span>
            <span class="action-card__desc">${action.desc}</span>
        </a>
    `).join("");
}

function setTodayDate() {
    const el = document.getElementById("todayDate");
    if (!el) return;

    const today = new Date();
    el.textContent = today.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric"
    });
}

function logout() {
    localStorage.removeItem("booky_user");
    window.location.href = "login.html";
}