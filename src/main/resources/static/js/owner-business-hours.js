const t = window.bookyI18n.start();

const API_URL = "";

const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user") || "null");

const businessSelect = document.getElementById("businessSelect");
const hoursList = document.getElementById("hoursList");
const message = document.getElementById("message");

const days = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
];

if (!token || !user) {
  location.href = "login.html";
}

if (user.role !== "OWNER" && user.role !== "ADMIN") {
  alert(t("owner.ownersOnly", "Access denied. Owners only."));
  location.href = "dashboard.html";
}

loadBusinesses();

businessSelect?.addEventListener("change", async () => {
  renderDays();
  await loadExistingHours();
});

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

function showMessage(text, type = "error") {
  if (!message) return;

  message.textContent = text;
  message.className = text ? `message ${type}` : "message";
}

async function loadBusinesses() {
  try {
    showMessage(t("browse.loading", "Loading businesses..."), "success");

    const response = await fetch(`${API_URL}/businesses`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    const businesses = await response.json();

    console.log("Logged user:", user);
    console.log("All businesses:", businesses);

    if (!response.ok) {
      throw new Error(t("browse.loadError", "Could not load businesses."));
    }

const myBusinesses = businesses.filter((business) => {
  if (user.role === "ADMIN") return true;

  const ownerId = business.ownerId || business.owner?.id;
  const loggedUserId = user.id || user.userId;

  return Number(ownerId) === Number(loggedUserId);
});

    console.log("My businesses:", myBusinesses);

    businessSelect.innerHTML = "";

    if (myBusinesses.length === 0) {
      businessSelect.innerHTML = `<option value="">${t("browse.empty.title", "No businesses found")}</option>`;
      showMessage(t("hours.needBusiness", "You need to add a business first."));
      return;
    }

    businessSelect.innerHTML = `<option value="">${t("hours.select", "Select business")}</option>`;

    myBusinesses.forEach((business) => {
      const option = document.createElement("option");
      option.value = business.id;
      option.textContent = business.name;
      businessSelect.appendChild(option);
    });

    showMessage("");
  } catch (error) {
    showMessage(error.message || t("browse.loadError", "Could not load businesses."));
  }
}

function renderDays() {
  hoursList.innerHTML = "";

  const businessId = businessSelect.value;

  if (!businessId) {
    hoursList.innerHTML = `<p class="muted">${t("hours.selectHint", "Select a business to manage hours.")}</p>`;
    return;
  }

  days.forEach((day) => {
    const row = document.createElement("div");
    row.className = "hours-row";
    row.dataset.day = day;

    row.innerHTML = `
      <div class="hours-day">
        <strong>${formatDay(day)}</strong>
      </div>

      <label class="hours-closed">
        <input type="checkbox" class="closed-input" data-day="${day}">
        ${t("common.closed", "Closed")}
      </label>

      <input type="time" class="form-input open-input" data-day="${day}" value="09:00">
      <input type="time" class="form-input close-input" data-day="${day}" value="18:00">

      <button type="button" class="btn btn-primary btn-sm save-hours-btn" data-day="${day}">
        ${t("common.save", "Save")}
      </button>
    `;

    hoursList.appendChild(row);
  });

  document.querySelectorAll(".closed-input").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const day = checkbox.dataset.day;
      toggleClosed(day, checkbox.checked);
    });
  });

  document.querySelectorAll(".save-hours-btn").forEach((button) => {
    button.addEventListener("click", () => {
      saveDayHours(button.dataset.day);
    });
  });
}

async function loadExistingHours() {
  const businessId = businessSelect.value;

  if (!businessId) return;

  try {
    const response = await fetch(`${API_URL}/business-hours/business/${businessId}`, {
      headers: getAuthHeaders()
    });

    const hours = await response.json();

    if (!response.ok) {
      throw new Error(t("hours.loadError", "Could not load existing hours."));
    }

    hours.forEach((item) => {
      const day = item.dayOfWeek;

      const closedInput = document.querySelector(`.closed-input[data-day="${day}"]`);
      const openInput = document.querySelector(`.open-input[data-day="${day}"]`);
      const closeInput = document.querySelector(`.close-input[data-day="${day}"]`);

      if (!closedInput || !openInput || !closeInput) return;

      closedInput.checked = item.closed;

      if (item.openTime) {
        openInput.value = item.openTime.slice(0, 5);
      }

      if (item.closeTime) {
        closeInput.value = item.closeTime.slice(0, 5);
      }

      toggleClosed(day, item.closed);
    });

  } catch (error) {
    showMessage(error.message || t("hours.loadError", "Could not load existing hours."));
  }
}

async function saveDayHours(day) {
  const businessId = businessSelect.value;

  if (!businessId) {
    showMessage(t("hours.pickFirst", "Please select a business first."));
    return;
  }

  const closedInput = document.querySelector(`.closed-input[data-day="${day}"]`);
  const openInput = document.querySelector(`.open-input[data-day="${day}"]`);
  const closeInput = document.querySelector(`.close-input[data-day="${day}"]`);

  const closed = closedInput.checked;

  const body = {
    businessId: Number(businessId),
    dayOfWeek: day,
    closed
  };

  if (!closed) {
    body.openTime = openInput.value;
    body.closeTime = closeInput.value;
  }

  try {
    showMessage(t("hours.saving", "Saving {day}...", { day: formatDay(day) }), "success");

    const response = await fetch(`${API_URL}/business-hours/save`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(bookyI18n.tm(data.message) || t("hours.saveError", "Could not save {day}.", { day: formatDay(day) }));
    }

    showMessage(t("hours.saved", "{day} hours saved successfully.", { day: formatDay(day) }), "success");

  } catch (error) {
    showMessage(error.message || t("hours.saveError", "Could not save {day}.", { day: formatDay(day) }));
  }
}

function toggleClosed(day, closed) {
  const openInput = document.querySelector(`.open-input[data-day="${day}"]`);
  const closeInput = document.querySelector(`.close-input[data-day="${day}"]`);

  if (!openInput || !closeInput) return;

  openInput.disabled = closed;
  closeInput.disabled = closed;
}

function formatDay(day) {
  return t(`day.${day}`, day.charAt(0) + day.slice(1).toLowerCase());
}