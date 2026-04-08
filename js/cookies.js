document.addEventListener("DOMContentLoaded", () => {
  const banner = document.querySelector("#cookie-consent-banner");
  const accept = document.querySelector("#accept-cookies");
  const decline = document.querySelector("#decline-cookies");

  if (!banner || !accept) return;

  // Function to gracefully slide out the banner
  const hideBanner = () => {
    banner.classList.add("translate-y-full");
    // Optional: physically remove from DOM after transition completes to save memory
    setTimeout(() => { banner.style.display = "none"; }, 500);
  };

  // If already consented/declined previously, initialize if needed and abort
  const consentState = localStorage.getItem("cookies_accepted");
  if (consentState) {
    if (consentState === "yes" && typeof initializeGoogleAnalytics === "function") {
      initializeGoogleAnalytics();
    }
    // Banner starts hidden physically via translateY, so just leave it alone
    return;
  }

  // Show banner gracefully (remove translateY offscreen class)
  setTimeout(() => {
    banner.classList.remove("translate-y-full");
  }, 1000); // Wait 1 second before popping up to allow other content to load

  // Accept button logic
  accept.addEventListener("click", () => {
    localStorage.setItem("cookies_accepted", "yes");
    if (typeof initializeGoogleAnalytics === "function") {
      initializeGoogleAnalytics();
    }
    hideBanner();
  });

  // Decline button logic
  if (decline) {
    decline.addEventListener("click", () => {
      localStorage.setItem("cookies_accepted", "no");
      hideBanner();
    });
  }
});