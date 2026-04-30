/* ── COIN DATA ── */
const coins = [
  {
    icon: "₿",
    iconBg: "#f7931a",
    iconColor: "#fff",
    base: "BTC",
    quote: "USDT",
    turnover: "$253.94M",
    price: "77517.88",
    usd: "$77.52K",
    chg: "-1%",
    red: true,
  },
  {
    icon: "Ξ",
    iconBg: "#627eea",
    iconColor: "#fff",
    base: "ETH",
    quote: "USDT",
    turnover: "$126.08M",
    price: "2316.24",
    usd: "$2.32K",
    chg: "-2%",
    red: true,
  },
  {
    icon: "Ð",
    iconBg: "#c3a634",
    iconColor: "#fff",
    base: "DOGE",
    quote: "USDT",
    turnover: "$2.27M",
    price: "0.097966",
    usd: "$0.10",
    chg: "-2%",
    red: true,
  },
  {
    icon: "T",
    iconBg: "#ef0027",
    iconColor: "#fff",
    base: "TRX",
    quote: "USDT",
    turnover: "$1.22M",
    price: "0.323685",
    usd: "$0.32",
    chg: "+1%",
    red: false,
  },
  {
    icon: "C",
    iconBg: "#c8102e",
    iconColor: "#fff",
    base: "CHZ",
    quote: "USDT",
    turnover: "$2.83M",
    price: "0.04999",
    usd: "$0.05",
    chg: "+1%",
    red: false,
  },
  {
    icon: "P",
    iconBg: "#003f88",
    iconColor: "#fff",
    base: "PSG",
    quote: "USDT",
    turnover: "$779.62K",
    price: "0.832",
    usd: "$0.83",
    chg: "+1%",
    red: false,
  },
  {
    icon: "J",
    iconBg: "#fff200",
    iconColor: "#000",
    base: "JUV",
    quote: "USDT",
    turnover: "$802.34K",
    price: "0.5376",
    usd: "$0.54",
    chg: "+1%",
    red: false,
  },
  {
    icon: "A",
    iconBg: "#c8102e",
    iconColor: "#fff",
    base: "ATM",
    quote: "USDT",
    turnover: "$1.09M",
    price: "1.1106",
    usd: "$1.11",
    chg: "-2%",
    red: true,
  },
  {
    icon: "Ł",
    iconBg: "#345d9d",
    iconColor: "#fff",
    base: "LTC",
    quote: "USDT",
    turnover: "$3.38M",
    price: "56.28",
    usd: "$56.28",
    chg: "+1%",
    red: false,
  },
  {
    icon: "E",
    iconBg: "#328332",
    iconColor: "#fff",
    base: "ETC",
    quote: "USDT",
    turnover: "$18.39K",
    price: "8.5734",
    usd: "$8.57",
    chg: "+1%",
    red: false,
  },
  {
    icon: "e",
    iconBg: "#1a1a1a",
    iconColor: "#fff",
    base: "EOS",
    quote: "USDT",
    turnover: "$0.00",
    price: "0.7384",
    usd: "$0.74",
    chg: "-2%",
    red: true,
  },
  {
    icon: "⬡",
    iconBg: "#2a5ada",
    iconColor: "#fff",
    base: "LINK",
    quote: "USDT",
    turnover: "$8.20M",
    price: "16.2849",
    usd: "$16.20",
    chg: "+1%",
    red: false,
  },
  {
    icon: "B",
    iconBg: "#1da2b0",
    iconColor: "#fff",
    base: "BTS",
    quote: "USDT",
    turnover: "$1.24M",
    price: "6.0448",
    usd: "$6.04",
    chg: "+1%",
    red: false,
  },
];

/* ── BUILD TABLE ── */
const tbody = document.getElementById("tradeBody");
coins.forEach((c) => {
  const priceColor = c.red ? "#e84545" : "#00c896";
  tbody.innerHTML += `
    <tr>
      <td>
        <div class="coin-cell">
          <div class="coin-icon" style="background:${c.iconBg};color:${c.iconColor}">${c.icon}</div>
          <div class="coin-name-wrap">
            <div><span class="coin-base">${c.base}</span><span class="coin-quote">/${c.quote}</span></div>
            <div class="coin-turnover">${c.turnover}</div>
          </div>
        </div>
      </td>
      <td class="price-cell">
        <div class="price-main" style="color:${priceColor}">${c.price}</div>
        <div class="price-usd">${c.usd}</div>
      </td>
      <td class="change-cell">
        <span class="chg-badge ${c.red ? "chg-red" : "chg-green"}">${c.chg}</span>
      </td>
    </tr>`;
});

/* ── BUILD TICKER ── */
const tickerData = [
  { label: "BTC: 42,380", chg: "+2.4%", red: false },
  { label: "ETH: 2,680", chg: "-1.26%", red: true },
  { label: "BNB: 315", chg: "+0.87%", red: false },
  { label: "TRX: 0.323685", chg: "1%", red: false },
  { label: "CHZ: 0.04999", chg: "1%", red: false },
];
const track = document.getElementById("tickerTrack");

[...tickerData, ...tickerData].forEach((t) => {
  const span = document.createElement("div");
  span.className = "ticker-item";
  const dotClass = t.red ? "dot red" : "dot";
  const badgeClass = t.red ? "badge-red" : "badge-green";
  span.innerHTML = `<span class="${dotClass}"></span>${t.label} <span class="ticker-badge ${badgeClass}">${t.chg}</span>`;
  track.appendChild(span);
});
