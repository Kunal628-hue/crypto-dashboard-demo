const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const refreshBtn = document.getElementById("refreshBtn");
const ctx = document.getElementById("comparisonChart").getContext("2d");

let comparisonChart;

// Predefined colors for datasets
const colors = [
  "#007bff", // BTC
  "#28a745", // ETH
  "#ffc107", // DOGE
  "#dc3545", // ADA
  "#6f42c1", // SOL
];

// Fetch 30-day historical data for one coin
async function fetchHistoricalData(coin) {
  const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=30`;
  const response = await fetch(url);
  const data = await response.json();
  return data.prices.map(p => p[1]);
}

// Fetch and render chart for selected coins
async function updateChart() {
  const selectedCoins = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  if (selectedCoins.length === 0) {
    alert("Please select at least one coin.");
    return;
  }

  // Save selected coins to localStorage
  localStorage.setItem("selectedCoins", JSON.stringify(selectedCoins));

  // Fetch data for all selected coins
  const datasets = [];
  let labels = [];

  for (let i = 0; i < selectedCoins.length; i++) {
    const coin = selectedCoins[i];
    const data = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=30`);
    const json = await data.json();

    if (i === 0) {
      labels = json.prices.map(p => new Date(p[0]).toLocaleDateString());
    }

    const prices = json.prices.map(p => p[1]);
    datasets.push({
      label: `${coin.toUpperCase()} (USD)`,
      data: prices,
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length] + "33",
      fill: false,
      tension: 0.25,
    });
  }

  // Destroy previous chart instance
  if (comparisonChart) comparisonChart.destroy();

  // Render new multi-line chart
  comparisonChart = new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: { display: true, text: "Price (USD)" },
        },
      },
    },
  });
}

// Load saved coin selections from localStorage
function loadSavedSelection() {
  const saved = localStorage.getItem("selectedCoins");
  if (saved) {
    const selectedCoins = JSON.parse(saved);
    checkboxes.forEach(cb => {
      cb.checked = selectedCoins.includes(cb.value);
    });
  }
}

// Event listeners
checkboxes.forEach(cb => cb.addEventListener("change", updateChart));
refreshBtn.addEventListener("click", updateChart);

// Initialize dashboard
loadSavedSelection();
updateChart();