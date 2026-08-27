/* ==========================================
   LIGHTBOX SCRIPT
   Modal fullscreen untuk galeri foto: navigasi tombol,
   navigasi keyboard, dan gesture geser (swipe) kiri/kanan.
   Elemen pemicu (.lightbox-trigger) di-bind lewat gallery.js
   yang memanggil window.openLightbox(index).
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  const triggers = document.querySelectorAll('.lightbox-trigger');
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');

  let currentIndex = 0;
  const imageSources = [];

  // Ambil seluruh URL gambar dari galeri
  triggers.forEach((img) => {
    imageSources.push(img.src);
  });

  function openLightbox(index) {
    if (!modal || !modalImg || !imageSources.length) return;
    currentIndex = index;
    modalImg.src = imageSources[currentIndex];
    modal.style.display = 'flex';
  }

  function closeLightbox() {
    if (modal) {
      modal.style.display = 'none';
    }
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % imageSources.length;
    modalImg.src = imageSources[currentIndex];
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + imageSources.length) % imageSources.length;
    modalImg.src = imageSources[currentIndex];
  }

  // Ekspos fungsi buka lightbox agar bisa dipanggil dari gallery.js
  window.openLightbox = openLightbox;

  // Event Listeners Tombol
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  // Tutup modal jika area luar gambar diklik
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });
  }

  // Dukungan Navigasi Keyboard
  document.addEventListener('keydown', (e) => {
    if (modal && modal.style.display === 'flex') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    }
  });

  // ------------------------------------------
  // GESER (SWIPE) KIRI / KANAN — untuk perangkat sentuh
  // ------------------------------------------
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 50; // jarak geser minimal (px) agar dianggap swipe valid

  if (modalImg) {
    modalImg.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    modalImg.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Pastikan geseran horizontal lebih dominan dari vertikal (bukan scroll)
      if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          showNext(); // geser ke kiri -> foto berikutnya
        } else {
          showPrev(); // geser ke kanan -> foto sebelumnya
        }
      }
    }, { passive: true });
  }
});