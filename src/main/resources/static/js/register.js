const API_BASE_URL = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    const registerForm = document.getElementById("registerForm");

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener("click", () => {
            const isHidden = passwordInput.type === "password";
            passwordInput.type = isHidden ? "text" : "password";
            toggleBtn.textContent = isHidden ? "Hide" : "Show";
        });
    }

    if (registerForm) {
        registerForm.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                registerUser();
            }
        });
    }
});

function showMessage(text, type) {
    const messageEl = document.getElementById("message");

    messageEl.textContent = text;
    messageEl.classList.remove("is-error", "is-success");

    if (type) {
        messageEl.classList.add(type === "success" ? "is-success" : "is-error");
    }
}

function setLoading(isLoading) {
    const btn = document.getElementById("registerBtn");

    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Creating account..." : "Create account";
}

function validateRegisterForm({ fullName, email, password, phone }) {
    if (!fullName || fullName.trim().length < 2) {
        return "Please enter your full name.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return "Please enter a valid email address.";
    }

    if (!password || password.length < 6) {
        return "Password must be at least 6 characters.";
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

    const validationError = validateRegisterForm({
        fullName,
        email,
        password,
        phone
    });

    if (validationError) {
        showMessage(validationError, "error");
        return;
    }

    setLoading(true);
    showMessage("", null);

    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName: fullName.trim(),
                email: email.trim(),
                password: password,
                phone: phone.trim(),
                role: role
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || "Registration failed. Please try again.");
        }

        showMessage("Account created successfully! Redirecting to login...", "success");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

    } catch (error) {
        showMessage(error.message || "Something went wrong. Please try again.", "error");
    } finally {
        setLoading(false);
    }
}