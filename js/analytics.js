function initializeGoogleAnalytics() {
  if (window.gaInitialized) return;
  const measurementId = 'G-TWQX6MGNX6'; // YOUR GOOGLE MEASUREMENT ID

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', measurementId);

  window.gaInitialized = true;
}

/**
 * GA4 custom events for outbound booking links (after consent / when gtag exists).
 * @param {string} source - e.g. modal, footer, 404_header, 404_content
 * @param {string} [url] - full clicked URL
 */
window.trackBookOnlineClick = function trackBookOnlineClick(source, url) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'book_online_click', {
    source: source,
    outbound_url: url || 'https://book.killineybarbers.ie/'
  });
  window.gtag('event', 'outbound_click', {
    link_domain: 'book.killineybarbers.ie',
    source: source
  });
};