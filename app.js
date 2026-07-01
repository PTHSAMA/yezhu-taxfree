function getNumber(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  return Number(el.value || 0);
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function formatNumber(num) {
  return Math.round(Number(num || 0)).toLocaleString("zh-CN");
}

function formatWanKRW(num) {
  return Math.round(Number(num || 0) / 10000) + "万";
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

  try {
    const data = JSON.parse(saved);

    if (data.exchangeRate) setValue("exchangeRate", data.exchangeRate);
    if (data.lotteRate) setValue("lotteRate", data.lotteRate);
    if (data.shinsegaeRate) setValue("shinsegaeRate", data.shinsegaeRate);
    if (data.hyundaiRate) setValue("hyundaiRate", data.hyundaiRate);
  } catch (e) {
    console.error("读取汇率失败：", e);
  }
}

function getStoreRate() {
  const exchangeRate = getNumber("exchangeRate");

  if (!exchangeRate) return 0;

  return exchangeRate / 0.97;
}

function getStoreName() {
  const store = document.getElementById("store").value;

  if (store === "lotte") return "乐天 / 新罗";
  if (store === "shinsegae") return "新世界";
  if (store === "hyundai") return "现代";

  return "";
}

// 600万以下：阶梯退税
// 600万以上：标价 × 0.0818
const taxTable = [
  { min: 30000, refund: 2000 },
  { min: 50000, refund: 3000 },
  { min: 75000, refund: 5000 },
  { min: 100000, refund: 6000 },
  { min: 125000, refund: 8000 },
  { min: 150000, refund: 9000 },
  { min: 175000, refund: 10000 },
  { min: 200000, refund: 12000 },
  { min: 225000, refund: 13000 },
  { min: 250000, refund: 15000 },
  { min: 275000, refund: 17000 },
  { min: 300000, refund: 19000 },
  { min: 325000, refund: 21000 },
  { min: 350000, refund: 23000 },
  { min: 375000, refund: 25000 },
  { min: 400000, refund: 27000 },
  { min: 425000, refund: 28000 },
  { min: 450000, refund: 30000 },
  { min: 475000, refund: 32000 },
  { min: 500000, refund: 35000 },
  { min: 550000, refund: 37000 },
  { min: 600000, refund: 41000 },
  { min: 650000, refund: 45000 },
  { min: 700000, refund: 50000 },
  { min: 750000, refund: 53000 },
  { min: 800000, refund: 57000 },
  { min: 850000, refund: 60000 },
  { min: 900000, refund: 65000 },
  { min: 950000, refund: 68000 },
  { min: 1000000, refund: 74000 },
  { min: 1100000, refund: 80000 },
  { min: 1200000, refund: 90000 },
  { min: 1300000, refund: 95000 },
  { min: 1400000, refund: 104000 },
  { min: 1500000, refund: 110000 },
  { min: 1600000, refund: 115000 },
  { min: 1700000, refund: 127000 },
  { min: 1800000, refund: 135000 },
  { min: 1900000, refund: 140000 },
  { min: 2000000, refund: 150000 },
  { min: 2100000, refund: 155000 },
  { min: 2200000, refund: 160000 },
  { min: 2300000, refund: 170000 },
  { min: 2400000, refund: 177000 },
  { min: 2500000, refund: 185000 },
  { min: 2600000, refund: 190000 },
  { min: 2700000, refund: 200000 },
  { min: 2800000, refund: 210000 },
  { min: 2900000, refund: 215000 },
  { min: 3000000, refund: 225000 },
  { min: 3100000, refund: 230000 },
  { min: 3200000, refund: 235000 },
  { min: 3300000, refund: 240000 },
  { min: 3400000, refund: 250000 },
  { min: 3500000, refund: 260000 },
  { min: 3600000, refund: 270000 },
  { min: 3700000, refund: 280000 },
  { min: 3800000, refund: 285000 },
  { min: 3900000, refund: 290000 },
  { min: 4000000, refund: 300000 },
  { min: 4100000, refund: 310000 },
  { min: 4200000, refund: 315000 },
  { min: 4300000, refund: 320000 },
  { min: 4400000, refund: 333000 },
  { min: 4500000, refund: 340000 },
  { min: 4600000, refund: 350000 },
  { min: 4700000, refund: 360000 },
  { min: 4800000, refund: 370000 },
  { min: 4900000, refund: 380000 },
  { min: 5000000, refund: 390000 },
  { min: 5100000, refund: 400000 },
  { min: 5200000, refund: 410000 },
  { min: 5300000, refund: 420000 },
  { min: 5400000, refund: 430000 },
  { min: 5500000, refund: 440000 },
  { min: 5600000, refund: 450000 },
  { min: 5700000, refund: 460000 },
  { min: 5800000, refund: 470000 },
  { min: 5900000, refund: 480000 }
];

function getTaxRefundKRW(price) {
  if (price >= 6000000) {
    return Math.round(price * 0.0818);
  }

  if (price < 30000) {
    return 0;
  }

  let refund = 0;

  for (let i = 0; i < taxTable.length; i++) {
    if (price >= taxTable[i].min) {
      refund = taxTable[i].refund;
    } else {
      break;
    }
  }

  return refund;
}

function calculate() {
  const exchangeRate = getNumber("exchangeRate");
  const giftRate = getStoreRate();
  const storeName = getStoreName();
  const price = getNumber("price");
  const inputRebatePercent = getNumber("rebate");
const rebatePercent = inputRebatePercent + 3;
const rebate = rebatePercent / 100;

  if (!exchangeRate) {
    alert("请填写韩米汇率");
    return;
  }

  if (!giftRate) {
    alert("请填写商品券价格");
    return;
  }

  if (!price) {
    alert("请填写商品标价");
    return;
  }

  const paymentRMB = price * (1 - rebate) / giftRate;
  const refundKRW = getTaxRefundKRW(price);
  const refundRMB = refundKRW / exchangeRate;
  const finalPrice = paymentRMB - refundRMB;

  const now = new Date();
  const dateText = `${now.getMonth() + 1}月${now.getDate()}日`;
  const timeText = `${now.getHours()}点${String(now.getMinutes()).padStart(2, "0")}`;

  const text =
`♦️${dateText} 汇率更新♦️
♦️时间${timeText}♦️

韩米：${exchangeRate.toFixed(1)}
商品券汇率：${exchangeRate.toFixed(1)} ÷ 0.97 = ${giftRate.toFixed(1)}

百货店：${storeName}
标价：${formatNumber(price)} 韩元
返点：${inputRebatePercent.toFixed(1)}% + 3.0% = ${rebatePercent.toFixed(1)}%

① 实际付款
${formatNumber(price)} × (1-${rebatePercent.toFixed(1)}%) ÷ ${giftRate.toFixed(1)}
= ${formatNumber(paymentRMB)} 元

② 机场退税
${formatNumber(refundKRW)} 韩元 ÷ ${exchangeRate.toFixed(1)}
≈ ${formatNumber(refundRMB)} 元

③ 最终到手价
${formatNumber(paymentRMB)} - ${formatNumber(refundRMB)}
= ${formatNumber(finalPrice)} 元`;

  document.getElementById("resultText").textContent = text;

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
}

function updateQuoteCard(data) {
  const qcPrice = document.getElementById("qc-price");
  const qcCoupon = document.getElementById("qc-coupon");
  const qcRebate = document.getElementById("qc-rebate");
  const qcRate = document.getElementById("qc-rate");
  const qcLine1 = document.getElementById("qc-line1");
  const qcLine2 = document.getElementById("qc-line2");
  const qcLine3 = document.getElementById("qc-line3");

  if (!qcPrice || !qcCoupon || !qcRebate || !qcRate || !qcLine1 || !qcLine2 || !qcLine3) {
    return;
  }

  qcPrice.textContent = formatWanKRW(data.price);
  qcCoupon.textContent = data.giftRate.toFixed(1);
  qcRebate.textContent = data.rebatePercent.toFixed(1) + "%";
  qcRate.textContent = data.exchangeRate.toFixed(1);

  qcLine1.textContent =
  "① 实际付款" + "\n" +
  formatNumber(data.price) +
  " * (1-" +
  data.rebatePercent.toFixed(1) +
  "%) /" +
  data.giftRate.toFixed(1) +
  "\n" +
  "= " +
  formatNumber(data.paymentRMB) +
  " 元";

  qcLine2.textContent =
    "② 机场退税" +
    formatNumber(data.refundKRW) +
    " 韩元 / " +
    data.exchangeRate.toFixed(1) +
    "≈ " +
    formatNumber(data.refundRMB) +
    " 元";

  qcLine3.textContent =
    "③ 最终到手价" +
    formatNumber(data.paymentRMB) +
    " - " +
    formatNumber(data.refundRMB) +
    "= " +
    formatNumber(data.finalPrice) +
    " 元";
}

function copyResult() {
  const text = document.getElementById("resultText").textContent;

  if (!text || text.includes("请输入数据")) {
    alert("请先计算报价");
    return;
  }

  copyText(text);
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(function () {
      alert("已复制");
    }).catch(function () {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand("copy");
    alert("已复制");
  } catch (err) {
    alert("复制失败，请手动复制");
  }

  document.body.removeChild(textarea);
}

function saveQuoteHistory() {
  const text = document.getElementById("resultText").textContent;

  if (!text || text.includes("请输入数据")) {
    alert("请先计算报价");
    return;
  }

  const item = {
    time: new Date().toLocaleString("zh-CN"),
    content: text
  };

  let history = JSON.parse(localStorage.getItem("quoteHistory") || "[]");
  history.unshift(item);

  if (history.length > 50) {
    history = history.slice(0, 50);
  }

  localStorage.setItem("quoteHistory", JSON.stringify(history));
  renderHistory();
  alert("已保存到历史");
}

function renderHistory() {
  const box = document.getElementById("historyList");
  if (!box) return;

  const history = JSON.parse(localStorage.getItem("quoteHistory") || "[]");

  if (history.length === 0) {
    box.innerHTML = "暂无历史报价";
    return;
  }

  box.innerHTML = history.map(function (item, index) {
    return `
      <div class="history-item">
        <div class="history-time">${index + 1}. ${item.time}</div>
        <pre>${escapeHtml(item.content)}</pre>
        <button onclick="copyHistory(${index})">复制这条</button>
      </div>
    `;
  }).join("");
}

function copyHistory(index) {
  const history = JSON.parse(localStorage.getItem("quoteHistory") || "[]");
  const item = history[index];

  if (!item) return;

  copyText(item.content);
}

function clearHistory() {
  if (!confirm("确定清空全部报价历史吗？")) return;

  localStorage.removeItem("quoteHistory");
  renderHistory();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function downloadQuoteImage() {
  const target = document.getElementById("quoteCard");

  if (!target) {
    alert("没有找到报价图片区域");
    return;
  }

  if (!window.html2canvas) {
    alert("图片生成库加载失败，请刷新页面后重试");
    return;
  }

  html2canvas(target, {
    scale: 3,
    backgroundColor: "#f8e6df",
    useCORS: true
  }).then(function (canvas) {
    const link = document.createElement("a");
    link.download = "野猪购物返点报价.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }).catch(function () {
    alert("图片生成失败，请刷新页面后重试");
  });
}

loadRates();
renderHistory();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(function () {});
}
