/* ══════════════════════════════════════════════════════════════════ */
/* PERPETUAL FUTURES TRADING INTERFACE                                */
/* ══════════════════════════════════════════════════════════════════ */

// Configuration
const CONFIG = {
  API_KEY: "3c2c8d38-0771-4eb8-8a85-1b46e5fdcc29",
  LIVECOINWATCH_API: "https://api.livecoinwatch.com/coins/single",
  BINANCE_API: "https://api.binance.com/api/v3",
  UPDATE_INTERVAL: 3000, // 3 seconds
  TRADINGVIEW_SYMBOL_MAP: {
    BTCUSDT: "BINANCE:BTCUSDT",
    ETHUSDT: "BINANCE:ETHUSDT",
    BNBUSDT: "BINANCE:BNBUSDT",
    ADAUSDT: "BINANCE:ADAUSDT",
    XRPUSDT: "BINANCE:XRPUSDT",
  },
};

// Global State
let state = {
  symbol: "BTCUSDT",
  coin: "BTC",
  currentPrice: 0,
  priceChange24h: 0,
  orderType: "market",
  marginType: "cross",
  leverage: 1,
  quantity: 0,
  limitPrice: 0,
  orderDirection: "long", // 'long' or 'short'
  positions: [],
  orders: [],
  orderBook: { bids: [], asks: [] },
};

// ════════════════ INITIALIZATION ════════════════
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

async function initializeApp() {
  try {
    // Parse URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    state.symbol = urlParams.get("symbol") || "BTCUSDT";
    state.coin = state.symbol.replace("USDT", "");

    // Update header
    document.getElementById("coinSymbol").textContent = state.symbol;

    // Load saved positions and orders
    loadStoredData();

    // Initialize event listeners
    setupEventListeners();

    // Initialize TradingView chart
    initTradingViewChart();

    // Fetch initial data
    await updateLiveData();

    // Start live updates
    startLiveUpdates();
  } catch (error) {
    console.error("Error initializing app:", error);
    showNotification("Failed to initialize trading interface", "error");
  }
}

// ════════════════ TRADING VIEW CHART ════════════════
function initTradingViewChart() {
  const tvSymbol =
    CONFIG.TRADINGVIEW_SYMBOL_MAP[state.symbol] || `BINANCE:${state.symbol}`;

  new TradingView.widget({
    autosize: true,
    symbol: tvSymbol,
    interval: "1",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    toolbar_bg: "#1a1e27",
    enable_publishing: false,
    hide_side_toolbar: false,
    container_id: "tradingview-chart",
    studies: ["Volume@tv-basicstudies", "RSI@tv-basicstudies"],
  });
}

// ════════════════ FETCH LIVE DATA ════════════════
async function updateLiveData() {
  try {
    // Fetch price data from LiveCoinWatch
    const priceData = await fetchPriceData();

    if (priceData) {
      state.currentPrice = priceData.rate;
      state.priceChange24h = priceData.change;
      updatePriceDisplay();
    }

    // Fetch order book from Binance
    await fetchOrderBook();
  } catch (error) {
    console.error("Error updating live data:", error);
  }
}

async function fetchPriceData() {
  try {
    const response = await fetch(CONFIG.LIVECOINWATCH_API, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": CONFIG.API_KEY,
      },
      body: JSON.stringify({
        currency: "USD",
        code: state.coin,
        meta: true,
      }),
    });

    if (!response.ok) throw new Error("API request failed");
    return await response.json();
  } catch (error) {
    console.error("Error fetching price data:", error);
    return null;
  }
}

async function fetchOrderBook() {
  try {
    const response = await fetch(
      `${CONFIG.BINANCE_API}/depth?symbol=${state.symbol}&limit=10`,
    );

    if (!response.ok) throw new Error("API request failed");
    const data = await response.json();

    state.orderBook = {
      bids: data.bids.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
      })),
      asks: data.asks.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
      })),
    };

    updateOrderBookDisplay();
  } catch (error) {
    console.error("Error fetching order book:", error);
  }
}

// ════════════════ PRICE DISPLAY ════════════════
function updatePriceDisplay() {
  document.getElementById("livePrice").textContent = formatPrice(
    state.currentPrice,
  );

  const priceChangeEl = document.getElementById("priceChange24h");
  const isPositive = state.priceChange24h >= 0;

  priceChangeEl.textContent =
    (isPositive ? "+" : "") + state.priceChange24h.toFixed(2) + "%";
  priceChangeEl.setAttribute("data-positive", isPositive);

  // Update entry price in risk info
  document.getElementById("entryPrice").textContent = formatPrice(
    state.currentPrice,
  );

  // Update middle price in order book
  document.getElementById("middlePrice").textContent = formatPrice(
    state.currentPrice,
  );
}

// ════════════════ ORDER BOOK DISPLAY ════════════════
function updateOrderBookDisplay() {
  // Update asks (sell orders) - red
  const asksList = document.getElementById("asksList");
  asksList.innerHTML = state.orderBook.asks
    .reverse()
    .slice(0, 5)
    .map(
      (ask) => `
            <div class="ob-item ask">
                <span class="ob-item-price">${formatPrice(ask.price)}</span>
                <span class="ob-item-quantity">${ask.quantity.toFixed(8)}</span>
                <span class="ob-item-quantity">${(ask.price * ask.quantity).toFixed(2)}</span>
            </div>
        `,
    )
    .join("");

  // Update bids (buy orders) - green
  const bidsList = document.getElementById("bidsList");
  bidsList.innerHTML = state.orderBook.bids
    .slice(0, 5)
    .map(
      (bid) => `
            <div class="ob-item bid">
                <span class="ob-item-price">${formatPrice(bid.price)}</span>
                <span class="ob-item-quantity">${bid.quantity.toFixed(8)}</span>
                <span class="ob-item-quantity">${(bid.price * bid.quantity).toFixed(2)}</span>
            </div>
        `,
    )
    .join("");
}

// ════════════════ EVENT LISTENERS ════════════════
function setupEventListeners() {
  // Margin type buttons
  document.querySelectorAll(".margin-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".margin-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.marginType = btn.dataset.margin;
    });
  });

  // Leverage controls
  document.querySelector(".leverage-minus").addEventListener("click", () => {
    const input = document.getElementById("leverageInput");
    let value = parseInt(input.value) - 1;
    value = Math.max(1, value);
    updateLeverage(value);
  });

  document.querySelector(".leverage-plus").addEventListener("click", () => {
    const input = document.getElementById("leverageInput");
    let value = parseInt(input.value) + 1;
    value = Math.min(125, value);
    updateLeverage(value);
  });

  document.getElementById("leverageSlider").addEventListener("input", (e) => {
    updateLeverage(parseInt(e.target.value));
  });

  document.getElementById("leverageInput").addEventListener("change", (e) => {
    let value = parseInt(e.target.value) || 1;
    value = Math.max(1, Math.min(125, value));
    updateLeverage(value);
  });

  // Order direction (long/short)
  document.querySelectorAll(".order-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".order-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.orderDirection = btn.dataset.type;
    });
  });

  // Order type selector
  document.getElementById("orderType").addEventListener("change", (e) => {
    state.orderType = e.target.value;
    const priceGroup = document.getElementById("priceInputGroup");
    priceGroup.style.display = state.orderType === "market" ? "none" : "flex";
  });

  // Quantity input
  document.getElementById("quantityInput").addEventListener("input", (e) => {
    state.quantity = parseFloat(e.target.value) || 0;
    updateQuantityValue();
    updateRiskInfo();
  });

  // Limit price input
  document.getElementById("limitPrice").addEventListener("input", (e) => {
    state.limitPrice = parseFloat(e.target.value) || 0;
    updateRiskInfo();
  });

  // Percentage buttons
  document.querySelectorAll(".pct-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pct = parseInt(btn.dataset.pct);
      document.getElementById("percentageSlider").value = pct;
      updatePercentageSlider();
    });
  });

  // Percentage slider
  document
    .getElementById("percentageSlider")
    .addEventListener("input", updatePercentageSlider);

  // Chart tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      // Could load different chart data based on tab
    });
  });

  // Trading tabs
  document.querySelectorAll(".trading-tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tabName = btn.dataset.tradingTab;
      document
        .querySelectorAll(".trading-tab-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Hide all tabs
      document.getElementById("orderBookTab").style.display = "none";
      document.getElementById("positionsTab").style.display = "none";
      document.getElementById("ordersTab").style.display = "none";

      // Show selected tab
      if (tabName === "order-book") {
        document.getElementById("orderBookTab").style.display = "flex";
      } else if (tabName === "positions") {
        document.getElementById("positionsTab").style.display = "block";
        displayPositions();
      } else if (tabName === "orders") {
        document.getElementById("ordersTab").style.display = "block";
        displayOrders();
      }
    });
  });

  // Place order button
  document
    .getElementById("placeOrderBtn")
    .addEventListener("click", showOrderConfirmation);

  // Modal buttons
  document.querySelector(".modal-close").addEventListener("click", () => {
    document.getElementById("orderModal").classList.remove("show");
  });

  document.querySelector(".btn-cancel").addEventListener("click", () => {
    document.getElementById("orderModal").classList.remove("show");
  });

  document
    .querySelector(".btn-confirm")
    .addEventListener("click", confirmOrder);

  // Close modal when clicking outside
  document.getElementById("orderModal").addEventListener("click", (e) => {
    if (e.target.id === "orderModal") {
      document.getElementById("orderModal").classList.remove("show");
    }
  });
}

// ════════════════ LEVERAGE CONTROLS ════════════════
function updateLeverage(value) {
  state.leverage = Math.max(1, Math.min(125, value));
  document.getElementById("leverageInput").value = state.leverage;
  document.getElementById("leverageSlider").value = state.leverage;
  updateRiskInfo();
}

// ════════════════ PERCENTAGE SLIDER ════════════════
function updatePercentageSlider() {
  const percentage = parseInt(
    document.getElementById("percentageSlider").value,
  );

  // Update button states
  document.querySelectorAll(".pct-btn").forEach((btn) => {
    if (parseInt(btn.dataset.pct) === percentage) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Calculate quantity based on available balance (simulated as 10000 USDT)
  const availableBalance = 10000; // Simulated balance
  const balanceToUse = (availableBalance * percentage) / 100;
  const quantity = balanceToUse / state.currentPrice;

  document.getElementById("quantityInput").value = quantity.toFixed(8);
  state.quantity = quantity;

  updateQuantityValue();
  updateRiskInfo();
}

function updateQuantityValue() {
  const totalValue = state.quantity * state.currentPrice;
  document.getElementById("quantityValue").textContent =
    `≈ $${formatPrice(totalValue)}`;
}

// ════════════════ RISK CALCULATIONS ════════════════
function updateRiskInfo() {
  const price =
    state.orderType === "limit" ? state.limitPrice : state.currentPrice;

  // Entry price
  document.getElementById("entryPrice").textContent = formatPrice(price);

  // Margin required (position value / leverage)
  const positionValue = state.quantity * price;
  const marginRequired = positionValue / state.leverage;
  document.getElementById("marginRequired").textContent =
    `$${formatPrice(marginRequired)}`;

  // Liquidation price calculation
  const liquidationPrice = calculateLiquidationPrice(
    price,
    state.leverage,
    state.orderDirection,
  );
  document.getElementById("liquidationPrice").textContent =
    formatPrice(liquidationPrice);
}

function calculateLiquidationPrice(entryPrice, leverage, direction) {
  // Simplified liquidation price calculation
  // For long: liquidation when price drops to entry price - (entry price / leverage)
  // For short: liquidation when price rises to entry price + (entry price / leverage)

  const liquidationBuffer = entryPrice / leverage;

  if (direction === "long") {
    return Math.max(0, entryPrice - liquidationBuffer);
  } else {
    return entryPrice + liquidationBuffer;
  }
}

// ════════════════ ORDER MANAGEMENT ════════════════
function showOrderConfirmation() {
  if (state.quantity <= 0) {
    showNotification("Please enter a valid quantity", "warning");
    return;
  }

  const price =
    state.orderType === "limit" ? state.limitPrice : state.currentPrice;

  if (state.orderType === "limit" && state.limitPrice <= 0) {
    showNotification("Please enter a valid limit price", "warning");
    return;
  }

  const totalValue = state.quantity * price;

  // Update modal
  const modal = document.getElementById("orderModal");
  document.getElementById("modalOrderType").textContent =
    state.orderDirection === "long" ? "Buy Long" : "Sell Short";
  document.getElementById("modalQuantity").textContent =
    state.quantity.toFixed(8);
  document.getElementById("modalPrice").textContent = formatPrice(price);
  document.getElementById("modalTotal").textContent = formatPrice(totalValue);
  document.getElementById("modalLeverage").textContent = `${state.leverage}x`;

  modal.classList.add("show");
}

function confirmOrder() {
  const price =
    state.orderType === "limit" ? state.limitPrice : state.currentPrice;
  const totalValue = state.quantity * price;
  const marginRequired = totalValue / state.leverage;

  const position = {
    id: Date.now(),
    symbol: state.symbol,
    direction: state.orderDirection,
    quantity: state.quantity,
    entryPrice: price,
    currentPrice: state.currentPrice,
    leverage: state.leverage,
    marginType: state.marginType,
    marginUsed: marginRequired,
    pnl: 0,
    pnlPercentage: 0,
    liquidationPrice: calculateLiquidationPrice(
      price,
      state.leverage,
      state.orderDirection,
    ),
    timestamp: new Date().toLocaleString(),
    status: "open",
  };

  // Add to positions
  state.positions.push(position);
  saveStoredData();

  // Close modal
  document.getElementById("orderModal").classList.remove("show");

  // Reset form
  document.getElementById("quantityInput").value = "";
  document.getElementById("limitPrice").value = "";
  document.getElementById("percentageSlider").value = 0;
  state.quantity = 0;
  state.limitPrice = 0;

  showNotification(
    `${state.orderDirection.toUpperCase()} order placed successfully!`,
    "success",
  );
  displayPositions();
}

// ════════════════ DISPLAY POSITIONS ════════════════
function displayPositions() {
  const positionsList = document.getElementById("positionsList");

  if (state.positions.length === 0) {
    positionsList.innerHTML = '<p class="empty-state">No open positions</p>';
    return;
  }

  positionsList.innerHTML = state.positions
    .map((pos) => {
      const pnl = (state.currentPrice - pos.entryPrice) * pos.quantity;
      const pnlPercentage = (
        (pnl / (pos.entryPrice * pos.quantity)) *
        100
      ).toFixed(2);
      const pnlClass = pnl >= 0 ? "profit" : "loss";

      return `
            <div class="position-item ${pos.direction}">
                <div class="position-header">
                    <span class="position-type ${pos.direction}">${pos.direction.toUpperCase()}</span>
                    <span class="position-pnl" style="color: ${pnl >= 0 ? "var(--success)" : "var(--danger)"}">
                        ${pnl >= 0 ? "+" : ""}$${formatPrice(Math.abs(pnl))} (${pnlPercentage}%)
                    </span>
                </div>
                <div class="position-details">
                    <div class="position-detail">
                        <span>Symbol:</span>
                        <span>${pos.symbol}</span>
                    </div>
                    <div class="position-detail">
                        <span>Entry:</span>
                        <span>$${formatPrice(pos.entryPrice)}</span>
                    </div>
                    <div class="position-detail">
                        <span>Current:</span>
                        <span>$${formatPrice(state.currentPrice)}</span>
                    </div>
                    <div class="position-detail">
                        <span>Quantity:</span>
                        <span>${pos.quantity.toFixed(8)}</span>
                    </div>
                    <div class="position-detail">
                        <span>Leverage:</span>
                        <span>${pos.leverage}x</span>
                    </div>
                    <div class="position-detail">
                        <span>Liquidation:</span>
                        <span>$${formatPrice(pos.liquidationPrice)}</span>
                    </div>
                    <div class="position-detail">
                        <span>Margin:</span>
                        <span>$${formatPrice(pos.marginUsed)}</span>
                    </div>
                    <div class="position-detail">
                        <span>Opened:</span>
                        <span>${pos.timestamp}</span>
                    </div>
                </div>
                <button class="close-position-btn" data-id="${pos.id}" style="
                    width: 100%;
                    margin-top: 8px;
                    padding: 8px;
                    background: var(--danger);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 12px;
                ">Close Position</button>
            </div>
        `;
    })
    .join("");

  // Add event listeners for close position buttons
  document.querySelectorAll(".close-position-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const positionId = parseInt(e.target.dataset.id);
      closePosition(positionId);
    });
  });
}

function closePosition(positionId) {
  const positionIndex = state.positions.findIndex((p) => p.id === positionId);
  if (positionIndex > -1) {
    const position = state.positions[positionIndex];
    const pnl = (state.currentPrice - position.entryPrice) * position.quantity;

    state.positions.splice(positionIndex, 1);
    saveStoredData();
    displayPositions();

    const message =
      pnl >= 0
        ? `Position closed. Profit: $${formatPrice(Math.abs(pnl))}`
        : `Position closed. Loss: $${formatPrice(Math.abs(pnl))}`;

    showNotification(message, pnl >= 0 ? "success" : "warning");
  }
}

// ════════════════ DISPLAY ORDERS ════════════════
function displayOrders() {
  const ordersList = document.getElementById("ordersList");

  if (state.orders.length === 0) {
    ordersList.innerHTML = '<p class="empty-state">No open orders</p>';
    return;
  }

  ordersList.innerHTML = state.orders
    .map(
      (order) => `
        <div class="order-item">
            <div class="order-header" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 600;">${order.type}</span>
                <span style="color: var(--text-secondary); font-size: 12px;">${order.timestamp}</span>
            </div>
            <div class="order-details" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Symbol:</span>
                    <span>${order.symbol}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Quantity:</span>
                    <span>${order.quantity.toFixed(8)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Price:</span>
                    <span>$${formatPrice(order.price)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Total:</span>
                    <span>$${formatPrice(order.quantity * order.price)}</span>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

// ════════════════ LIVE UPDATES ════════════════
function startLiveUpdates() {
  setInterval(updateLiveData, CONFIG.UPDATE_INTERVAL);
}

// ════════════════ LOCAL STORAGE ════════════════
function saveStoredData() {
  const data = {
    positions: state.positions,
    orders: state.orders,
  };
  localStorage.setItem("tradingData", JSON.stringify(data));
}

function loadStoredData() {
  const stored = localStorage.getItem("tradingData");
  if (stored) {
    const data = JSON.parse(stored);
    state.positions = data.positions || [];
    state.orders = data.orders || [];
  }
}

// ════════════════ NOTIFICATIONS ════════════════
function showNotification(message, type = "info") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification show ${type}`;

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// ════════════════ UTILITY FUNCTIONS ════════════════
function formatPrice(price) {
  if (price >= 1000) {
    return price.toFixed(2);
  } else if (price >= 1) {
    return price.toFixed(4);
  } else if (price >= 0.01) {
    return price.toFixed(6);
  } else {
    return price.toFixed(8);
  }
}
