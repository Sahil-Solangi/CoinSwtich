document.addEventListener("DOMContentLoaded", () => {
  const coinListContainer = document.getElementById("coinListContainer");
  const loadingState = document.getElementById("loadingState");
  const apiErrorMsg = document.getElementById("apiErrorMsg");
  const totalUsdtBalance = document.getElementById("totalUsdtBalance");
  const totalFiatBalance = document.getElementById("totalFiatBalance");

  // Icons
  const eyeIcon = document.getElementById("eyeIcon");
  const refreshIcon = document.getElementById("refreshIcon");

  // Tabs
  const tabs = document.querySelectorAll(".top-tabs .tab");
  const tabContents = document.querySelectorAll(".tab-content");

  // Hide Balances State
  let isHidden = false;

  // Real Database API Endpoint (Expects PHP backend to exist)
  const API_ENDPOINT = "api/get_spot_balance.php";

  // --- TAB LOGIC ---
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove("active"));
      // Add active to clicked tab
      tab.classList.add("active");

      // Hide all contents
      tabContents.forEach(content => {
        content.style.display = "none";
      });

      // Show target content
      const targetId = `tabContent-${tab.dataset.target}`;
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.style.display = "block";
      }
    });
  });

  // --- VISIBILITY TOGGLE LOGIC ---
  eyeIcon.addEventListener("click", () => {
    isHidden = !isHidden;
    if (isHidden) {
      document.body.classList.add("hide-balances");
      // Switch to eye-off icon
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      `;
    } else {
      document.body.classList.remove("hide-balances");
      // Switch back to eye icon
      eyeIcon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      `;
    }
  });

  // --- REFRESH LOGIC ---
  refreshIcon.addEventListener("click", () => {
    // Add spinning class
    refreshIcon.classList.add("spinning");
    
    // Hide list and show loading text again
    coinListContainer.style.display = "none";
    loadingState.style.display = "block";
    apiErrorMsg.style.display = "none";

    // Refetch data
    fetchSpotBalances().then(() => {
      // Remove spinning class after 1 second minimum for UX
      setTimeout(() => {
        refreshIcon.classList.remove("spinning");
      }, 500);
    });
  });

  // --- API FETCH LOGIC ---
  async function fetchSpotBalances() {
    try {
      const response = await fetch(API_ENDPOINT);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === "success" && data.balances) {
        renderBalances(data.balances, data.total_usdt, data.total_fiat);
      } else {
        throw new Error("Invalid API response format");
      }
      
    } catch (error) {
      console.error("Database connection failed:", error);
      loadingState.style.display = "none";
      apiErrorMsg.style.display = "block";
      
      // For design preview purposes while backend is disconnected
      previewEmptyState();
    }
  }

  function previewEmptyState() {
    totalUsdtBalance.textContent = "0";
    totalFiatBalance.textContent = "≈$0.00";
    
    // Expanded list of popular coins as requested
    const previewCoins = [
      { symbol: "USDT", pair: "USDT/USDT", available: "0.00", lockup: "0.00", freeze: "0.00", color: "#26a17b", fiat: "0.0" },
      { symbol: "BTC", pair: "BTC/USDT", available: "0.00000000", lockup: "0.00000000", freeze: "0.00000000", color: "#f7931a", fiat: "0.0" },
      { symbol: "ETH", pair: "ETH/USDT", available: "0.00000000", lockup: "0.00000000", freeze: "0.00000000", color: "#627eea", fiat: "0.0" },
      { symbol: "DOGE", pair: "DOGE/USDT", available: "0.00000000", lockup: "0.00000000", freeze: "0.00000000", color: "#f3ba2f", fiat: "0.0" },
      { symbol: "BNB", pair: "BNB/USDT", available: "0.00000000", lockup: "0.00000000", freeze: "0.00000000", color: "#f3ba2f", fiat: "0.0" },
      { symbol: "SOL", pair: "SOL/USDT", available: "0.00000000", lockup: "0.00000000", freeze: "0.00000000", color: "#14f195", fiat: "0.0" },
      { symbol: "ADA", pair: "ADA/USDT", available: "0.00000000", lockup: "0.00000000", freeze: "0.00000000", color: "#0033ad", fiat: "0.0" },
      { symbol: "XRP", pair: "XRP/USDT", available: "0.00000000", lockup: "0.00000000", freeze: "0.00000000", color: "#23292f", fiat: "0.0" },
      { symbol: "BCH", pair: "BCH/USDT", available: "0.00000000", lockup: "0.00000000", freeze: "0.00000000", color: "#8dc351", fiat: "0.0" }
    ];
    
    renderCoinsList(previewCoins);
  }

  function renderBalances(balances, totalUsdt, totalFiat) {
    loadingState.style.display = "none";
    apiErrorMsg.style.display = "none";
    
    totalUsdtBalance.textContent = parseFloat(totalUsdt).toString(); 
    totalFiatBalance.textContent = `≈$${totalFiat || '0.00'}`;
    
    const formattedBalances = balances.map(coin => ({
      symbol: coin.symbol,
      pair: `${coin.symbol}/USDT`,
      available: parseFloat(coin.available).toFixed(8).replace(/\.?0+$/, ''),
      lockup: parseFloat(coin.lockup || 0).toFixed(8).replace(/\.?0+$/, ''),
      freeze: parseFloat(coin.freeze || 0).toFixed(8).replace(/\.?0+$/, ''),
      color: coin.color || "#333",
      fiat: coin.fiat || "0.0"
    }));
    
    renderCoinsList(formattedBalances);
  }

  function renderCoinsList(coins) {
    coinListContainer.style.display = "flex";
    coinListContainer.innerHTML = "";
    
    coins.forEach(coin => {
      const total = (parseFloat(coin.available) + parseFloat(coin.lockup) + parseFloat(coin.freeze)).toString();
      
      const html = `
        <div class="coin-item">
          <div class="coin-header">
            <div class="coin-header-left">
              <div class="coin-icon" style="background: ${coin.color}">
                ${coin.symbol.charAt(0)}
              </div>
              <div class="coin-name">${coin.pair}</div>
            </div>
            <div class="coin-header-right">
              <div class="coin-total"><span class="val-text" data-val="${total}">${total}</span> <span style="font-size:12px; font-weight:normal;">USDT</span></div>
              <div class="coin-fiat val-text" data-val="≈$ ${coin.fiat}">≈$ ${coin.fiat}</div>
            </div>
          </div>
          
          <div class="coin-stats">
            <div class="stat-item">
              <div class="stat-label">Available</div>
              <div class="stat-value val-text" data-val="${coin.available}">${coin.available}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">LOCK-UP</div>
              <div class="stat-value val-text" data-val="${coin.lockup}">${coin.lockup}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Freeze</div>
              <div class="stat-value val-text" data-val="${coin.freeze}">${coin.freeze}</div>
            </div>
          </div>
        </div>
      `;
      coinListContainer.innerHTML += html;
    });
  }

  // Initial fetch
  fetchSpotBalances();
});
