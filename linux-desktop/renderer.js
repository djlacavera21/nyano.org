window.addEventListener('DOMContentLoaded', () => {
  const sidebarItems = document.querySelectorAll('#sidebar li');
  const pages = document.querySelectorAll('.page');

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-page');

      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      pages.forEach(page => {
        page.classList.toggle('active', page.id === target);
      });
    });
  });

  // Populate platform info
  const platformEl = document.getElementById('platform');
  if (platformEl) {
    platformEl.textContent = window.nyano.platform;
  }
});

