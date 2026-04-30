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

// Login button click (placeholder)
document.getElementById("btn-login").addEventListener("click", () => {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value;
  if (!user || !pass) {
    alert("Please fill in both fields.");
    return;
  }
  // Navigate to home page after login
  window.location.href = "index.html";
});
