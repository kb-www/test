document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  if (localStorage.getItem('cookie_consent_given') === 'true' && typeof initializeGoogleAnalytics === 'function') {
    initializeGoogleAnalytics();
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="book.killineybarbers.ie"]');
    if (!a || typeof window.trackBookOnlineClick !== 'function') return;
    let source = a.getAttribute('data-ga-location');
    if (!source) source = a.closest('header') ? '404_header' : '404_content';
    window.trackBookOnlineClick(source, a.href);
  }, true);
});
