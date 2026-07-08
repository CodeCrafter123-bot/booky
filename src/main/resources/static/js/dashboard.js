const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user") || "null");

if (!token || !user) {
  window.location.href = "login.html";
}

const sidebarNav = document.getElementById("sidebarNav");
const actionGrid = document.getElementById("actionGrid");
const statGrid = document.getElementById("statGrid");

const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const avatarInitial = document.getElementById("avatarInitial");

const welcomeHeading = document.getElementById("welcomeHeading");
const welcomeSub = document.getElementById("welcomeSub");
const rolePill = document.getElementById("rolePill");

const actionsTitle = document.getElementById("actionsTitle");
const actionsSubtitle = document.getElementById("actionsSubtitle");

const logoutBtn = document.getElementById("logoutBtn");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const sidebar = document.getElementById("sidebar");

const fullName = user.fullName || user.name || user.username || "User";
const role = (user.role || "CLIENT").toUpperCase();

const dashboardConfig = {
  CLIENT: {
    subtitle: "Book appointments, explore businesses, and manage your reservations.",
    actionsTitle: "Client Workspace",
    actionsSubtitle: "Everything you need to book and manage your appointments.",
    stats: [
      { label: "Booking Flow", value: "Live", icon: "✅" },
      { label: "My Bookings", value: "Active", icon: "📅" },
      { label: "Role", value: "Client", icon: "👤" }
    ],
    links: [
      {
        title: "Browse Businesses",
        description: "Find barbers, clinics, gyms, tutors, salons, and more.",
        icon: "🏢",
        href: "browse.html"
      },
      {
        title: "My Bookings",
        description: "View appointment status and cancel bookings.",
        icon: "📅",
        href: "my-bookings.html"
      },
      {
        title: "Profile",
        description: "View your personal account information.",
        icon: "👤",
        href: "profile.html"
      }
    ]
  },

  OWNER: {
    subtitle: "Manage your services, monitor appointment activity, and grow your business.",
    actionsTitle: "Owner Workspace",
    actionsSubtitle: "Tools for managing services and future booking requests.",
    stats: [
      { label: "Business Tools", value: "Ready", icon: "🛠️" },
      { label: "Bookings", value: "Tracking", icon: "📅" },
      { label: "Role", value: "Owner", icon: "👤" }
    ],
    links: [
      {
        title: "Browse Businesses",
        description: "View businesses currently listed on Booky.",
        icon: "🏢",
        href: "browse.html"
      },
      {
  title: "Add Service",
  description: "Create services for your business.",
  icon: "🛠️",
  href: "owner-add-service.html"
},
      {
  title: "Add Business",
  description: "Create your own business profile on Booky.",
  icon: "➕",
  href: "admin-add-business.html"
},
      {
        title: "Manage Services",
        description: "View services after selecting a business.",
        icon: "🛠️",
        href: "services.html"
      },
      {
    title: "Booking Activity",
    description: "View bookings for your businesses.",
    icon: "📅",
    href: "owner-bookings.html"
},
{
  title: "Business Hours",
  description: "Set weekly opening and closing times for your business.",
  icon: "⏰",
  href: "owner-business-hours.html"
},
      {
        title: "Profile",
        description: "View your owner account information.",
        icon: "👤",
        href: "profile.html"
      }
    ]
  },

  ADMIN: {
    subtitle: "Control platform activity, manage businesses, and prepare for full admin operations.",
    actionsTitle: "Admin Control Center",
    actionsSubtitle: "Manage platform data and monitor Booky activity.",
    stats: [
      { label: "Admin Panel", value: "Online", icon: "🛡️" },
      { label: "Businesses", value: "Connected", icon: "🏢" },
      { label: "Role", value: "Admin", icon: "👑" }
    ],
    links: [
      {
        title: "Admin Panel",
        description: "View platform overview and recent businesses.",
        icon: "🛡️",
        href: "admin.html"
      },
      {
        title: "Add Business",
        description: "Create a new business from the admin dashboard.",
        icon: "➕",
        href: "admin-add-business.html"
      },
      {
        title: "All Businesses",
        description: "Review all businesses registered on the platform.",
        icon: "🏢",
        href: "browse.html"
      },
      {
  title: "All Bookings",
  description: "Review, approve and decline client bookings.",
  icon: "📅",
  href: "admin-bookings.html"
},
      {
        title: "Users Management",
        description: "Coming soon after backend users endpoint.",
        icon: "👥",
        href: "#"
      },
      {
        title: "Platform Statistics",
        description: "Future analytics and reporting section.",
        icon: "📊",
        href: "#"
      },
      {
        title: "Profile",
        description: "View your admin account information.",
        icon: "👤",
        href: "profile.html"
      }
    ]
  }
};

const config = dashboardConfig[role] || dashboardConfig.CLIENT;

renderUserInfo();
renderDashboard();

logoutBtn?.addEventListener("click", logout);

mobileMenuBtn?.addEventListener("click", () => {
  sidebar?.classList.toggle("mobile-open");
});

document.addEventListener("click", (event) => {
  if (!sidebar?.classList.contains("mobile-open")) return;

  const clickedInsideSidebar = sidebar.contains(event.target);
  const clickedMenuButton = mobileMenuBtn?.contains(event.target);

  if (!clickedInsideSidebar && !clickedMenuButton) {
    sidebar.classList.remove("mobile-open");
  }
});

function renderUserInfo() {
  if (userName) userName.textContent = fullName;
  if (userRole) userRole.textContent = role;
  if (avatarInitial) avatarInitial.textContent = fullName.charAt(0).toUpperCase();

  if (rolePill) rolePill.textContent = role;
  if (welcomeHeading) welcomeHeading.textContent = `Welcome back, ${fullName} 👋`;
  if (welcomeSub) welcomeSub.textContent = config.subtitle;

  if (actionsTitle) actionsTitle.textContent = config.actionsTitle;
  if (actionsSubtitle) actionsSubtitle.textContent = config.actionsSubtitle;
}

function renderDashboard() {
  if (sidebarNav) {
    sidebarNav.innerHTML = config.links.map(renderSidebarLink).join("");
  }

  if (statGrid) {
    statGrid.innerHTML = config.stats.map(renderStatCard).join("");
  }

  if (actionGrid) {
    actionGrid.innerHTML = config.links.map(renderActionCard).join("");
  }

  document.querySelectorAll(".disabled-card, .disabled-link").forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      alert("This feature needs backend support first.");
    });
  });
}

function renderSidebarLink(link) {
  return `
    <a href="${link.href}" class="sidebar-link ${link.href === "#" ? "disabled-link" : ""}">
      <span class="ico">${link.icon}</span>
      <span>${link.title}</span>
    </a>
  `;
}

function renderStatCard(stat) {
  return `
    <div class="glass-card stat-card professional-stat">
      <div class="stat-icon">${stat.icon}</div>
      <div>
        <div class="stat-label">${stat.label}</div>
        <div class="stat-value">${stat.value}</div>
      </div>
    </div>
  `;
}

function renderActionCard(link) {
  return `
    <a href="${link.href}" class="glass-card hoverable action-card professional-action ${link.href === "#" ? "disabled-card" : ""}">
      <div class="action-card-top">
        <div class="action-icon">${link.icon}</div>
        <span class="action-arrow">→</span>
      </div>

      <div>
        <h3>${link.title}</h3>
        <p>${link.description}</p>
      </div>
    </a>
  `;
}

function logout() {
  localStorage.removeItem("booky_token");
  localStorage.removeItem("booky_user");
  localStorage.removeItem("selected_business_id");
  localStorage.removeItem("selected_service_id");

  window.location.href = "login.html";
}