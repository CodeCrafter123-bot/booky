/**
 * Booky cookie consent banner.
 * - Strictly-necessary cookies (auth token in localStorage) always work.
 * - Analytics/marketing scripts should check window.bookyConsent.analytics
 *   before loading, e.g.:
 *     if (window.bookyConsent.analytics) { /* load analytics script *\/ }
 * - Re-opens via any element with id="reopenCookiePrefs".
 */
(function () {
  const STORAGE_KEY = "booky_cookie_consent";

  // Pages that do not load js/i18n.js yet fall back to the English text.
  const t = window.bookyI18n ? window.bookyI18n.t : (key, fallback) => fallback;

  function getStoredConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function storeConsent(consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      /* ignore storage errors (private browsing, etc.) */
    }
    window.bookyConsent = consent;
    document.dispatchEvent(new CustomEvent("bookyConsentUpdated", { detail: consent }));
  }

  window.bookyConsent = getStoredConsent() || { necessary: true, analytics: false };

  function buildBanner() {
    const banner = document.createElement("div");
    banner.id = "cookieConsentBanner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", t("cookie.label", "Cookie consent"));
    banner.innerHTML = `
      <div class="cookie-consent-inner">
        <p class="cookie-consent-text">
          ${t("cookie.text", "We use cookies that are strictly necessary to run Booky (keeping you signed in), and, if you agree, optional analytics cookies to help us improve the product. Read our")}
          <a href="/privacy.html#cookies">${t("cookie.policy", "Cookie policy")}</a>.
        </p>
        <div class="cookie-consent-actions">
          <button type="button" class="btn btn-ghost btn-sm" id="cookieRejectBtn">${t("cookie.necessaryOnly", "Necessary only")}</button>
          <button type="button" class="btn btn-primary btn-sm" id="cookieAcceptBtn">${t("cookie.acceptAll", "Accept all")}</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById("cookieAcceptBtn").addEventListener("click", () => {
      storeConsent({ necessary: true, analytics: true });
      banner.remove();
    });

    document.getElementById("cookieRejectBtn").addEventListener("click", () => {
      storeConsent({ necessary: true, analytics: false });
      banner.remove();
    });
  }

  function init() {
    if (!getStoredConsent()) {
      buildBanner();
    }

    document.addEventListener("click", (e) => {
      if (e.target && e.target.id === "reopenCookiePrefs") {
        e.preventDefault();
        if (!document.getElementById("cookieConsentBanner")) {
          buildBanner();
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
