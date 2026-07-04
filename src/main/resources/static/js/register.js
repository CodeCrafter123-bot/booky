const API_URL = "http://localhost:8080/users/register";

const form = document.getElementById("registerForm");
const alertBox = document.getElementById("formAlert");
const button = document.getElementById("submitBtn");

const passwordInput = document.getElementById("password");
const toggleButton = document.querySelector(".password-toggle");

toggleButton.addEventListener("click", () => {
    const target = document.getElementById(toggleButton.dataset.target);

    if (target.type === "password") {
        target.type = "text";
        toggleButton.textContent = "HIDE";
    } else {
        target.type = "password";
        toggleButton.textContent = "SHOW";
    }
});

function showMessage(text, type = "error") {
    alertBox.textContent = text;
    alertBox.style.display = text ? "block" : "none";

    if (type === "success") {
        alertBox.className = "alert alert-success";
    } else {
        alertBox.className = "alert alert-error";
    }
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value.trim();

    const role = document.querySelector('input[name="role"]:checked')?.value;

    if (!fullName || !email || !password || !phone || !role) {
        showMessage("Please fill in all fields.");
        return;
    }

    button.disabled = true;
    button.querySelector(".btn-label").textContent = "Creating account...";

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName,
                email,
                password,
                phone,
                role
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || "Registration failed.");
        }

        showMessage("Account created successfully! Redirecting...", "success");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (err) {
        showMessage(err.message || "Registration failed.");
    } finally {
        button.disabled = false;
        button.querySelector(".btn-label").textContent = "Create account";
    }
});