/* ==========================================
   MAIN SCRIPT (Softred 001)
   ========================================== */

document.addEventListener('DOMContentLoaded', function () {

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
  // 0b. AUTO SCROLL PERLAHAN (dipakai saat "Buka Undangan" diklik)
  // ------------------------------------------
  function smoothAutoScroll(targetY, duration) {
    const htmlEl = document.documentElement;
    const previousScrollBehavior = htmlEl.style.scrollBehavior;

    // Matikan scroll-behavior:smooth CSS sementara, supaya tidak
    // bentrok/rebutan kontrol dengan animasi custom (requestAnimationFrame) ini.
    htmlEl.style.scrollBehavior = 'auto';

    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();
    let cancelled = false;

    function restoreScrollBehavior() {
      htmlEl.style.scrollBehavior = previousScrollBehavior;
    }

    function stopAutoScroll() {
      if (cancelled) return;
      cancelled = true;
      restoreScrollBehavior();
      window.removeEventListener('wheel', stopAutoScroll);
      window.removeEventListener('touchstart', stopAutoScroll);
      window.removeEventListener('pointerdown', stopAutoScroll);
      window.removeEventListener('keydown', stopAutoScroll);
    }

    // Auto-scroll langsung berhenti begitu tamu menyentuh/scroll layar sendiri
    window.addEventListener('wheel', stopAutoScroll, { passive: true });
    window.addEventListener('touchstart', stopAutoScroll, { passive: true });
    window.addEventListener('pointerdown', stopAutoScroll, { passive: true });
    window.addEventListener('keydown', stopAutoScroll);

    function step(now) {
      if (cancelled) return;

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeInOutQuad
      const eased = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        stopAutoScroll();
      }
    }

    requestAnimationFrame(step);
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
  const sideNav = document.getElementById('side-nav');
  const mainContent = document.getElementById('main-content');

  if (btnOpen) {
    btnOpen.addEventListener('click', function () {
      // 1. Animasi keluar untuk Cover Screen
      if (coverScreen) {
        coverScreen.classList.add('slide-up-fade');
      }

      // 2. Buka kunci scroll body
      document.body.classList.remove('no-scroll');
      if (mainContent) {
        mainContent.classList.remove('locked');
      }

      // 3. Tampilkan Navigasi Samping & Play Audio
      if (sideNav) {
        sideNav.classList.remove('hidden');
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
          smoothAutoScroll(Math.max(targetY, 0), 90000);
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