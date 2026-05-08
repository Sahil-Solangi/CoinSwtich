<?php
ob_start();

mysqli_report(MYSQLI_REPORT_OFF);

function app_redirect_url($relativePath)
{
    $script = $_SERVER["SCRIPT_NAME"] ?? "/signup.php";
    $dir = str_replace("\\", "/", dirname($script));
    $dir = rtrim($dir, "/");
    $path = ($dir === "" || $dir === ".") ? "/" . $relativePath : $dir . "/" . $relativePath;
    $path = preg_replace("#(?<!:)//+#", "/", $path);

    $https =
        (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off") ||
        (isset($_SERVER["SERVER_PORT"]) && (string) $_SERVER["SERVER_PORT"] === "443");
    $scheme = $https ? "https" : "http";
    $host = $_SERVER["HTTP_HOST"] ?? "localhost";

    return $scheme . "://" . $host . $path;
}

function safe_redirect($url)
{
    if (ob_get_length()) {
        ob_end_clean();
    }
    header("Location: " . $url);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    safe_redirect(app_redirect_url("Signup.html"));
}

$conn = new mysqli("localhost", "root", "", "myapp");

if ($conn->connect_error) {
    safe_redirect(app_redirect_url("Signup.html?error=server"));
}

$conn->set_charset("utf8mb4");

$username = isset($_POST["username"]) ? trim($_POST["username"]) : "";
$email = isset($_POST["email"]) ? trim($_POST["email"]) : "";
$password = isset($_POST["password"]) ? $_POST["password"] : "";
$country = isset($_POST["country"]) ? trim($_POST["country"]) : "";
$invite = isset($_POST["invite_code"]) ? trim($_POST["invite_code"]) : "";

if ($username === "" || $email === "" || $password === "" || $country === "") {
    $conn->close();
    safe_redirect(app_redirect_url("Signup.html?error=invalid"));
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $conn->close();
    safe_redirect(app_redirect_url("Signup.html?error=invalid_email"));
}

function redirectSignupError($conn, $code)
{
    if ($conn) {
        $conn->close();
    }
    safe_redirect(app_redirect_url("Signup.html?error=" . $code));
}

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
if (!$stmt) {
    redirectSignupError($conn, "server");
}
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    $stmt->close();
    redirectSignupError($conn, "email_exists");
}
$stmt->close();

$stmt = $conn->prepare(
    "INSERT INTO users (username, email, password, country, invite_code) VALUES (?, ?, ?, ?, ?)"
);
if (!$stmt) {
    redirectSignupError($conn, "server");
}
$stmt->bind_param("sssss", $username, $email, $password, $country, $invite);

$ok = $stmt->execute();
$stmt->close();
$conn->close();

if ($ok) {
    safe_redirect(app_redirect_url("register-success.html"));
}

safe_redirect(app_redirect_url("Signup.html?error=server"));
