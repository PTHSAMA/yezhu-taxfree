function getNumber(id) {
  return Number(document.getElementById(id).value || 0);
}

function formatNumber(num) {
  return Math.round(num).toLocaleString("zh-CN");
}

function saveRates() {
  const data = {
    exchangeRate: getNumber("exchangeRate"),
    lotteRate: getNumber("lotteRate"),
    shinsegaeRate: getNumber("shinsegaeRate"),
    hyundaiRate: getNumber("hyundaiRate")
  };

  localStorage.setItem("taxfreeRates", JSON.stringify(data));
  alert("今日汇率已保存");
}

function loadRates() {
  const saved = localStorage.getItem("taxfreeRates");
  if (!saved) return;

  const data = JSON.parse(saved);

  document.getElementById("exchangeRate").value = data.exchangeRate;
  document.getElementById("lotteRate").value = data.lotteRate;
  document.getElementById("shinsegaeRate").value = data.shinsegaeRate;
  document.getElementById("hyundaiRate").value = data.hyundaiRate;
}

function getStoreRate() {
  const store = document.getElementById("store").value;

  if (store === "lotte") return getNumber("lotteRate");
  if (store === "shinsegae") return getNumber("shinsegaeRate");
  if (store === "hyundai") return getNumber("hyundaiRate");

  return 0;
}

function getStoreName() {
  const store = document.getElementById("store").value;

  if (store === "lotte") return "乐天/新罗";
  if (store === "shinsegae") return "新世界";
  if (store === "hyundai") return "现代";

  return "";
}

// 600万以下阶梯退税表
// 这里你可以按图片内容继续补充或修改
const taxTable = [
  { min: 30000, refund: 1500 },
  { min: 50000, refund: 3500 },
  { min: 75000, refund: 5000 },
  { min: 100000, refund: 7000 },
  { min: 125000, refund: 9000 },
  { min: 150000, refund: 11000 },
  { min: 175000, refund: 13000 },
  { min: 200000, refund: 15000 },
  { min: 225000, refund: 17000 },
  { min: 250000, refund: 19000 },
  { min: 275000, refund: 21000 },
  { min: 300000, refund: 23000 },
  { min: 325000, refund: 25000 },
  { min: 350000, refund: 27000 },
  { min: 375000, refund: 29000 },
  { min: 400000, refund: 31000 },
  { min: 425000, refund: 33000 },
  { min: 450000, refund: 35000 },
  { min: 475000, refund: 37000 },
  { min: 500000, refund: 39000 },
  { min: 550000, refund: 43000 },
  { min: 600000, refund: 47000 },
  { min: 650000, refund: 51000 },
  { min: 700000, refund: 55000 },
  { min: 750000, refund: 59000 },
  { min: 800000, refund: 63000 },
  { min: 850000, refund: 67000 },
  { min: 900000, refund: 71000 },
  { min: 950000, refund: 75000 },
  { min: 1000000, refund: 79000 },
  { min: 1500000, refund: 119000 },
  { min: 2000000, refund: 159000 },
  { min: 2500000, refund: 199000 },
  { min: 3000000, refund: 239000 },
  { min: 3500000, refund: 279000 },
  { min: 4000000, refund: 319000 },
  { min: 4500000, refund: 359000 },
  { min: 5000000, refund: 399000 },
  { min: 5500000, refund: 439000 }
];

function getTaxRefundKRW(price) {
  if (price >= 6000000) {
    return price * 0.0818;
  }

  let refund = 0;

  for (let i = 0; i < taxTable.length; i++) {
    if (price >= taxTable[i].min) {
      refund = taxTable[i].refund;
    }
  }

  return refund;
}

function calculate() {
  const exchangeRate = getNumber("exchangeRate");
  const giftRate = getStoreRate();
  const storeName = getStoreName();
  const price = getNumber("price");
  const rebatePercent = getNumber("rebate");
  const rebate = rebatePercent / 100;

  if (!exchangeRate || !giftRate || !price) {
    alert("请填写汇率、券价和商品标价");
    return;
  }

  const paymentRMB = price * (1 - rebate) / giftRate;

  const refundKRW = getTaxRefundKRW(price);
  const refundRMB = refundKRW / exchangeRate;

  const finalPrice = paymentRMB - refundRMB;
  updateQuoteCard({
  price,
  giftRate,
  rebatePercent,
  exchangeRate,
  paymentRMB,
  refundKRW,
  refundRMB,
  finalPrice
});

  const now = new Date();
  const dateText = `${now.getMonth() + 1}月${now.getDate()}日`;
  const timeText = `${now.getHours()}点${String(now.getMinutes()).padStart(2, "0")}`;

  const text =
`♦️${dateText} 汇率更新♦️
♦️时间${timeText}♦️

韩米：${exchangeRate}
乐天/新罗(券)：${getNumber("lotteRate")}
新世界(券)：${getNumber("shinsegaeRate")}
现代(券)：${getNumber("hyundaiRate")}

百货店：${storeName}
标价：${formatNumber(price)} 韩元
返点：${rebatePercent}%

① 您的现场实际付款
${formatNumber(price)} × (1-${rebatePercent}%) ÷ ${giftRate}
= ${formatNumber(paymentRMB)} 元

② 机场退税
${formatNumber(refundKRW)} 韩元 ÷ ${exchangeRate}
≈ ${formatNumber(refundRMB)} 元

③ 最终到手价
${formatNumber(paymentRMB)} - ${formatNumber(refundRMB)}
= ${formatNumber(finalPrice)} 元`;

  document.getElementById("resultText").textContent = text;
}

function copyResult() {
  const text = document.getElementById("resultText").textContent;

  navigator.clipboard.writeText(text).then(() => {
    alert("报价已复制");
  });
}

loadRates();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
function saveQuoteHistory() {
  const text = document.getElementById("resultText").textContent;

  if (!text || text.includes("请输入数据")) {
    alert("请先计算报价");
    return;
  }

  const now = new Date();
  const item = {
    time: now.toLocaleString("zh-CN"),
    content: text
  };

  let history = JSON.parse(localStorage.getItem("quoteHistory") || "[]");

  history.unshift(item);

  if (history.length > 50) {
    history = history.slice(0, 50);
  }

  localStorage.setItem("quoteHistory", JSON.stringify(history));

  renderHistory();
  alert("已保存到报价历史");
}

function renderHistory() {
  const box = document.getElementById("historyList");
  const history = JSON.parse(localStorage.getItem("quoteHistory") || "[]");

  if (history.length === 0) {
    box.innerHTML = "暂无历史报价";
    return;
  }

  box.innerHTML = history.map((item, index) => `
    <div class="history-item">
      <div><strong>${index + 1}. ${item.time}</strong></div>
      <pre>${item.content}</pre>
      <button onclick="copyHistory(${index})">复制这条</button>
    </div>
  `).join("");
}

function copyHistory(index) {
  const history = JSON.parse(localStorage.getItem("quoteHistory") || "[]");
  const item = history[index];

  if (!item) return;

  navigator.clipboard.writeText(item.content).then(() => {
    alert("历史报价已复制");
  });
}

function clearHistory() {
  if (!confirm("确定清空全部报价历史吗？")) return;

  localStorage.removeItem("quoteHistory");
  renderHistory();
}

function downloadQuoteImage() {
  const target = document.getElementById("quoteCard");

  html2canvas(target, {
    scale: 2,
    backgroundColor: "#ffffff"
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "报价单.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

renderHistory();
function formatWanKRW(num) {
  return Math.round(num / 10000) + "万";
}

function updateQuoteCard(data) {
  document.getElementById("qc-price").textContent = formatWanKRW(data.price);
  document.getElementById("qc-coupon").textContent = data.giftRate.toFixed(1);
  document.getElementById("qc-rebate").textContent = data.rebatePercent.toFixed(1) + "%";
  document.getElementById("qc-rate").textContent = data.exchangeRate.toFixed(1);

  document.getElementById("qc-line1").textContent =
    "① 实际付款" +
    formatNumber(data.price) +
    " * (1-" +
    data.rebatePercent.toFixed(1) +
    "%) /" +
    data.giftRate.toFixed(1) +
    "= " +
    formatNumber(data.paymentRMB) +
    " 元";

  document.getElementById("qc-line2").textContent =
    "② 机场退税" +
    formatNumber(data.refundKRW) +
    " 韩元 / " +
    data.exchangeRate.toFixed(1) +
    "≈ " +
    formatNumber(data.refundRMB) +
    " 元";

  document.getElementById("qc-line3").textContent =
    "③ 最终到手价" +
    formatNumber(data.paymentRMB) +
    " - " +
    formatNumber(data.refundRMB) +
    "= " +
    formatNumber(data.finalPrice) +
    " 元";
}
function downloadQuoteImage() {
  const target = document.getElementById("quoteCard");

  html2canvas(target, {
    scale: 3,
    backgroundColor: null
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "野猪购物返点报价.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}