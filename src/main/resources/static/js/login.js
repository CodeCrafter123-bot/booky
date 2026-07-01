const API_URL = "http://localhost:8080/users/login";
const form = document.getElementById("loginForm");
const message = document.getElementById("message");
const button = document.getElementById("loginBtn");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  togglePassword.textContent = isPassword ? "Hide" : "Show";
});

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `message ${type}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = passwordInput.value;

  if (!email || !password) return showMessage("Email and password are required.");

  button.disabled = true;
  button.textContent = "Logging in...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.token || !data.user) {
      throw new Error("Invalid email or password.");
    }

    localStorage.setItem("booky_token", data.token);
    localStorage.setItem("booky_user", JSON.stringify(data.user));
    location.href = "dashboard.html";
  } catch (error) {
    showMessage(error.message || "Invalid email or password.");
  } finally {
    button.disabled = false;
    button.textContent = "Login";
  }
});
