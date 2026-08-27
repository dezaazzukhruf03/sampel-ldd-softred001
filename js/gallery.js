/* ==========================================
   GALLERY GRID SCRIPT
   Menghubungkan setiap foto di grid galeri dengan Lightbox.
   Logika modal, navigasi, dan swipe ada di lightbox.js
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  const triggers = document.querySelectorAll('.lightbox-trigger');

  triggers.forEach((img, index) => {
    img.addEventListener('click', () => {
      if (typeof window.openLightbox === 'function') {
        window.openLightbox(index);
      }
    });
  });
});