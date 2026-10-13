/**
 * Booky language switcher (English / Arabic).
 * - English lives in the HTML and in the fallback argument of t(); Arabic
 *   lives in /js/i18n/ar.js, which must be loaded before this file.
 * - Load both in <head> so the page direction is set before first paint.
 * - Markup:
 *     data-i18n="key"                    replaces the element's text
 *     data-i18n-html="key"               replaces the element's inner HTML
 *     data-i18n-attr="placeholder:key"   sets attributes (";" separated)
 *     data-lang-toggle                   button that switches language
 * - Page scripts begin with  const t = window.bookyI18n.start();  which
 *   translates the markup above them before they touch it, so text they
 *   write afterwards is never overwritten.
 * - Scripts: t("key", "English text", { name: value })
 *            bookyI18n.tm(data.message)  translates an error message sent by
 *            the server; unknown messages are shown as they arrive
 *            bookyI18n.tn("key", count, "review", "reviews")  ->  "3 reviews"
 *            date.toLocaleDateString(bookyI18n.locale, ...)
 */
(function () {
  const STORAGE_KEY = "booky_lang";

  // The choice is kept in a cookie as well, because pages call
  // localStorage.clear() when a session expires.
  function readCookie() {
    const match = document.cookie.match(/(?:^|; )booky_lang=(ar|en)/);
    return match ? match[1] : null;
  }

  function storeLang(value) {
    document.cookie = `${STORAGE_KEY}=${value}; path=/; max-age=31536000; SameSite=Lax`;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore storage errors (private browsing, etc.) */
    }
  }

  function getStoredLang() {
    // A ?lang=ar or ?lang=en link picks the language and is remembered.
    const requested = new URLSearchParams(window.location.search).get("lang");
    if (requested === "ar" || requested === "en") {
      storeLang(requested);
      return requested;
    }

    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* fall through to the cookie */
    }
    return (stored || readCookie()) === "ar" ? "ar" : "en";
  }

  const lang = getStoredLang();
  const dict = lang === "ar" ? window.bookyAr || {} : {};
  const root = document.documentElement;

  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";

  function t(key, fallback, vars) {
    let text = dict[key] ?? fallback ?? key;
    if (vars) {
      for (const name in vars) {
        text = text.replaceAll(`{${name}}`, vars[name]);
      }
    }
    return text;
  }

  // Server messages are looked up by their English text ("server:<text>").
  // "server~<prefix>" entries match messages that end with a variable part,
  // which replaces {rest}.
  const serverPrefixes = Object.keys(dict).filter((key) => key.startsWith("server~"));

  function tm(message) {
    if (typeof message !== "string" || lang === "en") return message;

    const exact = dict[`server:${message}`];
    if (exact !== undefined) return exact;

    const prefix = serverPrefixes.find((key) => message.startsWith(key.slice(7)));
    if (prefix) return dict[prefix].replaceAll("{rest}", message.slice(prefix.length - 7));

    return message;
  }

  // Counted phrases. Arabic has six plural forms, stored as key.zero,
  // key.one, key.two, key.few, key.many and key.other with an {n} placeholder.
  const pluralRules = new Intl.PluralRules("ar");

  function tn(key, count, one, other) {
    const form = dict[`${key}.${pluralRules.select(count)}`] ?? dict[`${key}.other`];
    if (form === undefined) return `${count} ${count === 1 ? one : other}`;
    return form.replaceAll("{n}", count);
  }

  // Each element is translated once, so calling apply() again is safe.
  const translated = new WeakSet();

  function pending(scope, selector) {
    return [...scope.querySelectorAll(selector)].filter((el) => !translated.has(el));
  }

  function apply(scope = document) {
    if (lang === "en") return;

    const texts = pending(scope, "[data-i18n]");
    const htmls = pending(scope, "[data-i18n-html]");
    const attrs = pending(scope, "[data-i18n-attr]");

    texts.forEach((el) => {
      const text = dict[el.dataset.i18n];
      if (text !== undefined) el.textContent = text;
    });

    htmls.forEach((el) => {
      const html = dict[el.dataset.i18nHtml];
      if (html !== undefined) el.innerHTML = html;
    });

    attrs.forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":").map((part) => part.trim());
        const text = dict[key];
        if (attr && text !== undefined) el.setAttribute(attr, text);
      });
    });

    [...texts, ...htmls, ...attrs].forEach((el) => translated.add(el));
  }

  function setLang(next) {
    storeLang(next === "ar" ? "ar" : "en");
    // Reload so text rendered by page scripts is rebuilt in the new language.
    window.location.reload();
  }

  function initToggles() {
    pending(document, "[data-lang-toggle]").forEach((button) => {
      translated.add(button);
      button.textContent = lang === "ar" ? "English" : "العربية";
      button.lang = lang === "ar" ? "en" : "ar";
      button.addEventListener("click", () => setLang(lang === "ar" ? "en" : "ar"));
    });
  }

  function init() {
    apply();
    initToggles();
    root.classList.remove("i18n-pending");
  }

  // Called by page scripts at the end of <body>; returns the t() shortcut.
  function start() {
    init();
    return t;
  }

  // Arabic dates and times with Western digits, to match prices and slots.
  // undefined keeps the browser's own locale for English.
  const locale = lang === "ar" ? "ar-LB-u-nu-latn" : undefined;

  window.bookyI18n = { lang, locale, t, tn, tm, apply, setLang, start };

  // Hide the English markup until the Arabic text is in place.
  if (lang === "ar") root.classList.add("i18n-pending");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
