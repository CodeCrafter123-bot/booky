const API_URL = "http://localhost:8080/users/register";
const form = document.getElementById("registerForm");
const message = document.getElementById("message");
const button = document.getElementById("registerBtn");

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const phone = document.getElementById("phone").value.trim();
  const role = document.getElementById("role").value;

  if (!fullName) return showMessage("Full name is required.");
  if (!email || !isValidEmail(email)) return showMessage("Please enter a valid email.");
  if (!password || password.length < 6) return showMessage("Password must be at least 6 characters.");
  if (!phone) return showMessage("Phone is required.");
  if (!role) return showMessage("Please select a role.");

  button.disabled = true;
  button.textContent = "Creating account...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, phone, role })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || "Registration failed.");
    }

    showMessage("Account created successfully. Redirecting...", "success");
    setTimeout(() => location.href = "login.html", 900);
  } catch (error) {
    showMessage(error.message || "Something went wrong.");
  } finally {
    button.disabled = false;
    button.textContent = "Create Account";
  }
});
