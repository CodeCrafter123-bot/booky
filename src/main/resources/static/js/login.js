const API_URL = "http://localhost:8080/users/login";

const form = document.getElementById("loginForm");
const alertBox = document.getElementById("formAlert");
const button = document.getElementById("submitBtn");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

document.querySelectorAll(".password-toggle").forEach((toggleButton) => {
  toggleButton.addEventListener("click", () => {
    const targetId = toggleButton.dataset.target;
    const input = document.getElementById(targetId);

    if (!input) return;

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    toggleButton.textContent = isPassword ? "HIDE" : "SHOW";
  });
});

form?.addEventListener("submit", login);

function showMessage(text, type = "error") {
  if (!alertBox) return;

  alertBox.textContent = text;
  alertBox.className = type === "success"
    ? "alert alert-success show"
    : "alert alert-error show";

  if (!text) {
    alertBox.className = "alert alert-error";
  }
}

function setFieldError(input, errorElement, message) {
  if (!input || !errorElement) return;

  input.classList.toggle("field-error", Boolean(message));
  errorElement.textContent = message;
  errorElement.classList.toggle("show", Boolean(message));
}

function validateForm(email, password) {
  let isValid = true;

  setFieldError(emailInput, emailError, "");
  setFieldError(passwordInput, passwordError, "");
  showMessage("");

  if (!email) {
    setFieldError(emailInput, emailError, "Email is required.");
    isValid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    setFieldError(emailInput, emailError, "Enter a valid email address.");
    isValid = false;
  }

  if (!password) {
    setFieldError(passwordInput, passwordError, "Password is required.");
    isValid = false;
  }

  return isValid;
}

function setLoading(isLoading) {
  if (!button) return;

  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);

  const label = button.querySelector(".btn-label");
  if (label) label.textContent = isLoading ? "Logging in..." : "Log in";
}

async function login(event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!validateForm(email, password)) return;

  setLoading(true);

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
    setLoading(false);
  }
}