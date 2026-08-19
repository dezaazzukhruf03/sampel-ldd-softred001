(function () {

  /* =====================================================
     GOOGLE APPS SCRIPT
  ===================================================== */

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwrHji0oU0VPiLM7lhkhGMd53HvzZJplOXwqRYE-ox-z_f4rGo1FluF_EgG6mU6Bpc/exec";

  const SHEET_NAME = "Sampel";

  /* -------------------------------
     ELEMEN (ID sesuai index.html)
  -------------------------------- */
  const form = document.getElementById("rsvp-form");
  const list = document.getElementById("wishes-list");
  const rsvpName = document.getElementById("nama");
  const rsvpStatus = document.getElementById("kehadiran");
  const rsvpMessage = document.getElementById("ucapan");

  /* -------------------------------
     HELPER
  -------------------------------- */
  const escapeHtml = (str) => {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Format tanggal saja (tanpa jam), contoh: "16 Agustus 2026"
  const formatDate = (value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  /* --------------------------------
     STATISTIK RSVP (opsional, aman jika elemen belum ada di HTML)
  -------------------------------- */
  const updateRsvpStatistics = (data) => {
    const statHadir = document.getElementById("statHadir");
    const statTidakHadir = document.getElementById("statTidakHadir");
    const statRagu = document.getElementById("statRagu");
    const statTotal = document.getElementById("statTotal");

    if (!statHadir || !statTidakHadir || !statRagu || !statTotal) return;

    let hadir = 0, tidakHadir = 0, ragu = 0;

    if (Array.isArray(data)) {
      data.forEach((item) => {
        const status = String(item.kehadiran || "").trim().toLowerCase();
        if (status === "hadir") hadir++;
        else if (status === "tidak hadir") tidakHadir++;
        else if (status === "masih ragu" || status === "ragu") ragu++;
      });
    }

    const total = hadir + tidakHadir + ragu;
    statHadir.textContent = hadir;
    statTidakHadir.textContent = tidakHadir;
    statRagu.textContent = ragu;
    statTotal.textContent = total;
  };

  /* --------------------------------
     RENDER UCAPAN (pakai class CSS yang sudah ada)
  -------------------------------- */
  let allWishesData = [];
  const WISH_PAGE_SIZE = 3;
  let wishVisibleCount = WISH_PAGE_SIZE;

  const renderWishes = (data) => {
    if (!list) return;

    if (!Array.isArray(data) || data.length === 0) {
      list.innerHTML = `<p class="wish-empty">Belum ada ucapan. Jadilah yang pertama mengirim doa.</p>`;
      updateRsvpStatistics([]);
      return;
    }

    updateRsvpStatistics(data);

    allWishesData = data.slice().reverse();
    wishVisibleCount = WISH_PAGE_SIZE;
    renderWishPage();
  };

  const renderWishPage = () => {
    const visible = allWishesData.slice(0, wishVisibleCount);

    const badgeClassFor = (kehadiran) =>
      kehadiran === "Hadir" ? "wish-badge" : "wish-badge tidak-hadir";

    const itemsHtml = visible.map((item) => `
      <div class="wish-item">
        <div class="wish-header">
          <span class="wish-name">${escapeHtml(item.nama)}</span>
          <span class="${badgeClassFor(item.kehadiran)}">${escapeHtml(item.kehadiran)}</span>
        </div>
        ${item.ucapan ? `<p class="wish-text">${escapeHtml(item.ucapan)}</p>` : ""}
        ${item.waktu ? `<small class="wish-time">${formatDate(item.waktu)}</small>` : ""}
      </div>
    `).join("");

    const hasMore = allWishesData.length > wishVisibleCount;

    list.innerHTML = itemsHtml + (
      hasMore
        ? `<button type="button" id="wishLoadMore" class="wish-load-more">
             Muat Ucapan Lainnya (${allWishesData.length - wishVisibleCount})
           </button>`
        : ""
    );

    const loadMoreBtn = document.getElementById("wishLoadMore");
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        wishVisibleCount += WISH_PAGE_SIZE;
        renderWishPage();
      });
    }
  };

  /* --------------------------------
     LOAD UCAPAN DARI GOOGLE SHEETS (JSONP)
  -------------------------------- */
  const loadWishes = () => {
    if (!list) return;

    const callbackName = "__dezaLaraCallback_" + Date.now();
    const script = document.createElement("script");

    window[callbackName] = (data) => {
      try {
        if (data && data.success === false) {
          console.error("Apps Script:", data.message);
          return;
        }
        renderWishes(data);
      } finally {
        delete window[callbackName];
        script.remove();
      }
    };

    script.onerror = () => {
      console.error("Gagal mengambil data ucapan dari Google Sheets.");
      delete window[callbackName];
      script.remove();
    };

    script.src =
      SCRIPT_URL +
      "?sheet=" + encodeURIComponent(SHEET_NAME) +
      "&callback=" + encodeURIComponent(callbackName) +
      "&t=" + Date.now();

    document.body.appendChild(script);

    setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName];
        script.remove();
        console.warn("Request ucapan timeout.");
      }
    }, 10000);
  };

  /* --------------------------------
     KIRIM DATA KE GOOGLE SHEETS (hidden iframe, hindari CORS)
  -------------------------------- */
  const submitToGoogleSheets = (data) => {
    return new Promise((resolve) => {
      const iframeName = "dezaLaraSubmit_" + Date.now();

      const iframe = document.createElement("iframe");
      iframe.name = iframeName;
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      const submitForm = document.createElement("form");
      submitForm.method = "POST";
      submitForm.action = SCRIPT_URL;
      submitForm.target = iframeName;
      submitForm.style.display = "none";

      Object.entries(data).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value ?? "";
        submitForm.appendChild(input);
      });

      document.body.appendChild(submitForm);

      let finished = false;

      const cleanup = () => {
        submitForm.remove();
        setTimeout(() => iframe.remove(), 500);
      };

      const success = () => {
        if (finished) return;
        finished = true;
        cleanup();
        resolve();
      };

      iframe.addEventListener("load", success, { once: true });

      submitForm.submit();

      setTimeout(() => {
        if (!finished) success();
      }, 3000);
    });
  };

  /* --------------------------------
     SUBMIT RSVP
  -------------------------------- */
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = rsvpName ? rsvpName.value.trim() : "";
      const status = rsvpStatus ? rsvpStatus.value : "";
      const msg = rsvpMessage ? rsvpMessage.value.trim() : "";

      if (!name || !status || !msg) {
        showToast("Mohon lengkapi semua kolom form.");
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';
      }

      try {
        const data = {
          sheet: SHEET_NAME,
          nama: name,
          kehadiran: status,
          ucapan: msg
        };

        await submitToGoogleSheets(data);

        form.reset();
        showToast("Terima kasih, RSVP dan ucapan Anda berhasil dikirim.");

        setTimeout(() => loadWishes(), 1000);

      } catch (error) {
        console.error("Gagal mengirim RSVP:", error);
        showToast("Maaf, ucapan belum berhasil dikirim. Silakan coba lagi.");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Ucapan';
        }
      }
    });
  }

  /* --------------------------------
     TOAST NOTIFIKASI GLOBAL
  -------------------------------- */
  window.showToast = window.showToast || function (msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  /* --------------------------------
     LOAD UCAPAN SAAT WEBSITE DIBUKA
  -------------------------------- */
  loadWishes();

})();