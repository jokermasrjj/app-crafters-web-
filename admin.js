function readStore(key, fallback = []) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("تعذر قراءة الملف"));
    reader.readAsDataURL(file);
  });
}

function renderList(containerId, key) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const items = readStore(key);
  if (!items.length) {
    container.innerHTML = `<div class="card"><p>لا توجد بيانات حالياً.</p></div>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <article class="list-item">
      <div>
        <h4>${escapeHtml(item.title || item.name)}</h4>
        <p>${escapeHtml(item.desc || item.message || "")}</p>
        ${item.image ? `<img class="thumb" src="${item.image}" alt="${escapeHtml(item.title || "")}" />` : ""}
        ${item.fileName ? `<a class="btn btn-light btn-xs" href="${item.fileData}" download="${escapeHtml(item.fileName)}">تحميل الملف</a>` : ""}
        ${item.phone ? `<small>الهاتف: ${escapeHtml(item.phone)}</small>` : ""}
      </div>
      ${key === "site_messages" ? "" : `<button data-id="${item.id}" data-key="${key}" class="delete-btn">حذف</button>`}
    </article>
  `).join("");
}

function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

function initForms() {
  const serviceForm = document.getElementById("serviceForm");
  const portfolioForm = document.getElementById("portfolioForm");
  const downloadForm = document.getElementById("downloadForm");
  const siteSettingsForm = document.getElementById("siteSettingsForm");

  const currentSettings = readStore("site_settings", defaultSettings);
  document.getElementById("siteName").value = currentSettings.name;
  document.getElementById("siteBadge").value = currentSettings.badge;
  document.getElementById("siteHeroTitle").value = currentSettings.heroTitle.replaceAll("<br />", " ");
  document.getElementById("siteHeroDesc").value = currentSettings.heroDescription;
  document.getElementById("siteAbout").value = currentSettings.about;
  document.getElementById("sitePhone").value = currentSettings.phone;
  document.getElementById("siteEmail").value = currentSettings.email;

  serviceForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("serviceTitle").value.trim();
    const desc = document.getElementById("serviceDesc").value.trim();
    const data = readStore("site_services", []);
    data.unshift({ id: Date.now(), title, desc });
    writeStore("site_services", data);
    serviceForm.reset();
    renderList("serviceList", "site_services");
  });

  portfolioForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("portfolioTitle").value.trim();
    const desc = document.getElementById("portfolioDesc").value.trim();
    const imageFile = document.getElementById("portfolioImage").files[0];
    if (!imageFile) return;

    const image = await fileToBase64(imageFile);
    const data = readStore("site_portfolio", []);
    data.unshift({ id: Date.now(), title, desc, image });
    writeStore("site_portfolio", data);
    portfolioForm.reset();
    renderList("portfolioList", "site_portfolio");
    renderStats();
  });

  downloadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("downloadTitle").value.trim();
    const desc = document.getElementById("downloadDesc").value.trim();
    const file = document.getElementById("downloadFile").files[0];
    if (!file) return;

    const fileData = await fileToBase64(file);
    const data = readStore("site_downloads", []);
    data.unshift({ id: Date.now(), title, desc, fileName: file.name, fileData });
    writeStore("site_downloads", data);
    downloadForm.reset();
    renderList("downloadsList", "site_downloads");
    renderStats();
  });

  siteSettingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const settings = {
      name: document.getElementById("siteName").value.trim(),
      badge: document.getElementById("siteBadge").value.trim(),
      heroTitle: document.getElementById("siteHeroTitle").value.trim(),
      heroDescription: document.getElementById("siteHeroDesc").value.trim(),
      about: document.getElementById("siteAbout").value.trim(),
      phone: document.getElementById("sitePhone").value.trim(),
      email: document.getElementById("siteEmail").value.trim()
    };
    writeStore("site_settings", settings);
    const msg = document.getElementById("settingsMsg");
    msg.textContent = "تم حفظ بيانات الموقع بنجاح.";
  });
}

function initDelete() {
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-btn");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const key = btn.dataset.key;
    const filtered = readStore(key).filter(item => item.id !== id);
    writeStore(key, filtered);
    if (key === "site_services") renderList("serviceList", key);
    if (key === "site_portfolio") renderList("portfolioList", key);
    if (key === "site_downloads") renderList("downloadsList", key);
    renderStats();
  });
}

function renderStats() {
  document.getElementById("servicesCount").textContent = readStore("site_services", []).length;
  document.getElementById("portfolioCount").textContent = readStore("site_portfolio", []).length;
  document.getElementById("downloadsCount").textContent = readStore("site_downloads", []).length;
  document.getElementById("messagesCount").textContent = readStore("site_messages", []).length;
}

function renderVisitsAnalytics() {
  const visits = readStore("site_visits", []);
  const visitsList = document.getElementById("visitsList");
  const visitsCount = document.getElementById("visitsCount");
  const desktopCount = document.getElementById("desktopCount");
  const mobileCount = document.getElementById("mobileCount");

  if (visitsCount) visitsCount.textContent = visits.length;
  if (desktopCount) desktopCount.textContent = visits.filter(v => v.deviceType === "Desktop").length;
  if (mobileCount) mobileCount.textContent = visits.filter(v => v.deviceType === "Mobile").length;

  if (!visitsList) return;
  if (!visits.length) {
    visitsList.innerHTML = `<div class="card"><p>لا توجد زيارات مسجلة حتى الآن.</p></div>`;
    return;
  }

  visitsList.innerHTML = `
    <table class="visits-table">
      <thead>
        <tr>
          <th>الوقت</th>
          <th>IP</th>
          <th>الجهاز</th>
          <th>المتصفح</th>
          <th>نظام التشغيل</th>
          <th>الموقع التقريبي</th>
          <th>رابط الخريطة</th>
        </tr>
      </thead>
      <tbody>
        ${visits.map((visit) => `
          <tr>
            <td>${escapeHtml(visit.visitedAt || "-")}</td>
            <td>${escapeHtml(visit.ip || "-")}</td>
            <td>${escapeHtml(visit.deviceType || "-")}</td>
            <td>${escapeHtml(visit.browser || "-")}</td>
            <td>${escapeHtml(visit.os || "-")}</td>
            <td>${escapeHtml(visit.locationLabel || "غير متاح")}</td>
            <td>${visit.mapUrl ? `<a href="${visit.mapUrl}" target="_blank" rel="noopener">فتح</a>` : "-"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function initAnalyticsActions() {
  const clearBtn = document.getElementById("clearVisitsBtn");
  if (!clearBtn) return;
  clearBtn.addEventListener("click", () => {
    writeStore("site_visits", []);
    renderVisitsAnalytics();
  });
}

function init() {
  initTabs();
  initForms();
  initDelete();
  initAnalyticsActions();
  renderStats();
  renderVisitsAnalytics();
  renderList("serviceList", "site_services");
  renderList("portfolioList", "site_portfolio");
  renderList("downloadsList", "site_downloads");
  renderList("messagesList", "site_messages");
}

init();
