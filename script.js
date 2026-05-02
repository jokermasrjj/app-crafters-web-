const defaultServices = [
  { id: 1, title: "تطوير مواقع الشركات", desc: "تصميم وتنفيذ مواقع سريعة وآمنة تدعم النمو والتسويق." },
  { id: 2, title: "تصميم تطبيقات ويب", desc: "لوحات تحكم وواجهات استخدام حديثة مع تجربة مستخدم مميزة." },
  { id: 3, title: "برامج كاشير متخصصة", desc: "أنظمة بيع وإدارة مخزون وتقارير مناسبة للمحلات." }
];

const defaultPortfolio = [
  { id: 1, title: "نظام كاشير متكامل", desc: "نظام نقاط بيع مع فواتير وطباعة وتقارير يومية.", image: "" },
  { id: 2, title: "منصة حجز أونلاين", desc: "تطبيق ويب لإدارة الطلبات والمواعيد والدفع.", image: "" }
];

function getData(key, fallback) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
}

const defaultSettings = {
  name: "ProCode",
  badge: "حلول تقنية متكاملة",
  heroTitle: "نبني مواقع وتطبيقات ويب احترافية <br />ونطور برامج كاشير ذكية",
  heroDescription: "فريقنا يساعدك تنقل شغلك لمستوى أعلى من خلال حلول سريعة، آمنة، وسهلة الإدارة.",
  about: "نحو حلول تقنية عملية تدعم نمو مشروعك.",
  phone: "01000000000",
  email: "info@procode.com"
};

function escapeHtml(text = "") {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderCards(targetId, items, type = "default") {
  const box = document.getElementById(targetId);
  if (!box) return;
  if (!items.length) {
    box.innerHTML = `<article class="card"><p>لا توجد بيانات حالياً.</p></article>`;
    return;
  }

  if (type === "portfolio") {
    box.innerHTML = items.map(item => `
      <article class="card">
        ${item.image ? `<img class="portfolio-image" src="${item.image}" alt="${escapeHtml(item.title)}" />` : ""}
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.desc)}</p>
      </article>
    `).join("");
    return;
  }

  if (type === "downloads") {
    box.innerHTML = items.map(item => `
      <article class="card">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.desc)}</p>
        <a class="btn btn-primary download-btn" href="${item.fileData}" download="${escapeHtml(item.fileName)}">تحميل الملف</a>
      </article>
    `).join("");
    return;
  }

  box.innerHTML = items.map(item => `
    <article class="card">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.desc)}</p>
    </article>
  `).join("");
}

const services = getData("site_services", defaultServices);
const portfolio = getData("site_portfolio", defaultPortfolio);
const downloads = getData("site_downloads", []);
const settings = getData("site_settings", defaultSettings);

renderCards("servicesGrid", services);
renderCards("portfolioGrid", portfolio, "portfolio");
renderCards("downloadsGrid", downloads, "downloads");

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function applySiteSettings(data) {
  setText("heroBadge", data.badge);
  const heroTitle = document.getElementById("heroTitle");
  if (heroTitle) heroTitle.innerHTML = data.heroTitle;
  setText("heroDescription", data.heroDescription);

  const siteLogo = document.getElementById("siteLogo");
  if (siteLogo) siteLogo.textContent = data.name;

  const contactLogo = document.getElementById("contactLogo");
  if (contactLogo) contactLogo.textContent = data.name;

  setText("footerCompanyName", data.name);
  setText("footerAbout", data.about);
  setText("footerPhone", `الهاتف: ${data.phone}`);
  setText("footerENG", `ENG: ${data.eng}`);
  setText("footerEmail", `البريد: ${data.email}`);
  setText("copyrightName", data.name);

  setText("contactCompanyName", data.name);
  setText("contactAbout", data.about);
  setText("contactPhone", `الهاتف: ${data.phone}`);
  setText("contactEmail", `البريد: ${data.email}`);
}

applySiteSettings(settings);

function detectDeviceType() {
  const ua = navigator.userAgent || "";
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? "Mobile" : "Desktop";
}

function detectBrowser() {
  const ua = navigator.userAgent || "";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  return "Unknown";
}

function detectOS() {
  const ua = navigator.userAgent || "";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Linux")) return "Linux";
  return "Unknown";
}

async function getVisitorNetworkData() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) throw new Error("network");
    const data = await response.json();
    const hasCoords = typeof data.latitude === "number" && typeof data.longitude === "number";
    return {
      ip: data.ip || "Unknown",
      city: data.city || "",
      country: data.country_name || "",
      locationLabel: [data.city, data.country_name].filter(Boolean).join(" - ") || "غير متاح",
      mapUrl: hasCoords ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}` : ""
    };
  } catch (_error) {
    return {
      ip: "Unknown",
      city: "",
      country: "",
      locationLabel: "غير متاح",
      mapUrl: ""
    };
  }
}

async function trackVisit() {
  if (document.body.classList.contains("admin-body")) return;
  const nowKey = new Date().toDateString();
  const lastVisitKey = sessionStorage.getItem("visit_logged_date");
  if (lastVisitKey === nowKey) return;

  const network = await getVisitorNetworkData();
  const visits = getData("site_visits", []);
  visits.unshift({
    id: Date.now(),
    visitedAt: new Date().toLocaleString("ar-EG"),
    ip: network.ip,
    city: network.city,
    country: network.country,
    locationLabel: network.locationLabel,
    mapUrl: network.mapUrl,
    deviceType: detectDeviceType(),
    browser: detectBrowser(),
    os: detectOS(),
    page: window.location.pathname
  });

  localStorage.setItem("site_visits", JSON.stringify(visits.slice(0, 300)));
  sessionStorage.setItem("visit_logged_date", nowKey);
}

function initCodeRain() {
  const canvas = document.getElementById("codeRainCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const glyphs = "01{}[]<>/$#=+-*functionconstletvar()=>importexportclass";
  const fontSize = 12;
  let columns = 0;
  let drops = [];
  let rafId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.max(1, Math.floor(canvas.width / fontSize));
    drops = Array(columns).fill(0).map(() => Math.random() * -120);
  }

  function drawFrame() {
    ctx.fillStyle = "rgba(8, 14, 28, 0.09)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#22d3ee";
    ctx.font = `${fontSize}px Consolas, monospace`;

    for (let i = 0; i < drops.length; i += 1) {
      const char = glyphs[Math.floor(Math.random() * glyphs.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.95) {
        drops[i] = 0;
      } else {
        drops[i] += 1.35;
      }
    }

    rafId = window.requestAnimationFrame(drawFrame);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  drawFrame();

  window.addEventListener("beforeunload", () => {
    if (rafId) window.cancelAnimationFrame(rafId);
  });
}

initCodeRain();
trackVisit();

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();

    const messages = getData("site_messages", []);
    messages.unshift({
      id: Date.now(),
      name,
      phone,
      message,
      date: new Date().toLocaleString("ar-EG")
    });
    localStorage.setItem("site_messages", JSON.stringify(messages));

    contactForm.reset();
    const msg = document.getElementById("formMsg");
    msg.textContent = "تم إرسال رسالتك بنجاح، هنرد عليك قريبًا.";
  });
}
