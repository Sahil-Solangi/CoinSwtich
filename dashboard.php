<?php
session_start();
if (empty($_SESSION["user_id"])) {
    header("Location: login.html");
    exit;
}
$displayName = isset($_SESSION["username"]) ? trim((string) $_SESSION["username"]) : "User";
if ($displayName === "") {
    $displayName = "User";
}
$displayName = htmlspecialchars($displayName, ENT_QUOTES, "UTF-8");
?>
<!doctype html>
<html lang="en">
  <head>
    <script src="assets/js/script.js" defer></script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CoinSwtich</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="assets/css/style.css" />
  </head>
  <body>
    <div class="ticker-wrap">
      <div class="ticker-track" id="tickerTrack"></div>
    </div>

    <header>
      <div class="logo-wrap">
        <a href=""><img src="assets/images/CoinSwtich.png" alt="" /></a>
        <span class="welcome-text">Welcome, <?php echo $displayName; ?>!</span>
      </div>
      <div class="bell-btn">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="18"
          height="18"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
    </header>

    <main>
      <section class="market-overview">
        <h1 class="section-title">Market <span>Overview</span></h1>
        <div class="market-cards"></div>
      </section>

      <section class="quick-actions">
        <h2 class="section-title">Quick Actions</h2>
        <div class="qa-grid">
          <div class="qa-card">
            <a href="recharge.html"
              ><img
                src="assets/images/recharge.png"
                alt="Recharge"
                style="
                  width: 52px;
                  height: 52px;
                  border-radius: 50%;
                  object-fit: cover;
                "
            /></a>

            <span class="qa-label">Recharge</span>
          </div>
          <div class="qa-card">
            <a href="withdraw.html">
              <img
                src="assets/images/withdraw.png"
                alt="Withdraw"
                style="
                  width: 52px;
                  height: 52px;
                  border-radius: 50%;
                  object-fit: cover;
                "
              />
            </a>

            <span class="qa-label">Withdraw</span>
          </div>
          <div class="qa-card">
            <img
              src="assets/images/convert.jpg"
              alt="Convert"
              style="
                width: 52px;
                height: 52px;
                border-radius: 50%;
                object-fit: cover;
              "
            />
            <span class="qa-label">Convert</span>
          </div>
        </div>
      </section>

      <section class="trading-hall">
        <div class="trading-hall-header">
          <h2 class="section-title" style="margin-bottom: 0">Trading Hall</h2>
          <div class="live-badge"><span class="live-dot"></span> Live</div>
        </div>

        <table class="trade-table">
          <thead>
            <tr>
              <th>Name/Turnover</th>
              <th style="text-align: center">Last price</th>
              <th style="text-align: right">Change</th>
            </tr>
          </thead>
          <tbody id="tradeBody"></tbody>
        </table>
      </section>
    </main>

    <nav class="bottom-nav">
      <div class="nav-item active" id="nav-home">
        <div class="nav-icon-wrap">
          <a href="dashboard.php">
            <svg
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"
              />
              <path d="M9 21V12h6v9" fill="#0b5ed7" />
            </svg>
          </a>
        </div>
      </div>
      <div class="nav-item" id="nav-chart">
        <div class="nav-icon-wrap">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6a7d9a"
            stroke-width="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </div>
      </div>
      <div class="nav-item" id="nav-doc">
        <div class="nav-icon-wrap">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6a7d9a"
            stroke-width="2"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        </div>
      </div>
      <div class="nav-item" id="nav-profile">
        <div class="nav-icon-wrap">
          <a href="logout.php"
            ><svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6a7d9a"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" /></svg
          ></a>
        </div>
      </div>
    </nav>
  </body>
</html>
