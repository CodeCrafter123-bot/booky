const API_BASE_URL = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    const loginForm = document.getElementById("loginForm");

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener("click", () => {
            const isHidden = passwordInput.type === "password";
            passwordInput.type = isHidden ? "text" : "password";
            toggleBtn.textContent = isHidden ? "Hide" : "Show";
        });
    }

    if (loginForm) {
        loginForm.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                loginUser();
            }
        });
    }

    const savedEmail = localStorage.getItem("booky_remember_email");
    const rememberMe = document.getElementById("rememberMe");

    if (savedEmail && rememberMe) {
        document.getElementById("email").value = savedEmail;
        rememberMe.checked = true;
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
    const btn = document.getElementById("loginBtn");

    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Logging in..." : "Log in";
}

function validateLoginForm({ email, password }) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return "Please enter a valid email address.";
    }

    if (!password) {
        return "Please enter your password.";
    }

    return null;
}

async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe")?.checked;

    const validationError = validateLoginForm({
        email,
        password
    });

    if (validationError) {
        showMessage(validationError, "error");
        return;
    }

    setLoading(true);
    showMessage("", null);

    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email.trim(),
                password: password
            })
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data) {
            throw new Error("Invalid email or password.");
        }

        localStorage.setItem("booky_user", JSON.stringify(data));

        if (rememberMe) {
            localStorage.setItem("booky_remember_email", email.trim());
        } else {
            localStorage.removeItem("booky_remember_email");
        }

        showMessage("Login successful! Redirecting...", "success");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } catch (error) {
        showMessage(error.message || "Something went wrong. Please try again.", "error");
    } finally {
        setLoading(false);
    }
}