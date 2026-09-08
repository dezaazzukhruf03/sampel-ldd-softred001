/* ==========================================
   MAIN SCRIPT (Softred 001)
   ========================================== */

// Cegah browser mengembalikan posisi scroll terakhir saat halaman
// di-refresh/dibuka ulang — supaya web selalu mulai dari atas (Beranda).
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', function () {

  // Jaga-jaga tambahan: pastikan halaman mulai dari paling atas.
  window.scrollTo(0, 0);

  // ------------------------------------------
  // 0. FADE UP SECTION SAAT MASUK VIEWPORT
  // ------------------------------------------
  const fadeSections = document.querySelectorAll('.fade-up-section');

  if ('IntersectionObserver' in window && fadeSections.length) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    fadeSections.forEach(section => fadeObserver.observe(section));
  } else {
    // Browser lama tanpa IntersectionObserver: langsung tampilkan semua
    fadeSections.forEach(section => section.classList.add('in-view'));
  }

  // ------------------------------------------
  // 0a. REVEAL BERTAHAP UNTUK TIMELINE LOVE STORY
  //     Setiap item muncul satu-per-satu (staggered) saat masuk viewport
  // ------------------------------------------
  const timelineItems = document.querySelectorAll('.timeline-item');

  if ('IntersectionObserver' in window && timelineItems.length) {
    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          timelineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    timelineItems.forEach((item, index) => {
      // Jeda animasi bertingkat: item ke-2 & ke-3 muncul menyusul lebih lambat
      item.style.transitionDelay = (index * 0.15) + 's';
      timelineObserver.observe(item);
    });
  } else {
    timelineItems.forEach(item => item.classList.add('in-view'));
  }

  // ------------------------------------------
  // 0b. AUTO SCROLL PERLAHAN
  //     Dipakai saat "Buka Undangan" diklik, DAN oleh tombol
  //     Auto-Scroll manual (#autoscroll-btn).
  //     Auto-scroll bergerak dengan menambah posisi scroll SEDIKIT demi
  //     sedikit tiap frame (relatif), bukan memaksa ke posisi absolut —
  //     jadi kalau layar disentuh/discroll manual di tengah animasi,
  //     auto-scroll otomatis melanjutkan dari posisi baru itu (tidak
  //     dilawan/ditarik balik).
  // ------------------------------------------
  const autoScrollBtn = document.getElementById('autoscroll-btn');
  const autoScrollNotice = document.getElementById('autoscroll-notice');
  let stopActiveAutoScroll = null; // referensi fungsi stop dari sesi auto-scroll yang sedang berjalan
  let isAutoScrolling = false;

  function setAutoScrollButtonState(active) {
    isAutoScrolling = active;
    if (autoScrollNotice) {
      autoScrollNotice.classList.toggle('show', active);
    }
    if (!autoScrollBtn) return;
    autoScrollBtn.classList.toggle('active', active);
    autoScrollBtn.innerHTML = active
      ? '<i class="fa-solid fa-pause"></i>'
      : '<i class="fa-solid fa-angles-down"></i>';
    autoScrollBtn.title = active ? 'Hentikan Auto-Scroll' : 'Mulai Auto-Scroll';
  }

  // speed: kecepatan scroll dalam px per detik (semakin kecil = semakin
  // perlahan & khidmat). targetY: batas akhir scroll (opsional). Kalau
  // tidak diisi, auto-scroll akan jalan sampai paling bawah halaman.
  function startAutoScroll(targetY, speed) {
    // Jika ada sesi auto-scroll lain yang masih jalan, hentikan dulu
    if (stopActiveAutoScroll) stopActiveAutoScroll();

    const scrollSpeed = speed || 40;
    let lastTime = performance.now();
    let cancelled = false;

    function stopAutoScroll() {
      if (cancelled) return;
      cancelled = true;
      stopActiveAutoScroll = null;
      setAutoScrollButtonState(false);
    }

    stopActiveAutoScroll = stopAutoScroll;

    function step(now) {
      if (cancelled) return;

      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
      const effectiveTarget = (typeof targetY === 'number') ? Math.min(targetY, maxScroll) : maxScroll;

      // Sudah sampai (atau terlewati karena user scroll manual duluan)
      if (window.scrollY >= effectiveTarget - 1) {
        stopAutoScroll();
        return;
      }

      // Tambah posisi scroll sedikit demi sedikit dari posisi SAAT INI
      // (bukan dari posisi awal), supaya scroll manual di tengah jalan
      // tetap terpakai/tidak dilawan.
      window.scrollBy({ top: scrollSpeed * dt, left: 0, behavior: 'auto' });

      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
    setAutoScrollButtonState(true);
  }

  // Toggle manual lewat tombol di side-nav
  if (autoScrollBtn) {
    autoScrollBtn.addEventListener('click', function () {
      // Jika sedang auto-scroll, klik = berhenti
      if (isAutoScrolling && stopActiveAutoScroll) {
        stopActiveAutoScroll();
        return;
      }

      // Jika belum, klik = mulai scroll perlahan dari posisi sekarang sampai paling bawah
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
      const remaining = maxScroll - window.scrollY;

      if (remaining < 10) {
        if (typeof showToast === 'function') {
          showToast('Anda sudah berada di bagian paling bawah.');
        }
        return;
      }

      startAutoScroll(); // tanpa target = sampai paling bawah
    });
  }

  // ------------------------------------------
  // 1. URL PARAMETER CHECKER (?to=NamaTamu)
  // ------------------------------------------
  const urlParams = new URLSearchParams(window.location.search);
  const guestNameParam = urlParams.get('to');
  const guestBox = document.getElementById('guest-container');
  const guestNameEl = document.getElementById('guest-name');

  if (guestNameParam) {
    if (guestNameEl) {
      guestNameEl.innerText = guestNameParam;
    }
    if (guestBox) {
      guestBox.classList.remove('hidden');
    }
  }

  // Kunci scroll halaman saat Cover Screen aktif
  document.body.classList.add('no-scroll');

  // ------------------------------------------
  // 2. OPEN INVITATION BUTTON
  // ------------------------------------------
  const btnOpen = document.getElementById('btn-open-invitation');
  const coverScreen = document.getElementById('cover-screen');
  const floatingControls = document.getElementById('floating-controls');
  const mainContent = document.getElementById('main-content');

  if (btnOpen) {
    btnOpen.addEventListener('click', function () {
      // 0. Pastikan selalu mulai dari paling atas (Beranda), jaga-jaga
      //    kalau browser masih menyimpan posisi scroll sesi sebelumnya.
      window.scrollTo(0, 0);

      // 1. Animasi keluar untuk Cover Screen
      if (coverScreen) {
        coverScreen.classList.add('slide-up-fade');
      }

      // 2. Buka kunci scroll body
      document.body.classList.remove('no-scroll');
      if (mainContent) {
        mainContent.classList.remove('locked');
      }

      // 3. Tampilkan Tombol Musik & Navigasi Bawah, lalu Play Audio
      if (floatingControls) {
        floatingControls.classList.remove('hidden');
      }

      // Memutar musik (fungsi dari music.js)
      if (typeof playAudio === 'function') {
        playAudio();
      }

      // 4. Auto-scroll perlahan dari Beranda sampai akhir section Wedding Gift
      const giftSection = document.getElementById('gift');
      if (giftSection) {
        const targetY = giftSection.offsetTop + giftSection.offsetHeight - window.innerHeight;
        setTimeout(() => {
          startAutoScroll(Math.max(targetY, 0));
        }, 500);
      }
    });
  }

  // ------------------------------------------
  // 3. FLOATING SIDE NAVIGATION & SCROLLSPY
  // ------------------------------------------
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section.section');

  // Smooth scroll saat ikon navigasi diklik
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Highlight ikon navigasi sesuai seksi yang aktif (Scrollspy)
  window.addEventListener('scroll', function () {
    let currentSection = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = '#' + section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentSection) {
        link.classList.add('active');
      }
    });
  });

  // ------------------------------------------
  // 4. COPY REKENING TO CLIPBOARD
  // ------------------------------------------
  const copyButtons = document.querySelectorAll('.btn-copy');

  function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (err) {
      success = false;
    }

    document.body.removeChild(textarea);
    return success;
  }

  copyButtons.forEach(button => {
    const originalHTML = button.innerHTML;

    button.addEventListener('click', function () {
      const accountNumber = this.getAttribute('data-account');
      if (!accountNumber) return;

      const showCopiedState = () => {
        this.classList.add('copied');
        this.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';

        setTimeout(() => {
          this.classList.remove('copied');
          this.innerHTML = originalHTML;
        }, 1800);
      };

      const notify = (ok) => {
        if (ok) {
          showCopiedState();
        }
        const msg = ok
          ? `Nomor rekening ${accountNumber} berhasil disalin!`
          : 'Gagal menyalin nomor rekening.';

        if (typeof showToast === 'function') {
          showToast(msg);
        } else if (!ok) {
          alert(msg);
        }
      };

      // Gunakan Clipboard API jika tersedia & konteksnya aman (HTTPS/localhost)
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(accountNumber)
          .then(() => notify(true))
          .catch(() => notify(fallbackCopyText(accountNumber)));
      } else {
        // Fallback untuk hosting tanpa HTTPS / browser lama
        notify(fallbackCopyText(accountNumber));
      }
    });
  });

});