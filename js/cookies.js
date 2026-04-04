document.addEventListener("DOMContentLoaded", () => {
  const banner = document.querySelector("#cookie-banner");
  const accept = document.querySelector("#cookie-accept");

  // If accepted previously → initialize GA immediately
  if (localStorage.getItem("cookies_accepted") === "yes") {
    initializeGoogleAnalytics();
    banner.style.display = "none";
    return;
  }

  // Accept button
  accept.addEventListener("click", () => {
    localStorage.setItem("cookies_accepted", "yes");
    initializeGoogleAnalytics();
    banner.style.display = "none";
  });
});