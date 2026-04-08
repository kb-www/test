document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    lucide.createIcons();
  }, 0);
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile Menu
  const menuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = menuButton.querySelector('i');
  menuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    menuIcon.setAttribute('data-lucide', mobileMenu.classList.contains('hidden') ? 'menu' : 'x');
    lucide.createIcons();
  });
  mobileMenu.querySelectorAll('a, button').forEach(link => {
      link.addEventListener('click', () => {
          mobileMenu.classList.add('hidden');
          menuIcon.setAttribute('data-lucide', 'menu');
          lucide.createIcons();
      });
  });

  // Animate sections on scroll
  const fadeSections = document.querySelectorAll('.fade-in-section');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.1 });
  fadeSections.forEach(section => sectionObserver.observe(section));



  // Sticky FAB Logic
  const fabButton = document.getElementById('fab-booking-button');
  const heroSection = document.getElementById('hero');
  const fabObserver = new IntersectionObserver(([entry]) => { fabButton.classList.toggle('hidden', entry.isIntersecting); }, { threshold: 0.1 });
  if (heroSection) fabObserver.observe(heroSection);

  // Cookie Consent Logic
  const cookieBanner = document.getElementById('cookie-consent-banner');
  const acceptCookiesButton = document.getElementById('accept-cookies');
  const declineCookiesButton = document.getElementById('decline-cookies');

  function handleCookieChoice(consent) {
    localStorage.setItem('cookie_consent_given', consent);
    cookieBanner.classList.add('translate-y-full');
    if (consent === 'true') {
      initializeGoogleAnalytics();
    }
  }

  const savedConsent = localStorage.getItem('cookie_consent_given');
  if (savedConsent === 'true') {
    initializeGoogleAnalytics();
  } else if (!savedConsent) {
    setTimeout(() => cookieBanner.classList.remove('translate-y-full'), 1500);
  }
  
  acceptCookiesButton.addEventListener('click', () => handleCookieChoice('true'));
  declineCookiesButton.addEventListener('click', () => handleCookieChoice('false'));

  // GA4: booking outbound links (modal, footer, etc.) — only fires when gtag is loaded (cookie consent)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="book.killineybarbers.ie"]');
    if (!a || typeof window.trackBookOnlineClick !== 'function') return;
    let source = a.getAttribute('data-ga-location');
    if (!source) {
      if (a.closest('#booking-modal')) source = 'modal';
      else if (a.closest('footer')) source = 'footer';
      else if (a.closest('header')) source = 'header';
      else source = 'other';
    }
    window.trackBookOnlineClick(source, a.href);
  }, true);
});