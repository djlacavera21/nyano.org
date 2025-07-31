function updateOfflineBanner() {
  const banner = document.getElementById('offline-banner');
  if (!banner) return;
  if (navigator.onLine) {
    banner.classList.remove('show');
  } else {
    banner.classList.add('show');
  }
}

window.addEventListener('online', updateOfflineBanner);
window.addEventListener('offline', updateOfflineBanner);
document.addEventListener('DOMContentLoaded', updateOfflineBanner);
