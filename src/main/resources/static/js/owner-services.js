(() => {
  "use strict";

  const token = localStorage.getItem("booky_token");
  let user;

  try {
    user = JSON.parse(localStorage.getItem("booky_user") || "null");
  } catch {
    user = null;
  }

  if (!token || !user) {
    location.replace("login.html");
    return;
  }

  if (user.role !== "OWNER") {
    location.replace("dashboard.html");
    return;
  }

  const businessSelect = document.getElementById("businessSelect");
  const businessDetails = document.getElementById("businessDetails");
  const createBusinessLink = document.getElementById("createBusinessLink");
  const servicesSection = document.getElementById("servicesSection");
  const servicesHeading = document.getElementById("servicesHeading");
  const servicesGrid = document.getElementById("servicesGrid");
  const serviceCount = document.getElementById("serviceCount");
  const addServiceBtn = document.getElementById("addServiceBtn");
  const message = document.getElementById("message");
  const logoutBtn = document.getElementById("logoutBtn");

  let businesses = [];
  let requestVersion = 0;

  logoutBtn.addEventListener("click", logout);
  businessSelect.addEventListener("change", loadServices);

  addServiceBtn.addEventListener("click", () => {
    const business = selectedBusiness();
    if (!business) return;

    localStorage.setItem("selected_business_id", String(business.id));
    localStorage.removeItem("selected_service_id");
    location.href = "owner-add-service.html";
  });

  loadBusinesses();

  function logout() {
    [
      "booky_token",
      "booky_user",
      "selected_business_id",
      "selected_service_id"
    ].forEach(key => localStorage.removeItem(key));

    location.replace("login.html");
  }

  function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = text ? `message ${type}` : "message";
  }

  function selectedBusiness() {
    return businesses.find(
      business => String(business.id) === businessSelect.value
    );
  }

  async function fetchJson(url) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    });

    const data = await response.json().catch(() => null);

    if (response.status === 401) {
      logout();
      throw new Error("Please log in again.");
    }

    if (response.status === 403 && data?.code === "ACCOUNT_FROZEN") {
      alert(data.message || "Your account has been frozen.");
      logout();
      throw new Error("Account frozen.");
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
        (response.status === 403
          ? "You do not have permission to access this information."
          : "Could not load the requested information.")
      );
    }

    if (!Array.isArray(data)) {
      throw new Error("The server returned an unexpected response.");
    }

    return data;
  }

  async function loadBusinesses() {
    showMessage("");

    try {
      businesses = await fetchJson("/businesses/mine");

      businessSelect.replaceChildren();

      if (!businesses.length) {
        businessSelect.add(new Option("No businesses available", ""));
        businessDetails.textContent =
          "You do not own a business yet. Add one to start offering services.";
        createBusinessLink.hidden = false;
        return;
      }

      businessSelect.add(new Option("Choose a business", ""));

      businesses.forEach(business => {
        const name = business.name || "Unnamed business";
        const label = business.location
          ? `${name} — ${business.location}`
          : name;

        businessSelect.add(new Option(label, String(business.id)));
      });

      businessSelect.disabled = false;
      businessDetails.textContent =
        "Select the business whose services you want to view.";

      // A single business can be selected automatically.
      // Multiple businesses require an explicit choice.
      if (businesses.length === 1) {
        businessSelect.value = String(businesses[0].id);
        await loadServices();
      }
    } catch (error) {
      businessSelect.replaceChildren(
        new Option("Could not load businesses", "")
      );

      showMessage(error.message);
    }
  }

  async function loadServices() {
    const version = ++requestVersion;
    const business = selectedBusiness();

    servicesGrid.replaceChildren();
    serviceCount.textContent = "";
    showMessage("");

    if (!business) {
      servicesSection.hidden = true;
      businessDetails.textContent =
        "Select the business whose services you want to view.";
      return;
    }

    servicesSection.hidden = false;
    servicesHeading.textContent = business.name || "Business services";
    businessDetails.textContent = [
      business.type,
      business.location
    ].filter(Boolean).join(" · ");

    serviceCount.textContent = "Loading services...";
    servicesGrid.setAttribute("aria-busy", "true");

    try {
      const services = await fetchJson(
        `/services/business/${encodeURIComponent(business.id)}`
      );

      if (version !== requestVersion) return;

      renderServices(services);

      serviceCount.textContent =
        `${services.length} service${services.length === 1 ? "" : "s"}`;
    } catch (error) {
      if (version !== requestVersion) return;

      serviceCount.textContent = "Services could not be loaded.";
      showMessage(error.message);
    } finally {
      if (version === requestVersion) {
        servicesGrid.setAttribute("aria-busy", "false");
      }
    }
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
  }

  function formatPrice(value) {
    if (value === null || value === undefined || value === "") {
      return "Price not set";
    }

    const price = Number(value);

    return Number.isFinite(price)
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD"
        }).format(price)
      : "Price not set";
  }

  function renderServices(services) {
    servicesGrid.replaceChildren();

    if (!services.length) {
      const empty = makeElement("div", "empty-state");

      empty.append(
        makeElement("h3", "", "No services yet"),
        makeElement(
          "p",
          "",
          "Use Add service to create the first service for this business."
        )
      );

      servicesGrid.append(empty);
      return;
    }

    const fragment = document.createDocumentFragment();

    services.forEach(service => {
      const active = service.active !== false;
      const card = makeElement("article", "item-card");

      const status = makeElement(
        "span",
        `badge ${active ? "badge-confirmed" : "badge-cancelled"}`,
        active ? "Active" : "Inactive"
      );

      const header = makeElement("div", "item-card-top");
      header.append(status);

      const details = makeElement("div", "item-meta");
      details.append(
        makeElement(
          "span",
          "",
          `Duration: ${service.durationMinutes ?? "Not set"} minutes`
        ),
        makeElement("span", "", formatPrice(service.price))
      );

      card.append(
        header,
        makeElement("h3", "", service.name || "Unnamed service"),
        makeElement(
          "p",
          "item-desc",
          service.description || "No description available."
        ),
        details
      );

      fragment.append(card);
    });

    servicesGrid.append(fragment);
  }
})();