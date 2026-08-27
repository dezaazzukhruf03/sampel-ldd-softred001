/* ==========================================
   SIMPAN KE KALENDER (Add to Calendar)
   Dipicu oleh tombol .btn-add-calendar pada tiap event-card
   (Akad Nikah & Resepsi). Menampilkan dropdown pilihan:
   - Google Calendar (buka tab baru)
   - Unduh file .ics (kompatibel Apple Calendar, Outlook, dll)
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  const calendarButtons = document.querySelectorAll('.btn-add-calendar');
  if (!calendarButtons.length) return;

  let openDropdown = null;
  let openDropdownOwner = null;

  function closeDropdown() {
    if (openDropdown) {
      openDropdown.remove();
      openDropdown = null;
      openDropdownOwner = null;
    }
  }

  // Escape karakter khusus sesuai spesifikasi format .ics (RFC 5545)
  function escapeICSText(str) {
    return String(str || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  function buildICS({ title, location, description, start, end }) {
    const uid = 'undangan-' + Date.now() + '@wedding-invitation';
    const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Undangan Pernikahan//ID',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTAMP:' + dtstamp,
      'DTSTART:' + start,
      'DTEND:' + end,
      'SUMMARY:' + escapeICSText(title),
      'DESCRIPTION:' + escapeICSText(description),
      'LOCATION:' + escapeICSText(location),
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  function downloadICS(data) {
    const icsContent = buildICS(data);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = data.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    if (typeof showToast === 'function') {
      showToast('File kalender (.ics) berhasil diunduh.');
    }
  }

  function buildGoogleCalendarUrl({ title, location, description, start, end }) {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${start}/${end}`,
      details: description,
      location: location
    });
    return 'https://calendar.google.com/calendar/render?' + params.toString();
  }

  function openCalendarDropdown(button, data) {
    closeDropdown();

    const dropdown = document.createElement('div');
    dropdown.className = 'calendar-dropdown';
    dropdown.innerHTML =
      '<a href="' + buildGoogleCalendarUrl(data) + '" target="_blank" rel="noopener" class="calendar-option">' +
        '<i class="fa-brands fa-google"></i> Google Calendar' +
      '</a>' +
      '<button type="button" class="calendar-option calendar-option-ics">' +
        '<i class="fa-solid fa-file-arrow-down"></i> Unduh .ics (Apple/Outlook)' +
      '</button>';

    const actionsWrapper = button.closest('.event-actions') || button.parentElement;
    actionsWrapper.appendChild(dropdown);

    const icsBtn = dropdown.querySelector('.calendar-option-ics');
    if (icsBtn) {
      icsBtn.addEventListener('click', () => {
        downloadICS(data);
        closeDropdown();
      });
    }

    const googleLink = dropdown.querySelector('.calendar-option[href]');
    if (googleLink) {
      googleLink.addEventListener('click', () => {
        closeDropdown();
      });
    }

    openDropdown = dropdown;
    openDropdownOwner = button;
  }

  calendarButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();

      // Klik tombol yang sama saat dropdown terbuka -> tutup dropdown
      if (openDropdownOwner === button) {
        closeDropdown();
        return;
      }

      const data = {
        title: button.getAttribute('data-title') || 'Acara Pernikahan',
        location: button.getAttribute('data-location') || '',
        description: button.getAttribute('data-desc') || '',
        start: button.getAttribute('data-start'),
        end: button.getAttribute('data-end')
      };

      openCalendarDropdown(button, data);
    });
  });

  // Tutup dropdown jika area luar diklik
  document.addEventListener('click', (e) => {
    if (openDropdown && !e.target.closest('.calendar-dropdown') && !e.target.closest('.btn-add-calendar')) {
      closeDropdown();
    }
  });
});