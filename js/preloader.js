/* ==========================================
   PRELOADER SCRIPT
   ========================================== */
window.addEventListener('load', function () {
  const preloader = document.getElementById('preloader');

  if (preloader) {
    // Beri sedikit delay agar transisi terasa mulus saat halaman selesai dimuat
    setTimeout(function () {
      preloader.classList.add('fade-out');

      // Sembunyikan penuh setelah animasi fade-out selesai
      setTimeout(function () {
        preloader.style.display = 'none';
      }, 500);
    }, 600);
  }
});