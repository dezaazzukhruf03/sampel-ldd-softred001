/* ==========================================
   COUNTDOWN TIMER SCRIPT
   ========================================== */
// Tanggal target: 31 Desember 2026, 08:00:00 WIB
const targetDate = new Date('December 31, 2026 08:00:00').getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const difference = targetDate - now;

  const daysElement = document.getElementById('days');
  const hoursElement = document.getElementById('hours');
  const minutesElement = document.getElementById('minutes');
  const secondsElement = document.getElementById('seconds');

  if (difference > 0) {
    // Kalkulasi waktu
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Format angka agar selalu 2 digit (misal: 05)
    if (daysElement) daysElement.innerText = String(days).padStart(2, '0');
    if (hoursElement) hoursElement.innerText = String(hours).padStart(2, '0');
    if (minutesElement) minutesElement.innerText = String(minutes).padStart(2, '0');
    if (secondsElement) secondsElement.innerText = String(seconds).padStart(2, '0');
  } else {
    // Jika waktu acara sudah lewat
    if (daysElement) daysElement.innerText = '00';
    if (hoursElement) hoursElement.innerText = '00';
    if (minutesElement) minutesElement.innerText = '00';
    if (secondsElement) secondsElement.innerText = '00';
  }
}

// Jalankan fungsi setiap 1 detik
setInterval(updateCountdown, 1000);
updateCountdown();