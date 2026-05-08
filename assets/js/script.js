/* ── FETCH LIVE COIN DATA ── */
const API_URL = "https://api.livecoinwatch.com/coins/list";
const API_KEY = "3c2c8d38-0771-4eb8-8a85-1b46e5fdcc29";

let currentCoins = [];

async function fetchCoins() {
  try {
    const response = await fetch(API_URL, {
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
        limit: 15,
        meta: true,
      }),
    });

    const data = await response.json();

    if (data && Array.isArray(data)) {
      currentCoins = data.map((c) => ({
        ...c,
        realRate: c.rate,
        currentRate: c.rate,
      }));
      updateUI();
    }
  } catch (error) {
    console.error("Error fetching coin data:", error);
  }
}

function updateUI() {
  buildTable(currentCoins);
  buildTicker(currentCoins);
  buildMarketOverview(currentCoins);
}

function simulateFluctuations() {
  if (!currentCoins.length) return;

  currentCoins.forEach((c) => {
    // Random fluctuation between -0.05% and +0.05%
    const fluctuation = 1 + (Math.random() * 0.001 - 0.0005);
    let newRate = c.currentRate * fluctuation;

    // Bound the drift to max 0.5% from realRate
    if (newRate > c.realRate * 1.005) newRate = c.realRate * 1.005;
    if (newRate < c.realRate * 0.995) newRate = c.realRate * 0.995;

    c.currentRate = newRate;
    c.rate = newRate; // Update rate so formatter picks it up
  });

  updateUI();
}

function formatVolume(volume) {
  if (volume >= 1e9) {
    return "$" + (volume / 1e9).toFixed(2) + "B";
  }
  if (volume >= 1e6) {
    return "$" + (volume / 1e6).toFixed(2) + "M";
  }
  if (volume >= 1e3) {
    return "$" + (volume / 1e3).toFixed(2) + "K";
  }
  return "$" + volume.toFixed(2);
}

function formatPrice(price) {
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  return price.toFixed(2);
}

/* ── BUILD TABLE ── */
function buildTable(apiCoins) {
  const tbody = document.getElementById("tradeBody");
  if (!tbody) return;

  if (tbody.children.length === apiCoins.length) {
    apiCoins.forEach((c, i) => {
      const row = tbody.children[i];
      const deltaDay = c.delta && c.delta.day ? c.delta.day : 1;
      const chgPercent = (deltaDay - 1) * 100;
      const isRed = chgPercent < 0;
      const priceColor = isRed ? "#e84545" : "#00c896";
      const chgStr = (chgPercent > 0 ? "+" : "") + chgPercent.toFixed(2) + "%";
      const priceStr = formatPrice(c.rate);
      const usdStr = "$" + priceStr;
      const turnoverStr = formatVolume(c.volume || 0);

      const turnoverEl = row.querySelector(".coin-turnover");
      if (turnoverEl) turnoverEl.textContent = turnoverStr;

      const priceMain = row.querySelector(".price-main");
      if (priceMain) {
        priceMain.textContent = priceStr;
        priceMain.style.color = priceColor;
      }

      const priceUsd = row.querySelector(".price-usd");
      if (priceUsd) priceUsd.textContent = usdStr;

      const chgBadge = row.querySelector(".chg-badge");
      if (chgBadge) {
        chgBadge.textContent = chgStr;
        chgBadge.className = `chg-badge ${isRed ? "chg-red" : "chg-green"}`;
      }
    });
    return;
  }

  tbody.innerHTML = "";

  apiCoins.forEach((c) => {
    const deltaDay = c.delta && c.delta.day ? c.delta.day : 1;
    const chgPercent = (deltaDay - 1) * 100;
    const isRed = chgPercent < 0;
    const priceColor = isRed ? "#e84545" : "#00c896";
    const chgStr = (chgPercent > 0 ? "+" : "") + chgPercent.toFixed(2) + "%";

    const priceStr = formatPrice(c.rate);
    const usdStr = "$" + priceStr;
    const turnoverStr = formatVolume(c.volume || 0);

    const iconHtml = c.png32
      ? `<img src="${c.png32}" alt="${c.code}" style="width: 100%; height: 100%; border-radius: 50%; display: block; object-fit: cover;">`
      : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">${c.code ? c.code.charAt(0) : "?"}</div>`;

    const iconBg = c.color || "#333";

    tbody.innerHTML += `
      <tr data-coin="${c.code}" style="cursor: pointer; transition: background-color 0.2s ease;">
        <td>
          <div class="coin-cell">
            <div class="coin-icon" style="background:${iconBg};color:#fff;padding:0;overflow:hidden;border-radius:50%;">
              ${iconHtml}
            </div>
            <div class="coin-name-wrap">
              <div><span class="coin-base">${c.code}</span><span class="coin-quote">/USD</span></div>
              <div class="coin-turnover">${turnoverStr}</div>
            </div>
          </div>
        </td>
        <td class="price-cell">
          <div class="price-main" style="color:${priceColor}">${priceStr}</div>
          <div class="price-usd">${usdStr}</div>
        </td>
        <td class="change-cell">
          <span class="chg-badge ${isRed ? "chg-red" : "chg-green"}">${chgStr}</span>
        </td>
      </tr>`;
  });

  // Add click listeners to table rows
  tbody.querySelectorAll("tr").forEach((row) => {
    row.addEventListener("click", () => {
      const coin = row.dataset.coin;
      if (coin) {
        const symbol = coin + "USDT";
        window.location.href = `trade.html?symbol=${symbol}`;
      }
    });
    row.addEventListener("mouseenter", () => {
      row.style.backgroundColor = "rgba(0, 102, 255, 0.1)";
    });
    row.addEventListener("mouseleave", () => {
      row.style.backgroundColor = "transparent";
    });
  });
}

/* ── BUILD TICKER ── */
function buildTicker(apiCoins) {
  const track = document.getElementById("tickerTrack");
  if (!track) return;

  const tickerData = apiCoins.slice(0, 10).map((c) => {
    const deltaDay = c.delta && c.delta.day ? c.delta.day : 1;
    const chgPercent = (deltaDay - 1) * 100;
    const isRed = chgPercent < 0;
    const chgStr = (chgPercent > 0 ? "+" : "") + chgPercent.toFixed(2) + "%";

    return {
      label: `${c.code}: ${formatPrice(c.rate)}`,
      chg: chgStr,
      red: isRed,
    };
  });

  const combinedData = [...tickerData, ...tickerData];

  if (track.children.length === combinedData.length) {
    combinedData.forEach((t, i) => {
      const span = track.children[i];
      const dot = span.querySelector(".dot");
      const labelEl = span.querySelector(".ticker-label");
      const badge = span.querySelector(".ticker-badge");

      if (dot && labelEl && badge) {
        dot.className = t.red ? "dot red" : "dot";
        labelEl.textContent = t.label;
        badge.className = t.red
          ? "ticker-badge badge-red"
          : "ticker-badge badge-green";
        badge.textContent = t.chg;
      } else {
        const dotClass = t.red ? "dot red" : "dot";
        const badgeClass = t.red ? "badge-red" : "badge-green";
        span.innerHTML = `<span class="${dotClass}"></span> <span class="ticker-label">${t.label}</span> <span class="ticker-badge ${badgeClass}">${t.chg}</span>`;
      }
    });
    return;
  }

  track.innerHTML = "";

  combinedData.forEach((t) => {
    const span = document.createElement("div");
    span.className = "ticker-item";
    const dotClass = t.red ? "dot red" : "dot";
    const badgeClass = t.red ? "badge-red" : "badge-green";
    span.innerHTML = `<span class="${dotClass}"></span> <span class="ticker-label">${t.label}</span> <span class="ticker-badge ${badgeClass}">${t.chg}</span>`;
    track.appendChild(span);
  });
}

/* ── BUILD MARKET OVERVIEW ── */
function buildMarketOverview(apiCoins) {
  const container = document.querySelector(".market-cards");
  if (!container) return;

  const targetSymbols = ["BTC", "ETH", "DOGE"];
  const topCoins = targetSymbols
    .map((sym) => apiCoins.find((c) => c.code === sym))
    .filter(Boolean);

  const displayCoins = topCoins.length === 3 ? topCoins : apiCoins.slice(0, 3);

  if (container.children.length === displayCoins.length) {
    displayCoins.forEach((c, i) => {
      const card = container.children[i];
      const deltaDay = c.delta && c.delta.day ? c.delta.day : 1;
      const chgPercent = (deltaDay - 1) * 100;
      const isRed = chgPercent < 0;
      const chgStr = Math.abs(chgPercent).toFixed(2) + "%";
      const arrow = isRed ? "▼" : "▲";
      const priceStr = formatPrice(c.rate);

      const priceEl = card.querySelector(".price");
      if (priceEl) {
        priceEl.textContent = priceStr;
        if (priceStr.length > 8) {
          priceEl.style.fontSize = "13px";
        } else {
          priceEl.style.fontSize = "";
        }
      }

      const changeEl = card.querySelector(".change");
      if (changeEl) {
        changeEl.style.color = isRed ? "#e84545" : "#00c896";
        const arrowSpan = changeEl.querySelector(".change-arrow");
        if (arrowSpan) {
          arrowSpan.textContent = arrow;
          if (arrowSpan.nextSibling) {
            arrowSpan.nextSibling.nodeValue = " " + chgStr;
          }
        } else {
          changeEl.innerHTML = `<span class="change-arrow">${arrow}</span> ${chgStr}`;
        }
      }
    });
    return;
  }

  container.innerHTML = "";

  displayCoins.forEach((c) => {
    const deltaDay = c.delta && c.delta.day ? c.delta.day : 1;
    const chgPercent = (deltaDay - 1) * 100;
    const isRed = chgPercent < 0;
    const chgStr = Math.abs(chgPercent).toFixed(2) + "%";
    const arrow = isRed ? "▼" : "▲";

    let priceStr = formatPrice(c.rate);
    let fontSizeStyle = priceStr.length > 8 ? 'style="font-size: 13px"' : "";

    container.innerHTML += `
      <div class="market-card" data-coin="${c.code}" style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;">
        <div class="pair">${c.code}<span>/USD</span></div>
        <div class="price" ${fontSizeStyle}>${priceStr}</div>
        <div class="change" style="color: ${isRed ? "#e84545" : "#00c896"}">
          <span class="change-arrow">${arrow}</span> ${chgStr}
        </div>
      </div>
    `;
  });

  // Add click listeners to market cards
  container.querySelectorAll(".market-card").forEach((card) => {
    card.addEventListener("click", () => {
      const coin = card.dataset.coin;
      if (coin) {
        const symbol = coin + "USDT";
        window.location.href = `trade.html?symbol=${symbol}`;
      }
    });
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-5px)";
      card.style.boxShadow = "0 8px 16px rgba(0, 102, 255, 0.2)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "none";
    });
  });
}

// Initialize
fetchCoins();
// Fetch real data every 60 seconds (to avoid API rate limits)
setInterval(fetchCoins, 60000);
// Simulate live market ticks every 1 second
setInterval(simulateFluctuations, 1000);
