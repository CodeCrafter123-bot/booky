// Booky — Register page logic

const API_BASE_URL = "http://localhost:8080/api"; // adjust to your backend's actual base URL

document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    toggleBtn.addEventListener("click", () => {
        const isHidden = passwordInput.type === "password";
        passwordInput.type = isHidden ? "text" : "password";
        toggleBtn.textContent = isHidden ? "Hide" : "Show";
        toggleBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });

    // Allow submitting with Enter from any field
    document.getElementById("registerForm").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            registerUser();
        }
    });
});

function showMessage(text, type) {
    const messageEl = document.getElementById("message");
    messageEl.textContent = text;
    messageEl.classList.remove("is-error", "is-success");
    messageEl.classList.add(type === "success" ? "is-success" : "is-error");
}

function setLoading(isLoading) {
    const btn = document.getElementById("registerBtn");
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Creating account..." : "Create account";
}

function validateForm({ fullName, email, password, phone }) {
    if (!fullName || fullName.trim().length < 2) {
        return "Please enter your full name.";
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return "Please enter a valid email address.";
    }
    if (!password || password.length < 8) {
        return "Password must be at least 8 characters.";
    }
    if (!phone || phone.trim().length < 6) {
        return "Please enter a valid phone number.";
    }
    return null;
}

async function registerUser() {
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value;
    const role = document.getElementById("role").value;

    const validationError = validateForm({ fullName, email, password, phone });
    if (validationError) {
        showMessage(validationError, "error");
        return;
    }

    setLoading(true);
    showMessage("", "success");

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName: fullName.trim(),
                email: email.trim(),
                password,
                phone: phone.trim(),
                role
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || "Registration failed. Please try again.");
        }

        showMessage("Account created! Redirecting to login...", "success");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

    } catch (err) {
        showMessage(err.message || "Something went wrong. Please try again.", "error");
    } finally {
        setLoading(false);
    }
}