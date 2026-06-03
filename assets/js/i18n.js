// i18n & Theme Toggle Manager
document.addEventListener("DOMContentLoaded", () => {
  const translations = window.OS_TRANSLATIONS || {};
  let currentLang = localStorage.getItem("os_lang") || "pt";

  // Translate page content
  function translatePage(lang) {
    currentLang = lang;
    localStorage.setItem("os_lang", lang);
    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    // Re-renderizar os cards dinâmicos se as funções estiverem disponíveis
    if (typeof window.renderAllCards === "function") {
      window.renderAllCards(lang);
    }
    if (typeof window.renderHome === "function") {
      window.renderHome(lang);
    }

    // Re-aplicar efeitos de scroll reveal nos novos elementos criados
    if (typeof window.setupRevealAnimations === "function") {
      window.setupRevealAnimations();
    }

    // Update active visual language indicator
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      if (btn.getAttribute("data-lang-btn") === lang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    window.hasTranslated = true;
  }

  // Dynamic Event Handler for Language Buttons
  document.addEventListener("click", (e) => {
    const langBtn = e.target.closest("[data-lang-btn]");
    if (langBtn) {
      const lang = langBtn.getAttribute("data-lang-btn");
      translatePage(lang);
    }
  });

  window.translatePage = translatePage;

  // Inicialização de fallback para segurança se o main.js não chamar
  setTimeout(() => {
    if (!window.hasTranslated) {
      translatePage(currentLang);
    }
  }, 100);

  // Theme Toggle Button Logic
  const themeToggle = document.querySelector("[data-theme-toggle]");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("os_theme", newTheme);
    });
  }
});
