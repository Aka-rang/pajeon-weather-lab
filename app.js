"use strict";

const select = (selector) => document.querySelector(selector);
const all = (selector) => [...document.querySelectorAll(selector)];
const symbol = (name) => '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>';

const comparisons = {
  "inStore": {
    "title": "비 오는 날 파전 주문은 얼마나 늘었을까?",
    "axis": "파전 주문 건수 지수",
    "baseline": "비 오지 않은 날",
    "label": "비 온 날",
    "icons": [
      "cloud",
      "rain"
    ],
    "value": 129.29,
    "result": "수도권 티오더 매장에서 비가 온 날 파전 주문이 <b>29.29% 더 많았습니다.</b>",
    "source": "티오더 · 수도권 매장 · 2024년",
    "link": "https://blog.torder.com/2024-trend-report/"
  },
  "delivery": {
    "title": "장마철에는 파전 주문이 얼마나 늘었을까?",
    "axis": "파전 메뉴 주문 건수 지수",
    "baseline": "장마 직전 달",
    "label": "장마철",
    "icons": [
      "book",
      "rain"
    ],
    "value": 139.6,
    "result": "배달의민족의 장마철 파전 주문 건수는 직전 달보다 <b>39.6% 늘었습니다.</b>",
    "source": "배달의민족 · 앱 주문 · 2023년 장마철",
    "link": "https://ceo.baemin.com/guide/8393"
  },
  "retail": {
    "title": "비가 이어진 주에 전 매출은 어땠을까?",
    "axis": "교동전 4종 매출액 지수",
    "baseline": "직전 주 (6.1~7)",
    "label": "비가 이어진 주 (6.8~14)",
    "icons": [
      "book",
      "rain"
    ],
    "value": 208,
    "result": "해물파전을 포함한 교동전 4종의 매출액이 중부 지역 이마트24에서 전주보다 <b>108% 늘었습니다.</b>",
    "source": "이마트24 · 중부 지역 · 2023년 6월",
    "link": "https://www.shinsegaegroupnewsroom.com/emart24-rainy-season-sales-increase/"
  }
};

function renderComparison(type) {
  const item = comparisons[type];
  select("#compare-title").textContent = item.title;
  select("#compare-source").textContent = item.source;
  select("#compare-link").href = item.link;
  all("[data-type]").forEach(button => button.setAttribute("aria-pressed", button.dataset.type === type));
  const rows = [[item.baseline, item.icons[0], 100], [item.label, item.icons[1], item.value]];
  const bars = rows.map(([label, icon, value], index) => `
    <div class="bar-group"><div class="bar-row">
      <span>${symbol(icon)}${label}</span><b class="${index ? "blue" : ""}">${value}</b>
    </div><div class="bar-track" aria-hidden="true"><span class="${index ? "rainbar" : ""}" style="width:${value / 220 * 100}%"></span></div></div>`).join("");
  select("#comparison").innerHTML = `<p class="axis-title">${item.axis} <span>(비교 기준 = 100)</span></p>${bars}<p class="result-line">${item.result}</p>`;
}

const rainfall = [
  {
    "year": 2022,
    "mm": 89.3,
    "days": 5,
    "source": "https://www.weather.go.kr/w/weather/land/past-obs/obs-by-day.do?stn=133&yy=2022&mm=10&obs=1"
  },
  {
    "year": 2023,
    "mm": 12.2,
    "days": 2,
    "source": "https://www.weather.go.kr/w/weather/land/past-obs/obs-by-day.do?stn=133&yy=2023&mm=10&obs=1"
  },
  {
    "year": 2024,
    "mm": 109.2,
    "days": 12,
    "source": "https://www.weather.go.kr/w/weather/land/past-obs/obs-by-day.do?stn=133&yy=2024&mm=10&obs=1"
  },
  {
    "year": 2025,
    "mm": 211.2,
    "days": 13,
    "source": "https://www.weather.go.kr/w/weather/land/past-obs/obs-by-day.do?stn=133&yy=2025&mm=10&obs=1"
  },
  {
    "year": 2026,
    "mm": 105.5,
    "days": 6,
    "source": "https://www.weather.go.kr/w/weather/land/past-obs/obs-by-day.do?stn=133&yy=2026&mm=10&obs=1"
  }
];
let activeRain = rainfall.length - 1;

function chooseRain(index) {
  activeRain = index;
  const item = rainfall[index];
  all("#rain-selector button").forEach((button, i) => button.setAttribute("aria-pressed", i === index));
  select("#rain-detail").innerHTML = `<b>${item.year}년 10월</b> 대전의 강수일수는 <b>${item.days}일</b>, 한 달 강수량은 <b>${item.mm}mm</b>였습니다.`;
  select("#weather-link").href = item.source;
  drawRain();
}

function drawRain() {
  const plot = select("#rain-plot");
  const width = Math.max(200, plot.clientWidth);
  const height = 164, bottom = 149, chartHeight = 123, margin = 28;
  const column = (width - margin) / rainfall.length;
  const x = index => margin + (index + .5) * column;
  const y = value => bottom - value / 250 * chartHeight;
  const coords = rainfall.map((d, index) => x(index) + "," + y(d.mm)).join(" ");
  const grid = [0, 50, 100, 150, 200, 250].map(value => `
    <line x1="${margin}" x2="${width - 3}" y1="${y(value)}" y2="${y(value)}" stroke="#dce6f0" stroke-dasharray="3 4"/>
    <text x="${margin-7}" y="${y(value)+4}" text-anchor="end" fill="#64768c" font-size="11">${value}</text>`).join("");
  const points = rainfall.map((d, index) => {
    const active = index === activeRain;
    return `<g data-point="${index}" style="cursor:pointer">
      <title>${d.year}년 10월 · ${d.mm}mm</title>
      <circle cx="${x(index)}" cy="${y(d.mm)}" r="16" fill="transparent"/>
      ${active ? `<circle cx="${x(index)}" cy="${y(d.mm)}" r="9" fill="#b8d8ff"/>` : ""}
      <circle cx="${x(index)}" cy="${y(d.mm)}" r="${active ? 5 : 4}" fill="${active ? "#2868d3" : "white"}" stroke="#377ada" stroke-width="2"/>
      <text x="${x(index)}" y="${y(d.mm)-13}" text-anchor="middle" fill="${active ? "#1559b6" : "#425c7b"}" font-size="12" font-weight="650">${d.mm}</text>
    </g>`;
  }).join("");
  plot.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="대전 관측소 10월 누적 강수량. ${rainfall.map(d => d.year + "년 " + d.mm + "mm").join(", ")}.">
    <defs><linearGradient id="rain-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#69a5ed" stop-opacity=".35"/><stop offset="1" stop-color="#94bdf4" stop-opacity=".04"/></linearGradient></defs>
    ${grid}<polygon points="${x(0)},${bottom} ${coords} ${x(rainfall.length-1)},${bottom}" fill="url(#rain-fill)"/>
    <polyline points="${coords}" fill="none" stroke="#387cd9" stroke-width="2.8" stroke-linejoin="round"/>${points}
  </svg>`;
}

select("#rain-selector").innerHTML = rainfall.map((d, i) => `<button type="button" data-range="${i}" aria-label="${d.year}년 10월 관측 선택">${d.year}년</button>`).join("");
select("#rain-selector").addEventListener("click", event => {
  const button = event.target.closest("button");
  if (button) chooseRain(Number(button.dataset.range));
});
select("#rain-plot").addEventListener("click", event => {
  const point = event.target.closest("[data-point]");
  if (point) chooseRain(Number(point.dataset.point));
});
new ResizeObserver(drawRain).observe(select("#rain-plot"));
all("[data-type]").forEach(button => button.addEventListener("click", () => renderComparison(button.dataset.type)));
all("[data-metric]").forEach(link => link.addEventListener("click", () => {
  renderComparison(link.dataset.metric);
}));
renderComparison("inStore");
chooseRain(activeRain);

const motion = matchMedia("(prefers-reduced-motion: reduce)");
const rainLayer = select("#page-rain");
const rainToggle = select(".rain-toggle");
const rainKey = "pajeon-weather:rain";
let rainPreference = null;
try {
  const saved = localStorage.getItem(rainKey);
  if (saved === "on" || saved === "off") rainPreference = saved === "on";
} catch {
  // Keep the setting in memory if browser storage is unavailable.
}
function setRain(visible) {
  rainLayer.hidden = !visible;
  rainToggle.setAttribute("aria-pressed", String(visible));
}
for (let index = 0; index < 36; index++) {
  const drop = document.createElement("i");
  drop.style.left = ((index * 17.3) % 103) + "%";
  drop.style.animationDuration = (1.65 + index % 7 * .13) + "s";
  drop.style.animationDelay = -(index * .41) + "s";
  drop.style.opacity = (.38 + (index % 6) * .09).toString();
  rainLayer.append(drop);
}
setRain(rainPreference ?? !motion.matches);
motion.addEventListener("change", () => {
  if (rainPreference === null) setRain(!motion.matches);
});
rainToggle.addEventListener("click", () => {
  rainPreference = rainLayer.hidden;
  setRain(rainPreference);
  try {
    localStorage.setItem(rainKey, rainPreference ? "on" : "off");
  } catch {
    // The switch still controls the current page.
  }
});

const contents = [
  {title:"리포트 홈", excerpt:"비 오는 날은 왜 파전일까?", id:"top"},
  {title:"매장 파전 주문", excerpt:"티오더 수도권 매장의 비 온 날과 비 안 온 날 비교", id:"analysis", mode:"inStore"},
  {title:"장마철 배민 파전 주문", excerpt:"우아한형제들 배달의민족의 배달 주문 건수 비교", id:"analysis", mode:"delivery"},
  {title:"편의점 전류 매출", excerpt:"이마트24 중부 지역 교동전 4종의 주간 매출액", id:"analysis", mode:"retail"},
  {title:"대전 10월 강수량", excerpt:"최근 5년 기상청 강수량과 강수일수 · 2022~2026년", id:"rainfall"},
  {title:"파전 이야기", excerpt:"빗소리와 기억, 함께 먹는 식문화에 관한 가설", id:"story"},
  {title:"강수량과 음식점 카드소비", excerpt:"한국은행의 일강수량 20mm 이상 전국 외식 소비지출 분석", id:"restaurant-spending"},
  {title:"자료 출처와 조사 범위", excerpt:"기상청, 한국은행, 티오더, 배달의민족, 이마트24 원문", id:"sources"},
  {title:"대전 조사 계획", excerpt:"일강수량별 파전 판매량과 매출액을 비교하는 방법", id:"local-study"}
];
const dialog = select("#search-dialog");
const input = select("#search-input");
function showResults() {
  const query = input.value.trim().toLocaleLowerCase("ko");
  const matches = contents.filter(item => (item.title + " " + item.excerpt).toLocaleLowerCase("ko").includes(query));
  select(".result-count").textContent = query ? (matches.length ? matches.length + "개의 검색 결과" : "검색 결과가 없습니다. 다른 단어로 검색해 보세요.") : "리포트에서 찾아보기";
  const links = matches.map(item => {
    const link = document.createElement("a");
    link.href = "#" + item.id;
    const title = document.createElement("b"), excerpt = document.createElement("small");
    title.textContent = item.title;
    excerpt.textContent = item.excerpt;
    link.append(title, excerpt);
    link.addEventListener("click", () => {
      if (item.mode) renderComparison(item.mode);
      dialog.close();
      const target = document.getElementById(item.id);
      if (target instanceof HTMLDetailsElement) target.open = true;
      target.setAttribute("tabindex", "-1");
      target.focus({preventScroll:true});
    });
    return link;
  });
  select("#results").replaceChildren(...links);
}
select(".search-open").addEventListener("click", () => {
  input.value = "";
  showResults();
  dialog.showModal();
  input.focus();
});
select(".close-search").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  const box = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
});
input.addEventListener("input", showResults);
input.addEventListener("keydown", event => {
  if (event.key === "Enter") select("#results a")?.click();
});
const menu = all("nav a");
function updateMenu() {
  const edge = select(".header").offsetHeight + Math.min(150, innerHeight * .18);
  let current = "top";
  for (const id of ["analysis", "story", "sources"]) {
    if (document.getElementById(id).getBoundingClientRect().top <= edge) current = id;
  }
  if (Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 2) current = "sources";
  for (const link of menu) {
    const active = link.hash === "#" + current;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
  }
}
window.addEventListener("scroll", updateMenu, {passive:true});
window.addEventListener("resize", updateMenu);
updateMenu();

