<?php
ob_start();
mysqli_report(MYSQLI_REPORT_OFF);

function app_redirect_url($relativePath)
{
    $script = $_SERVER["SCRIPT_NAME"] ?? "/withdraw.php";
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

function safe_redirect($url, $statusCode = 302)
{
    if (ob_get_length()) {
        ob_end_clean();
    }
    header("Location: " . $url, true, $statusCode);
    exit;
}

function is_ajax_request()
{
    $xrw = $_SERVER["HTTP_X_REQUESTED_WITH"] ?? "";
    return strtolower(trim($xrw)) === "xmlhttprequest";
}

function send_withdraw_error($isAjax, $errorKey)
{
    if ($isAjax) {
        if (ob_get_length()) {
            ob_end_clean();
        }
        http_response_code(400);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode(["ok" => false, "error" => $errorKey]);
        exit;
    }
    safe_redirect(app_redirect_url("withdraw.html?error=" . $errorKey));
}

function send_withdraw_success($isAjax, $relativePath)
{
    if ($isAjax) {
        if (ob_get_length()) {
            ob_end_clean();
        }
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode(["ok" => true, "redirect" => $relativePath]);
        exit;
    }
    safe_redirect(app_redirect_url($relativePath));
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    safe_redirect(app_redirect_url("withdraw.html"));
}

$isAjax = is_ajax_request();

$currency = isset($_POST["currency"]) ? trim($_POST["currency"]) : "INR";
$channel = isset($_POST["channel"]) ? trim($_POST["channel"]) : "Bank Card";
$bank_name = isset($_POST["bank_name"]) ? trim($_POST["bank_name"]) : "";
$account_name = isset($_POST["account_name"]) ? trim($_POST["account_name"]) : "";
$account_number = isset($_POST["account_number"]) ? trim($_POST["account_number"]) : "";
$ifsc = isset($_POST["ifsc"]) ? trim($_POST["ifsc"]) : "";
$amount_raw = isset($_POST["amount"]) ? trim($_POST["amount"]) : "";

if (
    $bank_name === "" ||
    $account_name === "" ||
    $account_number === "" ||
    $ifsc === "" ||
    $amount_raw === ""
) {
    send_withdraw_error($isAjax, "missing");
}

if (!is_numeric($amount_raw)) {
    send_withdraw_error($isAjax, "amount");
}

$amount = (float) $amount_raw;
if ($amount <= 0) {
    send_withdraw_error($isAjax, "amount");
}

if ($currency === "") {
    $currency = "INR";
}
if ($channel === "") {
    $channel = "Bank Card";
}

$conn = new mysqli("localhost", "root", "", "myapp");
if ($conn->connect_error) {
    send_withdraw_error($isAjax, "server");
}
$conn->set_charset("utf8mb4");

$conn->query(
    "CREATE TABLE IF NOT EXISTS withdrawals (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        currency VARCHAR(32) NOT NULL,
        channel VARCHAR(64) NOT NULL,
        bank_name VARCHAR(255) NOT NULL,
        account_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(64) NOT NULL,
        ifsc VARCHAR(32) NOT NULL,
        amount DECIMAL(14,2) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
);

$stmt = $conn->prepare(
    "INSERT INTO withdrawals (currency, channel, bank_name, account_name, account_number, ifsc, amount) VALUES (?, ?, ?, ?, ?, ?, ?)"
);
if (!$stmt) {
    $conn->close();
    safe_redirect(app_redirect_url("withdraw.html?error=server"));
}

$stmt->bind_param(
    "ssssssd",
    $currency,
    $channel,
    $bank_name,
    $account_name,
    $account_number,
    $ifsc,
    $amount
);

$ok = $stmt->execute();
$stmt->close();
$conn->close();

if ($ok) {
    $pendingQs = http_build_query(
        [
            "amount" => $amount,
            "currency" => $currency,
        ],
        "",
        "&",
        PHP_QUERY_RFC3986
    );
    // 303: browser should GET the pending page after POST (avoids staying on withdraw.php).
    safe_redirect(app_redirect_url("withdraw-pending.html?" . $pendingQs), 303);
}

safe_redirect(app_redirect_url("withdraw.html?error=server"));
