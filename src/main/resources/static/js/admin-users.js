const API_URL = "http://127.0.0.1:8080";

const token = localStorage.getItem("booky_token");
const currentUser = JSON.parse(
  localStorage.getItem("booky_user") || "null"
);

const logoutBtn = document.getElementById("logoutBtn");
const message = document.getElementById("message");
const usersTableBody = document.getElementById("usersTableBody");
const searchInput = document.getElementById("searchInput");
const userCount = document.getElementById("userCount");

const freezeModal = document.getElementById("freezeModal");
const freezeModalBackdrop = document.getElementById(
  "freezeModalBackdrop"
);
const closeFreezeModalBtn = document.getElementById(
  "closeFreezeModalBtn"
);
const cancelFreezeBtn = document.getElementById("cancelFreezeBtn");
const confirmFreezeBtn = document.getElementById(
  "confirmFreezeBtn"
);
const freezeReasonInput = document.getElementById("freezeReason");
const freezeUserText = document.getElementById("freezeUserText");

let users = [];
let selectedFreezeUserId = null;

if (!token || !currentUser) {
  location.href = "login.html";
}

if (currentUser?.role !== "ADMIN") {
  alert("Access denied. Admins only.");
  location.href = "dashboard.html";
}

logoutBtn?.addEventListener("click", logout);
searchInput?.addEventListener("input", filterUsers);

closeFreezeModalBtn?.addEventListener(
  "click",
  closeFreezeModal
);

cancelFreezeBtn?.addEventListener(
  "click",
  closeFreezeModal
);

freezeModalBackdrop?.addEventListener(
  "click",
  closeFreezeModal
);

confirmFreezeBtn?.addEventListener(
  "click",
  confirmFreezeUser
);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeFreezeModal();
  }
});

loadUsers();

function logout() {
  localStorage.removeItem("booky_token");
  localStorage.removeItem("booky_user");
  localStorage.removeItem("selected_business_id");
  localStorage.removeItem("selected_service_id");
  localStorage.removeItem("selected_admin_user_id");

  location.href = "login.html";
}

function showMessage(text, type = "error") {
  if (!message) return;

  message.textContent = text;
  message.className = text
    ? `message ${type}`
    : "message";
}

async function authenticatedFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    const data = await response
      .clone()
      .json()
      .catch(() => null);

    if (data?.code === "ACCOUNT_FROZEN") {
      localStorage.removeItem("booky_token");
      localStorage.removeItem("booky_user");

      alert(
        `${data.message || "Your account has been frozen."}\n` +
        `Reason: ${data.reason || "Contact the administrator."}`
      );

      location.href = "login.html";

      throw new Error("Account frozen");
    }
  }

  return response;
}

async function loadUsers() {
  showMessage("");

  usersTableBody.innerHTML = `
    <tr>
      <td colspan="8">Loading users...</td>
    </tr>
  `;

  try {
    const response = await authenticatedFetch(
      `${API_URL}/admin/users`
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.error ||
        "Failed to load users."
      );
    }

    users = Array.isArray(data) ? data : [];
    filterUsers();
  } catch (error) {
    if (error.message === "Account frozen") return;

    usersTableBody.innerHTML = `
      <tr>
        <td colspan="8">Could not load users.</td>
      </tr>
    `;

    showMessage(
      error.message || "Something went wrong."
    );
  }
}

function renderUsers(list) {
  userCount.textContent =
    `${list.length} user${list.length === 1 ? "" : "s"} found`;

  if (!list.length) {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="8">No users found.</td>
      </tr>
    `;
    return;
  }

  usersTableBody.innerHTML = list
    .map(user => {
      const isFrozen = Boolean(user.frozen);
      const isAdmin = user.role === "ADMIN";
      const isCurrentAdmin =
        Number(user.id) === Number(currentUser.id);

      const statusText = isFrozen
        ? "Frozen"
        : "Active";

      const statusClass = isFrozen
        ? "status-frozen"
        : "status-active";

      let accountAction = "";

      if (isAdmin || isCurrentAdmin) {
        accountAction = `
          <button
            class="btn btn-ghost btn-sm"
            type="button"
            disabled
            title="Administrator accounts cannot be frozen"
          >
            Protected
          </button>
        `;
      } else if (isFrozen) {
        accountAction = `
          <button
            class="btn btn-success btn-sm"
            type="button"
            onclick="unfreezeUser(${user.id})"
          >
            Unfreeze
          </button>
        `;
      } else {
        accountAction = `
          <button
            class="btn btn-danger btn-sm"
            type="button"
            onclick="openFreezeModal(${user.id})"
          >
            Freeze
          </button>
        `;
      }

      return `
        <tr class="${isFrozen ? "frozen-user-row" : ""}">
          <td>#${user.id}</td>

          <td>
            ${escapeHtml(user.fullName || "-")}
          </td>

          <td>
            ${escapeHtml(user.email || "-")}
          </td>

          <td>
            ${escapeHtml(user.phone || "-")}
          </td>

          <td>
            <span
              class="role-pill role-${escapeHtml(
                (user.role || "").toLowerCase()
              )}"
            >
              ${escapeHtml(user.role || "-")}
            </span>
          </td>

          <td>
            <span class="account-status ${statusClass}">
              ${statusText}
            </span>
          </td>

          <td class="freeze-reason-cell">
            ${
              isFrozen
                ? escapeHtml(
                    user.freezeReason ||
                    "No reason provided"
                  )
                : "-"
            }
          </td>

          <td>
            <div class="admin-user-actions">
              <button
                class="btn btn-primary btn-sm"
                type="button"
                onclick="editUser(${user.id})"
              >
                Edit
              </button>

              ${accountAction}
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function filterUsers() {
  const keyword =
    searchInput?.value.toLowerCase().trim() || "";

  const filtered = users.filter(user => {
    const status = user.frozen
      ? "frozen"
      : "active";

    return (
      String(user.id).includes(keyword) ||
      (user.fullName || "")
        .toLowerCase()
        .includes(keyword) ||
      (user.email || "")
        .toLowerCase()
        .includes(keyword) ||
      (user.phone || "")
        .toLowerCase()
        .includes(keyword) ||
      (user.role || "")
        .toLowerCase()
        .includes(keyword) ||
      status.includes(keyword) ||
      (user.freezeReason || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  renderUsers(filtered);
}

function editUser(id) {
  localStorage.setItem(
    "selected_admin_user_id",
    String(id)
  );

  location.href = "admin-edit-user.html";
}

function openFreezeModal(userId) {
  const selectedUser = users.find(
    user => Number(user.id) === Number(userId)
  );

  if (!selectedUser) {
    showMessage("User could not be found.");
    return;
  }

  if (selectedUser.role === "ADMIN") {
    showMessage(
      "Administrator accounts cannot be frozen."
    );
    return;
  }

  selectedFreezeUserId = userId;

  freezeUserText.textContent =
    `You are about to freeze ${selectedUser.fullName || selectedUser.email}.`;

  freezeReasonInput.value = "";

  freezeModal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  setTimeout(() => {
    freezeReasonInput.focus();
  }, 50);
}

function closeFreezeModal() {
  selectedFreezeUserId = null;

  if (freezeReasonInput) {
    freezeReasonInput.value = "";
  }

  freezeModal?.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

async function confirmFreezeUser() {
  const reason = freezeReasonInput.value.trim();

  if (!selectedFreezeUserId) {
    showMessage("No user was selected.");
    closeFreezeModal();
    return;
  }

  if (!reason) {
    alert("Please enter a reason for freezing this account.");
    freezeReasonInput.focus();
    return;
  }

  if (reason.length > 500) {
    alert("The freeze reason cannot exceed 500 characters.");
    return;
  }

  confirmFreezeBtn.disabled = true;
  confirmFreezeBtn.textContent = "Freezing...";

  try {
    const response = await authenticatedFetch(
      `${API_URL}/users/${selectedFreezeUserId}/freeze`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reason
        })
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.error ||
        "Failed to freeze account."
      );
    }

    closeFreezeModal();

    showMessage(
      data?.message || "Account frozen successfully.",
      "success"
    );

    await loadUsers();
  } catch (error) {
    if (error.message === "Account frozen") return;

    showMessage(
      error.message || "Could not freeze account."
    );
  } finally {
    confirmFreezeBtn.disabled = false;
    confirmFreezeBtn.textContent = "Freeze Account";
  }
}

async function unfreezeUser(userId) {
  const selectedUser = users.find(
    user => Number(user.id) === Number(userId)
  );

  if (!selectedUser) {
    showMessage("User could not be found.");
    return;
  }

  const confirmed = confirm(
    `Unfreeze the account of ${
      selectedUser.fullName || selectedUser.email
    }?`
  );

  if (!confirmed) return;

  showMessage("");

  try {
    const response = await authenticatedFetch(
      `${API_URL}/users/${userId}/unfreeze`,
      {
        method: "PUT"
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.error ||
        "Failed to unfreeze account."
      );
    }

    showMessage(
      data?.message || "Account unfrozen successfully.",
      "success"
    );

    await loadUsers();
  } catch (error) {
    if (error.message === "Account frozen") return;

    showMessage(
      error.message || "Could not unfreeze account."
    );
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}