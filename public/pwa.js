(() => {
  const latestDate = "2026-08-01";
  const latestPath = `/nap/${latestDate}`;
  const safeGet = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const safeSet = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  document.documentElement.classList.toggle("pwa-standalone", standalone);

  const cta = document.querySelector("[data-new-content-cta]");
  const seen = safeGet("jelenlet-latest-seen");
  if (cta && location.pathname !== latestPath && (!seen || seen < latestDate)) cta.hidden = false;
  if (location.pathname === latestPath) safeSet("jelenlet-latest-seen", latestDate);

  document.querySelectorAll("[data-pwa-nav]").forEach(link => {
    const target = link.getAttribute("href");
    const active = target === "/archive" ? location.pathname === "/archive" : location.pathname.startsWith("/nap/") || location.pathname === "/";
    if (active) link.setAttribute("aria-current", "page");
  });

  let deferredPrompt = null;
  const installButton = document.querySelector("[data-install-pwa]");
  const installNote = document.querySelector("[data-install-note]");
  const showInstall = () => { if (installButton && !standalone) installButton.hidden = false; };
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event;
    showInstall();
  });
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !standalone) showInstall();
  installButton?.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installButton.hidden = true;
      return;
    }
    if (installNote) {
      installNote.textContent = "iPhone-on: Megosztás → Hozzáadás a Főképernyőhöz.";
      installNote.hidden = false;
      setTimeout(() => { installNote.hidden = true; }, 7000);
    }
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js?v=6", {scope: "/", updateViaCache: "none"});
        await registration.update();
        registration.waiting?.postMessage("SKIP_WAITING");
      } catch {}
    });
  }
})();
