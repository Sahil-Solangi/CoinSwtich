/* ══════════════════════════════════════
   EXCHANGE JS — CoinSwtich
   Live rates + logos from LiveCoinWatch
══════════════════════════════════════ */

const API_URL = "https://api.livecoinwatch.com/coins/list";
const API_KEY = "3c2c8d38-0771-4eb8-8a85-1b46e5fdcc29";

// ─── Symbols we care about (ordered by rank) ────────
const WANTED = ["BTC","ETH","USDT","BNB","SOL","XRP","DOGE",
                "ADA","MATIC","LTC","TRX","AVAX","SHIB","DOT","LINK"];

// ─── State ──────────────────────────────────────────
let coinData = {};           // { BTC: { rate, name, png, color }, … }
let fromSymbol = "BTC";
let toSymbol   = "USDT";
let currentPickerTarget = "from";

// ─── Fetch live data from LiveCoinWatch ─────────────
async function fetchRates() {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        currency: "USD",
        sort: "rank",
        order: "ascending",
        offset: 0,
        limit: 50,
        meta: true,         // ← includes name, png logo, color, etc.
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (Array.isArray(data)) {
      data.forEach(coin => {
        if (!coin.code) return;
        coinData[coin.code] = {
          rate  : coin.rate   || 0,
          name  : coin.name   || coin.code,
          png   : coin.png32  || coin.png64 || "",   // correct field: png32
          color : coin.color  || "#555",
        };
      });

      // USDT always = 1 USD
      if (!coinData["USDT"]) {
        coinData["USDT"] = { rate: 1, name: "Tether", png: "", color: "#26a17b" };
      } else {
        coinData["USDT"].rate = 1;
      }

      updateUI();
      console.log("✅ Live rates fetched:", Object.keys(coinData).length, "coins");
    }
  } catch (err) {
    console.error("Rate fetch failed:", err);
    // Fallback so the UI stays usable offline
    useFallback();
  }
}

// ─── Fallback static rates ───────────────────────────
function useFallback() {
  const fallback = [
    { code:"BTC",  rate:65000,    name:"Bitcoin",    color:"#f7931a" },
    { code:"ETH",  rate:3200,     name:"Ethereum",   color:"#627eea" },
    { code:"USDT", rate:1,        name:"Tether",     color:"#26a17b" },
    { code:"BNB",  rate:580,      name:"BNB",        color:"#f0b90b" },
    { code:"SOL",  rate:160,      name:"Solana",     color:"#9945ff" },
    { code:"XRP",  rate:0.52,     name:"XRP",        color:"#23292f" },
    { code:"DOGE", rate:0.14,     name:"Dogecoin",   color:"#c2a633" },
    { code:"ADA",  rate:0.45,     name:"Cardano",    color:"#0033ad" },
    { code:"MATIC",rate:0.8,      name:"Polygon",    color:"#8247e5" },
    { code:"LTC",  rate:84,       name:"Litecoin",   color:"#bebebe" },
    { code:"TRX",  rate:0.12,     name:"TRON",       color:"#ef0027" },
    { code:"AVAX", rate:36,       name:"Avalanche",  color:"#e84142" },
    { code:"SHIB", rate:0.000023, name:"Shiba Inu",  color:"#ffa409" },
    { code:"DOT",  rate:7.5,      name:"Polkadot",   color:"#e6007a" },
    { code:"LINK", rate:18,       name:"Chainlink",  color:"#2a5ada" },
  ];
  fallback.forEach(c => { coinData[c.code] = { rate: c.rate, name: c.name, png: c.png32 || "", color: c.color }; });
  updateUI();
}

// ─── Update all UI elements ──────────────────────────
function updateUI() {
  renderCoinSelectors();
  recalculate();
  updateBanner();
}

// ─── Logo helper — returns <img> or colored letter ───
function logoHTML(symbol, size = 28) {
  const coin = coinData[symbol];
  if (coin && coin.png) {
    return `<img src="${coin.png}" alt="${symbol}" 
              style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;background:#222;"
              onerror="this.outerHTML=letterLogo('${symbol}', ${size}, '${coin.color}')">`;
  }
  const color = (coin && coin.color) ? coin.color : "#555";
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};
                       display:flex;align-items:center;justify-content:center;
                       font-size:${Math.round(size*0.45)}px;font-weight:700;color:#fff;flex-shrink:0;">
            ${symbol.charAt(0)}
          </div>`;
}

// Fallback in case img fails (called from inline onerror)
window.letterLogo = function(symbol, size, color) {
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};
                       display:flex;align-items:center;justify-content:center;
                       font-size:${Math.round(size*0.45)}px;font-weight:700;color:#fff;">
            ${symbol.charAt(0)}
          </div>`;
};

// ─── Banner ──────────────────────────────────────────
function updateBanner() {
  const fr = (coinData[fromSymbol] || {}).rate || 0;
  const tr = (coinData[toSymbol]   || {}).rate || 0;
  if (fr && tr) {
    document.getElementById("bannerRate").textContent =
      `1 ${fromSymbol} = ${fmt(fr / tr)} ${toSymbol}`;
  }
}

// ─── Render selectors ────────────────────────────────
function renderCoinSelectors() {
  // From
  document.getElementById("fromIcon").innerHTML = logoHTML(fromSymbol, 28);
  document.getElementById("fromName").textContent = fromSymbol;

  // To
  document.getElementById("toIcon").innerHTML = logoHTML(toSymbol, 28);
  document.getElementById("toName").textContent = toSymbol;

  // Rate label
  const fr = (coinData[fromSymbol] || {}).rate || 0;
  const tr = (coinData[toSymbol]   || {}).rate || 0;
  document.getElementById("exchangeRateDisplay").textContent =
    tr ? `1 ${fromSymbol} = ${fmt(fr / tr)} ${toSymbol}` : "Loading…";
}

// ─── Recalculate ─────────────────────────────────────
function recalculate() {
  const fromAmt = parseFloat(document.getElementById("fromAmount").value) || 0;
  const fr = (coinData[fromSymbol] || {}).rate || 0;
  const tr = (coinData[toSymbol]   || {}).rate || 0;
  const toAmt = (tr > 0) ? (fromAmt * fr) / tr : 0;

  document.getElementById("toAmount").value       = toAmt > 0 ? toAmt.toFixed(8) : "";
  document.getElementById("fromFiat").textContent  = `≈ $${fmt(fromAmt * fr)}`;
  document.getElementById("toFiat").textContent    = `≈ $${fmt(toAmt * tr)}`;
  document.getElementById("receiveDisplay").textContent =
    toAmt > 0 ? `${fmt(toAmt)} ${toSymbol}` : `-- ${toSymbol}`;

  updateBanner();
}

// ─── PCT Buttons ─────────────────────────────────────
function setPct(pct) {
  const maxBalance = 1;
  document.getElementById("fromAmount").value = ((maxBalance * pct) / 100).toFixed(8);
  recalculate();
  document.querySelectorAll(".pct-btn").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
}

// ─── Flip ────────────────────────────────────────────
function flipCoins() {
  [fromSymbol, toSymbol] = [toSymbol, fromSymbol];
  renderCoinSelectors();
  recalculate();
  const btn = document.getElementById("flipBtn");
  btn.style.transition = "transform 0.4s";
  btn.style.transform = "rotate(180deg)";
  setTimeout(() => { btn.style.transform = "rotate(0deg)"; }, 400);
}

// ─── Confirm Exchange ────────────────────────────────
function confirmExchange() {
  const fromAmt = parseFloat(document.getElementById("fromAmount").value);
  if (!fromAmt || fromAmt <= 0) {
    document.getElementById("fromAmount").focus();
    return;
  }
  const toAmt = parseFloat(document.getElementById("toAmount").value) || 0;
  document.getElementById("successMsg").textContent =
    `${fmt(fromAmt)} ${fromSymbol} → ${fmt(toAmt)} ${toSymbol}. Order submitted at live market rate.`;
  document.getElementById("successOverlay").classList.add("show");
}

function closeSuccess() {
  document.getElementById("successOverlay").classList.remove("show");
  document.getElementById("fromAmount").value = "";
  document.getElementById("toAmount").value   = "";
  recalculate();
}

// ─── Coin Picker ─────────────────────────────────────
function openPicker(target) {
  currentPickerTarget = target;
  document.getElementById("pickerSearch").value = "";
  renderPickerList(WANTED);
  document.getElementById("pickerOverlay").classList.add("show");
}

function closePicker(e, force = false) {
  if (force || (e && e.target === document.getElementById("pickerOverlay"))) {
    document.getElementById("pickerOverlay").classList.remove("show");
  }
}

function filterPicker(query) {
  const q = query.toLowerCase().trim();
  const filtered = q
    ? WANTED.filter(s => {
        const d = coinData[s] || {};
        return s.toLowerCase().includes(q) || (d.name || "").toLowerCase().includes(q);
      })
    : WANTED;
  renderPickerList(filtered);
}

function renderPickerList(symbols) {
  const list = document.getElementById("pickerList");
  list.innerHTML = symbols.map(s => {
    const coin = coinData[s] || { rate: 0, name: s, png: "", color: "#555" };
    const priceStr = coin.rate ? `$${fmt(coin.rate)}` : "…";
    return `
      <div class="picker-item" onclick="selectCoin('${s}')">
        <div class="picker-item-icon">${logoHTML(s, 36)}</div>
        <div class="picker-item-info">
          <h4>${s}</h4>
          <p>${coin.name}</p>
        </div>
        <div class="picker-item-rate">
          <div class="price">${priceStr}</div>
        </div>
      </div>
    `;
  }).join("");
}

function selectCoin(symbol) {
  if (currentPickerTarget === "from") fromSymbol = symbol;
  else toSymbol = symbol;
  document.getElementById("pickerOverlay").classList.remove("show");
  renderCoinSelectors();
  recalculate();
}

// ─── Number formatter ────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return "0";
  if (n >= 1000)  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1)     return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return n.toFixed(8).replace(/0+$/, "").replace(/\.$/, "") || "0";
}

// ─── Boot ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fromAmount").addEventListener("input", recalculate);
  fetchRates();                        // immediate fetch
  setInterval(fetchRates, 15000);      // auto-refresh every 15 s
});
