const params = new URLSearchParams(window.location.search);
const err = params.get("error");
const messages = {
  missing: "Please fill in all withdrawal details.",
  amount: "Enter a valid withdrawal amount greater than zero.",
  server: "Something went wrong. Please try again.",
};
if (err && messages[err]) {
  alert(messages[err]);
  window.history.replaceState({}, "", "withdraw.html");
}
