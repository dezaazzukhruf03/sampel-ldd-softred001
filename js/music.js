/* ==========================================
   MUSIC PLAYER SCRIPT
   ========================================== */
const bgMusic = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
let isPlaying = false;

// Fungsi untuk memutar musik
function playAudio() {
  if (bgMusic) {
    bgMusic.play().then(() => {
      isPlaying = true;
      if (musicBtn) {
        musicBtn.innerHTML = '<i class="fa-solid fa-compact-disc fa-spin"></i>';
      }
    }).catch(error => {
      // Autoplay diblokir browser: tombol tetap tampil (statis, tidak muter)
      // agar tamu bisa menekannya sendiri untuk memutar musik secara manual.
      console.log("Autoplay diblokir oleh browser:", error);
      isPlaying = false;
      if (musicBtn) {
        musicBtn.innerHTML = '<i class="fa-solid fa-compact-disc"></i>';
      }
    });
  }
}

// Fungsi untuk menjeda musik
function pauseAudio() {
  if (bgMusic) {
    bgMusic.pause();
    isPlaying = false;
    if (musicBtn) {
      musicBtn.innerHTML = '<i class="fa-solid fa-compact-disc"></i>';
    }
  }
}

// Toggle Play/Pause via Tombol Mengambang
if (musicBtn) {
  musicBtn.addEventListener('click', () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  });
}