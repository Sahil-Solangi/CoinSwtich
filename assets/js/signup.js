const eyeOpen = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const eyeClosed = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

function makeToggle(btnId, inputId, eyeId) {
  document.getElementById(btnId).addEventListener("click", () => {
    const inp = document.getElementById(inputId);
    const eye = document.getElementById(eyeId);
    const hidden = inp.type === "password";
    inp.type = hidden ? "text" : "password";
    eye.innerHTML = hidden ? eyeClosed : eyeOpen;
  });
}
makeToggle("toggle-pw1", "password", "eye1");
makeToggle("toggle-pw2", "confirm-password", "eye2");

// Register button
document.getElementById("btn-register").addEventListener("click", () => {
  const country = document.getElementById("country").value;
  const account = document.getElementById("reg-account").value.trim();
  const pw = document.getElementById("password").value;
  const cpw = document.getElementById("confirm-password").value;
  const invite = document.getElementById("invite-code").value.trim();

  if (!country) {
    alert("Please select your country region.");
    return;
  }
  if (!account) {
    alert("Please enter a register account name.");
    return;
  }
  if (!pw) {
    alert("Please enter a password.");
    return;
  }
  if (pw !== cpw) {
    alert("Passwords do not match.");
    return;
  }
  // Invitation code is optional – skip check if not required
  window.location.href = "login.html";
});
