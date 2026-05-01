/* ============================================================
   UNDANGAN PERNIKAHAN — script.js
   Raka & Nadia  |  Version 2.0
   ============================================================ */

const CONFIG = {
  couple: { groom: "Raka Saputra", bride: "Nadia Permata" },
  storageKey: "wedding_wishes_v2_raka_nadia",
  baseUrl: window.location.origin + window.location.pathname,
};

// ── URL Param ──
function getGuestName() {
  const p = new URLSearchParams(window.location.search);
  return p.get("to") || p.get("nama") || "";
}

// ── Init ──
document.addEventListener("DOMContentLoaded", () => {
  const name = getGuestName();
  if (name) showGuestOnCover(name);
  spawnPetals("petals-bg", 16);
  loadWishes();
  initCountdowns();
});

function showGuestOnCover(name) {
  const el = document.getElementById("guestDisplay");
  const nameEl = document.getElementById("guestNameCover");
  if (el) el.style.display = "block";
  if (nameEl) nameEl.textContent = decodeURIComponent(name);
}

// ── Open Invitation ──
function openInvitation() {
  const trans = document.getElementById("pageTransition");
  const guest = getGuestName();

  trans.classList.add("open");

  setTimeout(() => {
    document.getElementById("cover-page").classList.add("hidden");
    const inv = document.getElementById("invitation-page");
    inv.classList.remove("hidden");

    // Set guest name in invitation
    const guestEl = document.getElementById("guestNameInv");
    if (guestEl) {
      guestEl.textContent = guest
        ? decodeURIComponent(guest)
        : "Seluruh Tamu Undangan";
    }

    spawnPetals("petals-inv", 20);
    spawnPetals("petals-hero", 10);
    initScrollReveal();
    initSectionObserver();

    trans.classList.remove("open");
    trans.classList.add("close");

    // Auto-play music – inside user-gesture chain (click on button)
    setTimeout(startMusic, 500);
    setTimeout(() => trans.classList.remove("close"), 1000);
  }, 550);
}

// ── Music ──
let musicPlaying = false;

function startMusic() {
  const audio = document.getElementById("bgMusic");
  if (!audio) return;
  audio.volume = 0.38;
  audio.play()
    .then(() => { musicPlaying = true; updateMusicUI(); })
    .catch(err => console.warn("Autoplay blocked:", err));
}

function toggleMusic() {
  const audio = document.getElementById("bgMusic");
  if (!audio) return;
  if (musicPlaying) {
    audio.pause();
    musicPlaying = false;
  } else {
    audio.play().catch(() => { });
    musicPlaying = true;
  }
  updateMusicUI();
}

function updateMusicUI() {
  const btn = document.getElementById("musicBtn");
  const icon = document.getElementById("musicIcon");
  if (!btn) return;
  if (musicPlaying) {
    btn.classList.add("playing");
    if (icon) icon.textContent = "♫";
  } else {
    btn.classList.remove("playing");
    if (icon) icon.textContent = "♪";
  }
}

// ── Petals ──
function spawnPetals(containerId, count) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  const colors = [
    ["#E8BABA", "#C27B7B"],
    ["#B8D4C0", "#7A9E87"],
    ["#F2DADA", "#DCA8A8"],
    ["#EBE0D0", "#C5B5A0"],
  ];

  for (let i = 0; i < count; i++) {
    const petal = document.createElement("div");
    petal.className = "petal";
    const [c1, c2] = colors[Math.floor(Math.random() * colors.length)];
    const size = 5 + Math.random() * 9;
    const left = Math.random() * 100;
    const dur = 7 + Math.random() * 10;
    const delay = Math.random() * 12;
    const shape = Math.random() > 0.5 ? "50% 0 50% 0" : "50% 50% 0 50%";

    petal.style.cssText = `
      width:${size}px; height:${size * 1.25}px;
      left:${left}%;
      animation-duration:${dur}s;
      animation-delay:-${delay}s;
      background:radial-gradient(ellipse at 30% 30%, ${c1}, ${c2});
      border-radius:${shape};
      transform:rotate(${Math.random() * 360}deg);
    `;
    container.appendChild(petal);
  }
}

// ── Countdowns ──
function initCountdowns() {
  function tick() {
    document.querySelectorAll(".countdown").forEach(el => {
      const target = new Date(el.dataset.target);
      const diff = target - new Date();
      if (diff <= 0) {
        el.querySelectorAll(".cd-n").forEach(n => n.textContent = "00");
        return;
      }
      const map = {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      };
      Object.entries(map).forEach(([u, v]) => {
        const n = el.querySelector(`.cd-n[data-unit="${u}"]`);
        if (n) n.textContent = String(v).padStart(2, "0");
      });
    });
  }
  tick();
  setInterval(tick, 1000);
}

// ── Scroll Reveal ──
function initScrollReveal() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("visible");
    }),
    { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
  );
  document.querySelectorAll(".scroll-reveal").forEach(el => obs.observe(el));
}

// ── Section Observer for nav dots ──
function initSectionObserver() {
  const sections = ["hero", "couple", "lovestory", "event", "gallery", "hadiah", "wishes"];
  const dots = document.querySelectorAll(".nd");

  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = sections.indexOf(e.target.id);
        if (idx === -1) return;
        dots.forEach((d, i) => d.classList.toggle("active", i === idx));
      }
    }),
    { threshold: 0.3 }
  );

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// ── Copy Rekening ──
function copyRek(id, btn) {
  const norek = document.getElementById(id).textContent.replace(/\s/g, "");
  navigator.clipboard.writeText(norek).then(() => {
    const orig = btn.textContent;
    btn.textContent = "✓ Tersalin!";
    btn.classList.add("copied");
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = orig;
      btn.classList.remove("copied");
      btn.disabled = false;
    }, 2200);
  }).catch(() => {
    btn.textContent = "Salin manual: " + norek;
  });
}

// ── Wishes ──
function loadWishes() {
  try {
    const data = localStorage.getItem(CONFIG.storageKey);
    if (!data) return;
    JSON.parse(data).forEach(w => renderWish(w, false));
  } catch (_) { }
}

function submitWish(e) {
  e.preventDefault();
  const name = document.getElementById("wishName").value.trim();
  const attend = document.getElementById("wishAttend").value;
  const message = document.getElementById("wishMessage").value.trim();
  if (!name) return;

  const wish = {
    name, attend, message,
    time: new Date().toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
  };

  // Save
  try {
    const stored = localStorage.getItem(CONFIG.storageKey);
    const list = stored ? JSON.parse(stored) : [];
    list.unshift(wish);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(list.slice(0, 60)));
  } catch (_) { }

  renderWish(wish, true);
  confetti();

  document.getElementById("wishName").value = "";
  document.getElementById("wishMessage").value = "";
}

function renderWish(wish, prepend) {
  const list = document.getElementById("wishesList");
  if (!list) return;

  const labels = { hadir: "✅ Hadir", tidak: "❌ Tidak Hadir", ragu: "🤔 Ragu" };
  const cls = wish.attend || "hadir";

  const el = document.createElement("div");
  el.className = "wish-item";
  el.innerHTML = `
    <div class="wi-top">
      <span class="wi-name">${esc(wish.name)}</span>
      <span class="wi-badge ${cls}">${labels[cls] || ""}</span>
    </div>
    ${wish.message ? `<p class="wi-msg">${esc(wish.message)}</p>` : ""}
    <p class="wi-time">${wish.time}</p>
  `;

  if (prepend && list.firstChild) list.insertBefore(el, list.firstChild);
  else list.appendChild(el);
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Confetti ──
function confetti() {
  const colors = ["#C27B7B", "#E8BABA", "#7A9E87", "#B8D4C0", "#EBE0D0", "#fff"];
  for (let i = 0; i < 38; i++) {
    const dot = document.createElement("div");
    const size = 6 + Math.random() * 7;
    const angle = Math.random() * 360;
    const dist = 70 + Math.random() * 110;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rad = (angle * Math.PI) / 180;

    dot.style.cssText = `
      position:fixed; width:${size}px; height:${size}px;
      background:${color}; border-radius:${Math.random() > .5 ? "50%" : "3px"};
      top:50%; left:50%; z-index:9998; pointer-events:none;
      transform:translate(-50%,-50%);
      transition:transform 0.7s ease-out, opacity 0.7s ease-out;
    `;
    document.body.appendChild(dot);

    requestAnimationFrame(() => {
      dot.style.transform = `translate(calc(-50% + ${Math.cos(rad) * dist}px), calc(-50% + ${Math.sin(rad) * dist}px))`;
      dot.style.opacity = "0";
    });
    setTimeout(() => dot.remove(), 750);
  }
}

// ── Toast ──
function showToast(msg) {
  let toast = document.getElementById("_toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "_toast";
    toast.style.cssText = `
      position:fixed; bottom:4rem; left:50%; transform:translateX(-50%) translateY(20px);
      background:#3D2B22; color:#F2DADA;
      font-family:'Jost',sans-serif; font-size:0.8rem; letter-spacing:0.1em;
      padding:0.7rem 1.6rem; border-radius:30px;
      border:1px solid rgba(194,123,123,0.4);
      z-index:9999; opacity:0; pointer-events:none;
      transition:opacity 0.3s ease, transform 0.3s ease;
      box-shadow:0 8px 28px rgba(61,43,34,0.35);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
  }, 2600);
}
