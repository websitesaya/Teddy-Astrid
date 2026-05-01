/* ============================================================
   UNDANGAN PERNIKAHAN — script.js
   Raka & Nadia  |  Version 3.0
   Dengan Supabase untuk penyimpanan ucapan permanen
   ============================================================ */

// ── KONFIGURASI — WAJIB DIISI ──────────────────────────────
const CONFIG = {
  couple: {
    groom: "Raka Saputra",
    bride: "Nadia Permata",
  },

  // Ganti dengan kredensial Supabase Anda
  // Daftar gratis di: https://supabase.com
  supabase: {
    url: "https://XXXX.supabase.co",       // ← Ganti dengan Project URL Anda
    key: "eyJhbGciOiJIUzI1NiIsInR5...",    // ← Ganti dengan anon/public key Anda
  },
};
// ────────────────────────────────────────────────────────────


// ── SUPABASE HELPER ─────────────────────────────────────────
const db = {
  headers: {
    "apikey": CONFIG.supabase.key,
    "Authorization": "Bearer " + CONFIG.supabase.key,
    "Content-Type": "application/json",
  },

  async getWishes() {
    try {
      const res = await fetch(
        `${CONFIG.supabase.url}/rest/v1/wishes?order=created_at.desc&limit=100`,
        { headers: db.headers }
      );
      if (!res.ok) throw new Error("Gagal memuat ucapan");
      return await res.json();
    } catch (err) {
      console.error("loadWishes error:", err);
      return [];
    }
  },

  async addWish(name, attend, message) {
    try {
      const res = await fetch(
        `${CONFIG.supabase.url}/rest/v1/wishes`,
        {
          method: "POST",
          headers: { ...db.headers, "Prefer": "return=representation" },
          body: JSON.stringify({ name, attend, message }),
        }
      );
      if (!res.ok) throw new Error("Gagal menyimpan ucapan");
      const data = await res.json();
      return data[0] || null;
    } catch (err) {
      console.error("addWish error:", err);
      return null;
    }
  },

  async deleteWish(id) {
    try {
      const res = await fetch(
        `${CONFIG.supabase.url}/rest/v1/wishes?id=eq.${id}`,
        { method: "DELETE", headers: db.headers }
      );
      return res.ok;
    } catch (err) {
      console.error("deleteWish error:", err);
      return false;
    }
  },
};
// ────────────────────────────────────────────────────────────


// ── URL PARAM: Nama Tamu dari Link ───────────────────────────
function getGuestName() {
  const p = new URLSearchParams(window.location.search);
  return p.get("to") || p.get("nama") || "";
}


// ── INISIALISASI UTAMA ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const name = getGuestName();
  if (name) showGuestOnCover(name);

  spawnPetals("petals-bg", 16);
  loadWishes();
  initCountdowns();
});

function showGuestOnCover(name) {
  const el     = document.getElementById("guestDisplay");
  const nameEl = document.getElementById("guestNameCover");
  if (el)     el.style.display = "block";
  if (nameEl) nameEl.textContent = decodeURIComponent(name);
}


// ── BUKA UNDANGAN ────────────────────────────────────────────
function openInvitation() {
  const trans = document.getElementById("pageTransition");
  const guest = getGuestName();

  trans.classList.add("open");

  setTimeout(() => {
    document.getElementById("cover-page").classList.add("hidden");

    const inv = document.getElementById("invitation-page");
    inv.classList.remove("hidden");

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

    setTimeout(startMusic, 500);
    setTimeout(() => trans.classList.remove("close"), 1000);
  }, 550);
}


// ── MUSIK ────────────────────────────────────────────────────
let musicPlaying = false;

function startMusic() {
  const audio = document.getElementById("bgMusic");
  if (!audio) return;
  audio.volume = 0.38;
  audio
    .play()
    .then(() => {
      musicPlaying = true;
      updateMusicUI();
    })
    .catch(err => console.warn("Autoplay diblokir browser:", err));
}

function toggleMusic() {
  const audio = document.getElementById("bgMusic");
  if (!audio) return;
  if (musicPlaying) {
    audio.pause();
    musicPlaying = false;
  } else {
    audio.play().catch(() => {});
    musicPlaying = true;
  }
  updateMusicUI();
}

function updateMusicUI() {
  const btn  = document.getElementById("musicBtn");
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


// ── KELOPAK BUNGA (PETALS) ───────────────────────────────────
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
    const petal      = document.createElement("div");
    petal.className  = "petal";
    const [c1, c2]   = colors[Math.floor(Math.random() * colors.length)];
    const size       = 5 + Math.random() * 9;
    const left       = Math.random() * 100;
    const dur        = 7 + Math.random() * 10;
    const delay      = Math.random() * 12;
    const shape      = Math.random() > 0.5 ? "50% 0 50% 0" : "50% 50% 0 50%";

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


// ── COUNTDOWN ────────────────────────────────────────────────
function initCountdowns() {
  function tick() {
    document.querySelectorAll(".countdown").forEach(el => {
      const target = new Date(el.dataset.target);
      const diff   = target - new Date();

      if (diff <= 0) {
        el.querySelectorAll(".cd-n").forEach(n => (n.textContent = "00"));
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


// ── SCROLL REVEAL ────────────────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver(
    entries =>
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("visible");
      }),
    { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
  );
  document.querySelectorAll(".scroll-reveal").forEach(el => obs.observe(el));
}


// ── NAVIGASI DOT ─────────────────────────────────────────────
function initSectionObserver() {
  const sections = ["hero", "couple", "lovestory", "event", "gallery", "hadiah", "wishes"];
  const dots     = document.querySelectorAll(".nd");

  const obs = new IntersectionObserver(
    entries =>
      entries.forEach(e => {
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


// ── SALIN NOMOR REKENING ─────────────────────────────────────
function copyRek(id, btn) {
  const norek = document.getElementById(id).textContent.replace(/\s/g, "");
  navigator.clipboard
    .writeText(norek)
    .then(() => {
      const orig = btn.textContent;
      btn.textContent = "✓ Tersalin!";
      btn.classList.add("copied");
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove("copied");
        btn.disabled = false;
      }, 2200);
    })
    .catch(() => {
      btn.textContent = "Salin manual: " + norek;
    });
}


// ── UCAPAN & DOA — SUPABASE ──────────────────────────────────

/**
 * Muat semua ucapan dari Supabase saat halaman dibuka.
 * Ucapan bersifat permanen dan terlihat oleh semua tamu.
 */
async function loadWishes() {
  const list = document.getElementById("wishesList");
  if (!list) return;

  // Tampilkan loading state
  list.innerHTML = `
    <div class="wish-loading" style="text-align:center;padding:1.5rem;opacity:0.5;font-size:0.85rem;letter-spacing:0.08em;">
      Memuat ucapan...
    </div>`;

  const wishes = await db.getWishes();

  list.innerHTML = ""; // Bersihkan loading

  if (wishes.length === 0) {
    list.innerHTML = `
      <div class="wish-empty" style="text-align:center;padding:1.5rem;opacity:0.5;font-size:0.85rem;letter-spacing:0.08em;">
        Belum ada ucapan. Jadilah yang pertama! 🌸
      </div>`;
    return;
  }

  wishes.forEach(w => renderWish(w, false));
}

/**
 * Kirim ucapan baru ke Supabase.
 * Ucapan langsung muncul di halaman tanpa perlu refresh.
 */
async function submitWish(e) {
  e.preventDefault();

  const nameEl    = document.getElementById("wishName");
  const attendEl  = document.getElementById("wishAttend");
  const messageEl = document.getElementById("wishMessage");
  const submitBtn = e.target.querySelector('button[type="submit"]') || document.querySelector(".wish-submit-btn");

  const name    = nameEl.value.trim();
  const attend  = attendEl ? attendEl.value : "hadir";
  const message = messageEl ? messageEl.value.trim() : "";

  if (!name) {
    showToast("Nama tidak boleh kosong 🌸");
    nameEl.focus();
    return;
  }

  // Nonaktifkan tombol saat mengirim
  if (submitBtn) {
    submitBtn.disabled    = true;
    submitBtn.textContent = "Mengirim...";
  }

  const saved = await db.addWish(name, attend, message);

  // Aktifkan kembali tombol
  if (submitBtn) {
    submitBtn.disabled    = false;
    submitBtn.textContent = "KIRIM UCAPAN ✦";
  }

  if (!saved) {
    showToast("Gagal mengirim ucapan, coba lagi 🙏");
    return;
  }

  // Hapus placeholder "Belum ada ucapan" jika ada
  const empty = document.querySelector(".wish-empty");
  if (empty) empty.remove();

  // Render ucapan baru di paling atas
  renderWish(saved, true);
  confetti();
  showToast("Ucapan terkirim! Terima kasih 🌸");

  // Reset form
  nameEl.value = "";
  if (messageEl) messageEl.value = "";
}

/**
 * Render satu ucapan ke daftar.
 * @param {Object} wish  - Data ucapan (dari Supabase atau form)
 * @param {boolean} prepend - true = tambah di atas, false = di bawah
 */
function renderWish(wish, prepend) {
  const list = document.getElementById("wishesList");
  if (!list) return;

  const labels = {
    hadir: "✅ Hadir",
    tidak: "❌ Tidak Hadir",
    ragu:  "🤔 Ragu",
  };

  const cls  = wish.attend || "hadir";
  const time = wish.created_at
    ? new Date(wish.created_at).toLocaleString("id-ID", {
        day:    "numeric",
        month:  "long",
        year:   "numeric",
        hour:   "2-digit",
        minute: "2-digit",
      })
    : wish.time || "";

  const el        = document.createElement("div");
  el.className    = "wish-item";
  el.dataset.id   = wish.id || "";

  el.innerHTML = `
    <div class="wi-top">
      <span class="wi-name">${esc(wish.name)}</span>
      <span class="wi-badge ${cls}">${labels[cls] || ""}</span>
    </div>
    ${wish.message ? `<p class="wi-msg">${esc(wish.message)}</p>` : ""}
    <p class="wi-time">${time}</p>
  `;

  if (prepend && list.firstChild) list.insertBefore(el, list.firstChild);
  else list.appendChild(el);
}

/**
 * Hapus ucapan berdasarkan ID (untuk admin).
 * Gunakan di konsol browser: deleteWishById(123)
 * ID bisa dilihat di Supabase Dashboard → Table Editor → wishes
 */
async function deleteWishById(id) {
  const ok = await db.deleteWish(id);
  if (ok) {
    // Hapus dari tampilan
    const el = document.querySelector(`.wish-item[data-id="${id}"]`);
    if (el) el.remove();
    console.log(`✅ Ucapan ID ${id} berhasil dihapus.`);
    showToast("Ucapan dihapus ✓");
  } else {
    console.error(`❌ Gagal menghapus ucapan ID ${id}.`);
  }
}

/**
 * Tampilkan semua ID ucapan di konsol (untuk mengetahui ID sebelum menghapus).
 * Gunakan di konsol browser: listWishIds()
 */
async function listWishIds() {
  const wishes = await db.getWishes();
  if (wishes.length === 0) {
    console.log("Tidak ada ucapan.");
    return;
  }
  console.table(wishes.map(w => ({
    id:      w.id,
    nama:    w.name,
    ucapan:  w.message,
    waktu:   w.created_at,
  })));
}


// ── SANITASI HTML (XSS Prevention) ───────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#039;");
}


// ── KONFETI ──────────────────────────────────────────────────
function confetti() {
  const colors = ["#C27B7B", "#E8BABA", "#7A9E87", "#B8D4C0", "#EBE0D0", "#fff"];

  for (let i = 0; i < 38; i++) {
    const dot   = document.createElement("div");
    const size  = 6 + Math.random() * 7;
    const angle = Math.random() * 360;
    const dist  = 70 + Math.random() * 110;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rad   = (angle * Math.PI) / 180;

    dot.style.cssText = `
      position:fixed; width:${size}px; height:${size}px;
      background:${color}; border-radius:${Math.random() > 0.5 ? "50%" : "3px"};
      top:50%; left:50%; z-index:9998; pointer-events:none;
      transform:translate(-50%,-50%);
      transition:transform 0.7s ease-out, opacity 0.7s ease-out;
    `;
    document.body.appendChild(dot);

    requestAnimationFrame(() => {
      dot.style.transform = `translate(calc(-50% + ${Math.cos(rad) * dist}px), calc(-50% + ${Math.sin(rad) * dist}px))`;
      dot.style.opacity   = "0";
    });

    setTimeout(() => dot.remove(), 750);
  }
}


// ── TOAST NOTIFIKASI ─────────────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById("_toast");

  if (!toast) {
    toast    = document.createElement("div");
    toast.id = "_toast";
    toast.style.cssText = `
      position:fixed; bottom:4rem; left:50%;
      transform:translateX(-50%) translateY(20px);
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
    toast.style.opacity   = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity   = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
  }, 2600);
}


/* ============================================================
   PANDUAN SETUP SUPABASE
   ============================================================

   1. Daftar gratis di https://supabase.com → Buat project baru

   2. Buka SQL Editor di Supabase, lalu jalankan query ini:

      create table wishes (
        id         serial primary key,
        name       text not null,
        attend     text default 'hadir',
        message    text,
        created_at timestamptz default now()
      );

      alter table wishes enable row level security;

      create policy "Semua bisa baca"
        on wishes for select using (true);

      create policy "Semua bisa tulis"
        on wishes for insert with check (true);

   3. Buka Settings → API di Supabase:
      - Salin "Project URL"  → isi di CONFIG.supabase.url
      - Salin "anon public"  → isi di CONFIG.supabase.key

   4. Untuk MENGHAPUS ucapan:
      - Buka konsol browser (F12)
      - Ketik: listWishIds()    → lihat semua ID ucapan
      - Ketik: deleteWishById(123)  → ganti 123 dengan ID yang ingin dihapus

   ============================================================ */
