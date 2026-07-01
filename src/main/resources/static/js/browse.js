const API_URL = "http://localhost:8080/businesses";
const token = localStorage.getItem("booky_token");
const grid = document.getElementById("businessGrid");
const message = document.getElementById("message");
const searchInput = document.getElementById("searchInput");
let businesses = [];

if (!token) location.href = "login.html";

function getAuthHeaders() {
  return { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("booky_token") };
}

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function render(items) {
  if (!items.length) {
    grid.innerHTML = `<div class="empty">No businesses found.</div>`;
    return;
  }
  grid.innerHTML = items.map(b => `
    <article class="item-card">
      <span class="badge">${b.type || "Business"}</span>
      <h3>${b.name || b.businessName || "Unnamed Business"}</h3>
      <p><strong>Location:</strong> ${b.location || "Not specified"}</p>
      <p>${b.description || "No description available."}</p>
      <button class="btn btn-primary" onclick="viewServices(${b.id})">View Services</button>
    </article>
  `).join("");
}

function viewServices(id) {
  localStorage.setItem("selected_business_id", id);
  location.href = "services.html";
}

async function loadBusinesses() {
  showMessage("Loading businesses...", "success");
  try {
    const response = await fetch(API_URL, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Could not load businesses.");
    businesses = await response.json();
    showMessage("");
    render(businesses);
  } catch (error) {
    showMessage(error.message || "Could not load businesses.");
    grid.innerHTML = "";
  }
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  render(businesses.filter(b => `${b.name || b.businessName || ""} ${b.type || ""} ${b.location || ""}`.toLowerCase().includes(q)));
});
document.getElementById("refreshBtn").addEventListener("click", loadBusinesses);
loadBusinesses();
