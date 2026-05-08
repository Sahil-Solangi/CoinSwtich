const params = new URLSearchParams(window.location.search);
const alertEl = document.getElementById("form-alert");

function showFormAlert(message, isSuccess = false) {
  if (!alertEl) return;
  alertEl.classList.toggle("form-alert--success", isSuccess);
  alertEl.textContent = message;
  alertEl.hidden = false;
}

const errorMessages = {
  invalid: "Please fill in both username and password.",
  credentials: "Invalid username/email or password.",
  server: "Unable to login right now. Please try again.",
};

const errKey = params.get("error");
if (errKey && errorMessages[errKey]) {
  showFormAlert(errorMessages[errKey]);
  window.history.replaceState({}, "", "login.html");
}

if (params.get("registered") === "1") {
  showFormAlert("Registration successful. Login now to open your dashboard.", true);
  window.history.replaceState({}, "", "login.html");
}

// Toggle password visibility
const pwInput = document.getElementById("password");
const togglePw = document.getElementById("toggle-pw");
const eyeIcon = document.getElementById("eye-icon");

const eyeOpen = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const eyeClosed = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

togglePw.addEventListener("click", () => {
  const isHidden = pwInput.type === "password";
  pwInput.type = isHidden ? "text" : "password";
  eyeIcon.innerHTML = isHidden ? eyeClosed : eyeOpen;
});

document.getElementById("login-form").addEventListener("submit", (e) => {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value;
  if (alertEl) alertEl.hidden = true;
  if (!user || !pass) {
    e.preventDefault();
    showFormAlert(errorMessages.invalid);
    return;
  }
});
