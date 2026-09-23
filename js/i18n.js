/* Duo site — tiny i18n loader.
 * Detects browser locale, allows manual override, persists choice.
 * Works when opened over http(s); JSON fetch needs a server, not file://.
 */

(function () {
  const SUPPORTED = ["en", "de", "es", "fr", "it"];
  const STORAGE_KEY = "duo_lang";
  const NATIVE_NAMES = {
    en: "English",
    de: "Deutsch",
    es: "Español",
    fr: "Français",
    it: "Italiano",
  };

  function detectLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;

    const nav = (navigator.language || navigator.userLanguage || "en")
      .toLowerCase()
      .split("-")[0];
    return SUPPORTED.includes(nav) ? nav : "en";
  }

  function pathToRoot() {
    // Root pages use "". Nested pages (e.g. /trial) set data-asset-root="../".
    return document.documentElement.getAttribute("data-asset-root") || "";
  }

  async function loadDict(lang) {
    const res = await fetch(`${pathToRoot()}i18n/${lang}.json`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Missing i18n file for ${lang}`);
    return res.json();
  }

  function applyDict(dict) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!dict[key]) return;
      el.innerHTML = dict[key];
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const spec = el.getAttribute("data-i18n-attr"); // e.g. "alt:play.alt"
      spec.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        if (attr && key && dict[key]) el.setAttribute(attr, dict[key]);
      });
    });

    if (dict["meta.title"]) document.title = dict["meta.title"];
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict["meta.description"]) {
      metaDesc.setAttribute("content", dict["meta.description"]);
    }
  }

  function buildLangMenu(current) {
    const switcher = document.querySelector(".lang-switch");
    if (!switcher) return;

    const button = switcher.querySelector("button.lang-current");
    const menu = switcher.querySelector(".lang-menu");
    if (!button || !menu) return;

    button.textContent = NATIVE_NAMES[current] + " ▾";

    menu.innerHTML = "";
    SUPPORTED.forEach((code) => {
      const item = document.createElement("button");
      item.type = "button";
      item.textContent = NATIVE_NAMES[code];
      item.setAttribute("aria-current", code === current ? "true" : "false");
      item.addEventListener("click", () => {
        localStorage.setItem(STORAGE_KEY, code);
        menu.classList.remove("open");
        setLanguage(code);
      });
      menu.appendChild(item);
    });

    button.onclick = (e) => {
      e.stopPropagation();
      menu.classList.toggle("open");
    };

    document.addEventListener("click", () => menu.classList.remove("open"));
  }

  async function setLanguage(lang) {
    const code = SUPPORTED.includes(lang) ? lang : "en";
    try {
      const dict = await loadDict(code);
      applyDict(dict);
      window.DuoI18n.dict = dict;
      document.documentElement.setAttribute("lang", code);
      buildLangMenu(code);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("i18n load failed:", err);
      if (code !== "en") setLanguage("en");
    }
  }

  window.DuoI18n = { setLanguage, detectLang, SUPPORTED, dict: null };

  document.addEventListener("DOMContentLoaded", () => {
    setLanguage(detectLang());
  });
})();
