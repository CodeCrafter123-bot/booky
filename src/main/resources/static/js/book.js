(() => {
  const token = localStorage.getItem("booky_token");
  const serviceId = Number(
    localStorage.getItem("selected_service_id")
  );

  if (!token) {
    location.replace("login.html");
    return;
  }

  const form = document.getElementById("bookingForm");
  const message = document.getElementById("message");
  const appointmentDateInput =
    document.getElementById("appointmentDate");
  const loadSlotsBtn = document.getElementById("loadSlotsBtn");
  const slotsContainer = document.getElementById("slotsContainer");
  const submitBtn = form.querySelector('[type="submit"]');

  let selectedSlot = null;
  let loadedDate = null;
  let requestVersion = 0;
  let isSubmitting = false;

  function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = text ? `message ${type}` : "message";
  }

  function setMinimumDate() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Beirut",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());

    const values = Object.fromEntries(
      parts.map(({ type, value }) => [type, value])
    );

    appointmentDateInput.min =
      `${values.year}-${values.month}-${values.day}`;
  }

  function clearSlots() {
    selectedSlot = null;
    loadedDate = null;
    slotsContainer.replaceChildren();

    if (submitBtn) {
      submitBtn.disabled = true;
    }
  }

  function validService() {
    return Number.isSafeInteger(serviceId) && serviceId > 0;
  }

  function redirectToLogin() {
    location.replace("login.html");
  }

  appointmentDateInput.addEventListener("change", () => {
    // Invalidate any request still loading for the previous date.
    requestVersion++;
    clearSlots();
    loadSlotsBtn.disabled = !validService();

    showMessage(
      "Load available times for the selected date. Times are in Lebanon time.",
      "success"
    );
  });

  loadSlotsBtn.addEventListener("click", loadAvailableSlots);
  form.addEventListener("submit", createBooking);

  async function loadAvailableSlots() {
    if (isSubmitting) return;

    const version = ++requestVersion;

    clearSlots();
    setMinimumDate();

    const date = appointmentDateInput.value;

    if (!validService()) {
      showMessage("Please go back and choose a service.");
      return;
    }

    if (!date) {
      showMessage("Please choose a date first.");
      return;
    }

    if (date < appointmentDateInput.min) {
      showMessage("Please choose today or a future date.");
      return;
    }

    loadSlotsBtn.disabled = true;
    showMessage("Loading available times...", "success");

    try {
      const params = new URLSearchParams({
        serviceId: String(serviceId),
        date
      });

      const response = await fetch(`/availability/slots?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Do not display results for a date the user has since changed.
      if (version !== requestVersion) return;

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const data = await response.json().catch(() => null);

      if (version !== requestVersion) return;

      if (!response.ok) {
        throw new Error(
          data?.message || "Could not load available times."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected availability response.");
      }

      if (data.length === 0) {
        showMessage("No available times for this date.");
        return;
      }

      loadedDate = date;
      renderSlots(data);

      showMessage(
        "Choose a time. All appointment times are Lebanon time.",
        "success"
      );
    } catch (error) {
      if (version === requestVersion) {
        clearSlots();
        showMessage(
          error.message || "Could not load available times."
        );
      }
    } finally {
      if (version === requestVersion) {
        loadSlotsBtn.disabled = false;
      }
    }
  }

  function renderSlots(slots) {
    slotsContainer.replaceChildren();

    slots.forEach((slot) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "slot-btn";
      button.textContent = slot;

      button.addEventListener("click", () => {
        if (isSubmitting) return;
        if (loadedDate !== appointmentDateInput.value) return;

        selectedSlot = slot;

        slotsContainer.querySelectorAll(".slot-btn").forEach((btn) => {
          btn.classList.remove("active");
        });

        button.classList.add("active");

        if (submitBtn) {
          submitBtn.disabled = false;
        }
      });

      slotsContainer.appendChild(button);
    });
  }

  function setSubmitting(value) {
    isSubmitting = value;
    appointmentDateInput.disabled = value;
    loadSlotsBtn.disabled = value || !validService();

    slotsContainer.querySelectorAll(".slot-btn").forEach((button) => {
      button.disabled = value;
    });

    if (submitBtn) {
      submitBtn.disabled = value || !selectedSlot;
    }
  }

  async function createBooking(event) {
    event.preventDefault();

    if (isSubmitting) return;

    setMinimumDate();

    const date = appointmentDateInput.value;

    if (!validService()) {
      showMessage("Please go back and choose a service.");
      return;
    }

    if (!date || date < appointmentDateInput.min) {
      showMessage("Please choose today or a future date.");
      return;
    }

    if (!selectedSlot || loadedDate !== date) {
      showMessage("Load and select an available time for this date.");
      return;
    }

    // Send the business's local time directly.
    // Do not convert this value with toISOString().
    const time = selectedSlot.length === 5
      ? `${selectedSlot}:00`
      : selectedSlot;

    const appointmentTime = `${date}T${time}`;

    setSubmitting(true);
    showMessage("Creating booking...", "success");

    try {
      const response = await fetch("/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentTime,
          serviceId
        })
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (response.status === 409) {
        clearSlots();

        throw new Error(
          "That time is no longer available. Load available times again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Could not create booking."
        );
      }

      showMessage("Booking created successfully!", "success");

      // Keep the form disabled until navigation completes.
      setTimeout(() => {
        location.href = "my-bookings.html";
      }, 1000);
    } catch (error) {
      setSubmitting(false);
      showMessage(error.message || "Could not create booking.");
    }
  }

  setMinimumDate();
  clearSlots();

  if (!validService()) {
    loadSlotsBtn.disabled = true;
    showMessage("No service selected. Please go back and choose a service.");
  }
})();