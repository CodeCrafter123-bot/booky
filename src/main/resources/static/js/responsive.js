/* Mobile navigation and cookie-banner spacing; no API or booking changes. */
(() => {
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.id ||= "bookySidebar";
    let bar = document.querySelector(".mobile-topbar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "mobile-topbar";
      const trigger = document.createElement("button");
      trigger.className = "mobile-menu-btn";
      trigger.type = "button";
      trigger.textContent = "☰";
      bar.append(trigger);
      const logo = sidebar.querySelector(".logo");
      if (logo) bar.append(logo.cloneNode(true));
      const spacer = document.createElement("span");
      spacer.className = "mobile-spacer";
      bar.append(spacer);
      document.body.prepend(bar);
    }
    const trigger = bar.querySelector(".mobile-menu-btn");
    const close = document.createElement("button");
    close.type = "button";
    close.className = "mobile-nav-close";
    close.textContent = "✕ Close menu";
    sidebar.prepend(close);
    const mobile = matchMedia("(max-width: 860px)");
    const setOpen = (open, restore = true) => {
      sidebar.classList.toggle("mobile-open", open);
      document.body.classList.toggle("mobile-nav-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      if (open) close.focus();
      else if (restore) trigger.focus();
    };
    trigger.setAttribute("aria-label", "Open navigation menu");
    trigger.setAttribute("aria-controls", sidebar.id);
    trigger.setAttribute("aria-expanded", "false");
    trigger.addEventListener("click", () => setOpen(!sidebar.classList.contains("mobile-open")));
    close.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", event => {
      if (!sidebar.classList.contains("mobile-open")) return;
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab") {
        const nodes = [...sidebar.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')]
          .filter(el => !el.disabled && el.getClientRects().length);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    mobile.addEventListener("change", () => setOpen(false, false));
  }
  let observed;
  const resize = new ResizeObserver(updateSpacing);
  function updateSpacing() {
    const banner = document.getElementById("cookieConsentBanner");
    if (banner !== observed) {
      resize.disconnect();
      observed = banner;
      if (banner) resize.observe(banner);
    }
    document.body.style.setProperty("--cookie-banner-height", `${banner ? banner.getBoundingClientRect().height : 0}px`);
  }
  new MutationObserver(updateSpacing).observe(document.body, { childList: true });
  updateSpacing();
})();
