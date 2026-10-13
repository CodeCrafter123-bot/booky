const t = window.bookyI18n.start();

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
    subtitle: t("dash.client.subtitle", "Book appointments, explore businesses, and manage your reservations."),
    actionsTitle: t("dash.client.actionsTitle", "Client Workspace"),
    actionsSubtitle: t("dash.client.actionsSubtitle", "Everything you need to book and manage your appointments."),
    stats: [
      { label: t("dash.stat.bookingFlow", "Booking Flow"), value: t("dash.stat.live", "Live"), icon: "✅" },
      { label: t("menu.myBookings", "My Bookings"), value: t("dash.stat.active", "Active"), icon: "📅" },
      { label: t("dash.stat.role", "Role"), value: t("role.client", "Client"), icon: "👤" }
    ],
    links: [
      {
        title: t("menu.browse", "Browse Businesses"),
        description: t("dash.client.browseDesc", "Find barbers, clinics, gyms, tutors, salons, and more."),
        icon: "🏢",
        href: "browse.html"
      },
      {
        title: t("menu.myBookings", "My Bookings"),
        description: t("dash.client.bookingsDesc", "View appointment status and cancel bookings."),
        icon: "📅",
        href: "my-bookings.html"
      },
      {
        title: t("menu.profile", "Profile"),
        description: t("dash.client.profileDesc", "View your personal account information."),
        icon: "👤",
        href: "profile.html"
      }
    ]
  },
OWNER: {
  subtitle: t("dash.owner.subtitle", "Manage your services, monitor appointment activity, and grow your business."),
  actionsTitle: t("dash.owner.actionsTitle", "Owner Workspace"),
  actionsSubtitle: t("dash.owner.actionsSubtitle", "Manage your businesses, services, bookings, reviews, and analytics."),

  stats: [
    {
      label: t("menu.analytics", "Analytics Dashboard"),
      value: t("dash.stat.live", "Live"),
      icon: "📊"
    },
    {
      label: t("dash.stat.bookings", "Bookings"),
      value: t("dash.stat.tracking", "Tracking"),
      icon: "📅"
    },
    {
      label: t("dash.stat.role", "Role"),
      value: t("role.owner", "Owner"),
      icon: "👤"
    }
  ],

  links: [
    {
      title: t("menu.analytics", "Analytics Dashboard"),
      description: t("dash.owner.analyticsDesc", "View bookings, ratings, businesses, services, and recent activity."),
      icon: "📊",
      href: "owner-dashboard.html"
    },
    {
      title: t("menu.browse", "Browse Businesses"),
      description: t("dash.owner.browseDesc", "View businesses currently listed on Booky."),
      icon: "🏢",
      href: "browse.html"
    },
    {
      title: t("menu.addBusiness", "Add Business"),
      description: t("dash.owner.addBusinessDesc", "Create your own business profile on Booky."),
      icon: "➕",
      href: "admin-add-business.html"
    },
    {
      title: t("menu.addService", "Add Service"),
      description: t("dash.owner.addServiceDesc", "Create services for your business."),
      icon: "🛠️",
      href: "owner-add-service.html"
    },
  {
  title: t("menu.manageServices", "Manage Services"),
  description: t("dash.owner.manageServicesDesc", "Choose your business and view its services."),
  icon: "⚙️",
  href: "owner-services.html"
},
    {
      title: t("menu.bookingActivity", "Booking Activity"),
      description: t("dash.owner.bookingsDesc", "View bookings for your businesses."),
      icon: "📅",
      href: "owner-bookings.html"
    },
    {
      title: t("menu.businessHours", "Business Hours"),
      description: t("dash.owner.hoursDesc", "Set weekly opening and closing times for your business."),
      icon: "⏰",
      href: "owner-business-hours.html"
    },
    {
      title: t("menu.customerReviews", "Customer Reviews"),
      description: t("dash.owner.reviewsDesc", "View ratings and feedback for your businesses."),
      icon: "⭐",
      href: "owner-reviews.html"
    },
    {
      title: t("menu.profile", "Profile"),
      description: t("dash.owner.profileDesc", "View your owner account information."),
      icon: "👤",
      href: "profile.html"
    }
  ]
},

  ADMIN: {
    subtitle: t("dash.admin.subtitle", "Control platform activity, manage businesses, and prepare for full admin operations."),
    actionsTitle: t("dash.admin.actionsTitle", "Admin Control Center"),
    actionsSubtitle: t("dash.admin.actionsSubtitle", "Manage platform data and monitor Booky activity."),
    stats: [
      { label: t("menu.adminPanel", "Admin Panel"), value: t("dash.stat.online", "Online"), icon: "🛡️" },
      { label: t("dash.stat.businesses", "Businesses"), value: t("dash.stat.connected", "Connected"), icon: "🏢" },
      { label: t("dash.stat.role", "Role"), value: t("role.admin", "Admin"), icon: "👑" }
    ],
    links: [
      {
        title: t("menu.adminPanel", "Admin Panel"),
        description: t("dash.admin.panelDesc", "View platform overview and recent businesses."),
        icon: "🛡️",
        href: "admin.html"
      },
     
      {
        title: t("menu.addBusiness", "Add Business"),
        description: t("dash.admin.addBusinessDesc", "Create a new business from the admin dashboard."),
        icon: "➕",
        href: "admin-add-business.html"
      },
      {
        title: t("menu.allBusinesses", "All Businesses"),
        description: t("dash.admin.businessesDesc", "Review all businesses registered on the platform."),
        icon: "🏢",
        href: "browse.html"
      },
      {
  title: t("menu.allBookings", "All Bookings"),
  description: t("dash.admin.bookingsDesc", "Review, approve and decline client bookings."),
  icon: "📅",
  href: "admin-bookings.html"
},
     {
  title: t("menu.users", "Users Management"),
  description: t("dash.admin.usersDesc", "View all users, edit profiles, and manage roles."),
  icon: "👥",
  href: "admin-users.html"
},
      {
        title: t("menu.platformStats", "Platform Statistics"),
        description: t("dash.admin.statsDesc", "Future analytics and reporting section."),
        icon: "📊",
        href: "#"
      },
       { title: t("menu.reviewManagement", "Review Management"), 
        description: t("dash.admin.reviewsDesc", "View and moderate all customer reviews."), 
        href: "admin-reviews.html",
         icon: "⭐" 
        },
      {
        title: t("menu.profile", "Profile"),
        description: t("dash.admin.profileDesc", "View your admin account information."),
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

function renderUserInfo() {
  if (userName) userName.textContent = fullName;
  if (userRole) userRole.textContent = t(`role.${role.toLowerCase()}`, role);
  if (avatarInitial) avatarInitial.textContent = fullName.charAt(0).toUpperCase();

  if (rolePill) rolePill.textContent = t(`role.${role.toLowerCase()}`, role);
  if (welcomeHeading) welcomeHeading.textContent = t("dash.welcome", "Welcome back, {name} 👋", { name: fullName });
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
      alert(t("dash.notAvailable", "This feature needs backend support first."));
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