const API_URL = "http://localhost:8080/users/register";

const form = document.getElementById("registerForm");
const alertBox = document.getElementById("formAlert");
const button = document.getElementById("submitBtn");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const phoneInput = document.getElementById("phone");

const fullNameError = document.getElementById("fullNameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const phoneError = document.getElementById("phoneError");
const roleError = document.getElementById("roleError");

document.querySelectorAll(".password-toggle").forEach((toggleButton) => {
  toggleButton.addEventListener("click", () => {
    const input = document.getElementById(toggleButton.dataset.target);

    if (!input) return;

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    toggleButton.textContent = isPassword ? "HIDE" : "SHOW";
  });
});

form?.addEventListener("submit", register);

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

function validateForm(data) {
  let isValid = true;

  setFieldError(fullNameInput, fullNameError, "");
  setFieldError(emailInput, emailError, "");
  setFieldError(passwordInput, passwordError, "");
  setFieldError(phoneInput, phoneError, "");

  if (roleError) {
    roleError.textContent = "";
    roleError.classList.remove("show");
  }

  showMessage("");

  if (!data.fullName) {
    setFieldError(fullNameInput, fullNameError, "Full name is required.");
    isValid = false;
  }

  if (!data.email) {
    setFieldError(emailInput, emailError, "Email is required.");
    isValid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    setFieldError(emailInput, emailError, "Enter a valid email address.");
    isValid = false;
  }

  if (!data.password) {
    setFieldError(passwordInput, passwordError, "Password is required.");
    isValid = false;
  } else if (data.password.length < 6) {
    setFieldError(passwordInput, passwordError, "Password must be at least 6 characters.");
    isValid = false;
  }

  if (!data.phone) {
    setFieldError(phoneInput, phoneError, "Phone number is required.");
    isValid = false;
  }

  if (!data.role) {
    if (roleError) {
      roleError.textContent = "Please select a role.";
      roleError.classList.add("show");
    }

    isValid = false;
  }

  return isValid;
}

function setLoading(isLoading) {
  if (!button) return;

  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);

  const label = button.querySelector(".btn-label");
  if (label) label.textContent = isLoading ? "Creating account..." : "Create account";
}

async function register(event) {
  event.preventDefault();

  const data = {
    fullName: fullNameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
    phone: phoneInput.value.trim(),
    role: document.querySelector('input[name="role"]:checked')?.value
  };

  if (!validateForm(data)) return;

  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(responseData.message || "Registration failed.");
    }

    showMessage("Account created successfully! Redirecting...", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  } catch (error) {
    showMessage(error.message || "Registration failed.");
  } finally {
    setLoading(false);
  }
}