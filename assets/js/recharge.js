// Quick Select Functionality
const quickBtns = document.querySelectorAll(".quick-btn");
const inputField = document.querySelector(".input-wrapper input");

quickBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    quickBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const value = btn.innerText.replace("₹", "");
    inputField.value = value;
  });
});
