const API_URL = "http://localhost:8080/users/login";

const form = document.getElementById("loginForm");
const alertBox = document.getElementById("formAlert");
const button = document.getElementById("submitBtn");
const passwordInput = document.getElementById("password");
const toggleButton = document.querySelector(".password-toggle");

toggleButton.addEventListener("click", () => {
  const targetId = toggleButton.dataset.target;
  const input = document.getElementById(targetId);

  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
  toggleButton.textContent = isPassword ? "HIDE" : "SHOW";
});

function showMessage(text, type = "error") {
  alertBox.textContent = text;
  alertBox.style.display = text ? "block" : "none";
  alertBox.className = type === "success"
    ? "alert alert-success"
    : "alert alert-error";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    return showMessage("Email and password are required.");
  }

  button.disabled = true;
  button.querySelector(".btn-label").textContent = "Logging in...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.token || !data.user) {
      throw new Error(data.message || "Invalid email or password.");
    }

    localStorage.setItem("booky_token", data.token);
    localStorage.setItem("booky_user", JSON.stringify(data.user));

    window.location.href = "dashboard.html";

  } catch (error) {
    showMessage(error.message || "Login failed.");
  } finally {
    button.disabled = false;
    button.querySelector(".btn-label").textContent = "Log in";
  }
});