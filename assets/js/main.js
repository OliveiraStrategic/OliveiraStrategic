const profile = window.OS_PROFILE || {};

function getBaseUrl() {
  const pathname = window.location.pathname;
  const protocol = window.location.protocol;
  const host = window.location.host;

  let basePath = "/";
  if (host.includes(".github.io")) {
    const parts = pathname.split("/");
    if (parts.length > 1 && parts[1]) {
      basePath = `/${parts[1]}/`;
    }
  } else if (pathname.includes("/oliveirastrategic")) {
    basePath = "/oliveirastrategic/";
  }

  return `${protocol}//${host}${basePath}`;
}

function setupMetaTags() {
  const baseUrl = getBaseUrl();
  let repoName = "oliveirastrategic";
  const host = window.location.host;
  if (host.includes(".github.io")) {
    const parts = window.location.pathname.split("/");
    if (parts.length > 1 && parts[1]) {
      repoName = parts[1];
    }
  }
  const repoRegex = new RegExp(`\\/${repoName}\\/?`);
  const currentPath = window.location.pathname.replace(repoRegex, "").replace(/index\.html$/, "") || "/";
  const fullUrl = baseUrl + currentPath.replace(/^\//, "");

  const metaOgUrl = document.querySelector("meta[property='og:url']");
  const metaCanonical = document.querySelector("link[rel='canonical']");

  if (metaOgUrl) metaOgUrl.setAttribute("content", fullUrl);
  if (metaCanonical) metaCanonical.setAttribute("href", fullUrl);
}

function calculateAge(birthDateValue) {
  if (!birthDateValue) return "";

  const birthDate = new Date(`${birthDateValue}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const currentMonth = today.getMonth();
  const birthMonth = birthDate.getMonth();
  const hasBirthdayPassed =
    currentMonth > birthMonth ||
    (currentMonth === birthMonth && today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassed) age -= 1;
  return age;
}

function renderProfileBasics() {
  document.querySelectorAll("[data-profile-name]").forEach((element) => {
    element.textContent = profile.name || "Gabriel Oliveira";
  });

  document.querySelectorAll("[data-profile-domain]").forEach((element) => {
    element.textContent = getBaseUrl().replace(/\/$/, "").replace(/^https?:\/\//, "");
  });

  document.querySelectorAll("[data-profile-location]").forEach((element) => {
    element.textContent = profile.location || "";
  });

  document.querySelectorAll("[data-profile-age]").forEach((element) => {
    const age = calculateAge(profile.birthDate);
    element.textContent = age ? `${age} anos` : "idade configurável";
  });

  const links = profile.links || {};
  document.querySelectorAll("[data-link='github']").forEach((link) => link.href = links.github || "#");
  document.querySelectorAll("[data-link='linkedin']").forEach((link) => link.href = links.linkedin || "#");
  document.querySelectorAll("[data-link='lattes']").forEach((link) => link.href = links.lattes || "#");
}

function setupNavigation() {
  const button = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");

  if (!button || !menu) return;

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  // Fecha o menu ao clicar fora dele
  document.addEventListener("click", (e) => {
    if (menu.classList.contains("is-open")) {
      const isClickInsideMenu = menu.contains(e.target);
      const isClickInsideButton = button.contains(e.target);
      if (!isClickInsideMenu && !isClickInsideButton) {
        menu.classList.remove("is-open");
        button.setAttribute("aria-expanded", "false");
      }
    }
  });

  // Fecha o menu ao clicar em qualquer link de navegação interno
  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    });
  });
}

function renderList(containerSelector, items, renderItem) {
  const container = document.querySelector(containerSelector);
  if (!container || !Array.isArray(items)) return;
  container.innerHTML = items.map(renderItem).join("");
}

function renderHome(lang = "pt") {
  const highlights = (profile.highlights_trans && profile.highlights_trans[lang]) || profile.highlights || [];
  renderList("[data-home-highlights]", highlights, (item) => `<li>${item}</li>`);

  if (!profile.now) return;
  const studying = (profile.now_trans && profile.now_trans[lang] && profile.now_trans[lang].studying) || profile.now.studying || [];
  const building = (profile.now_trans && profile.now_trans[lang] && profile.now_trans[lang].building) || profile.now.building || [];
  const exploring = (profile.now_trans && profile.now_trans[lang] && profile.now_trans[lang].exploring) || profile.now.exploring || [];

  renderList("[data-now-studying]", studying, (item) => `<li>${item}</li>`);
  renderList("[data-now-building]", building, (item) => `<li>${item}</li>`);
  renderList("[data-now-exploring]", exploring, (item) => `<li>${item}</li>`);
}

function setupRevealAnimations() {
  const elements = document.querySelectorAll("[data-reveal], .hero, .page-hero, .section, .card, .entry-card, .timeline-card, .project-card, .collection-item, .note-panel, .memorable-game, .gallery-item");

  elements.forEach((element) => {
    if (!element.hasAttribute("data-reveal")) {
      element.setAttribute("data-reveal", "");
    }
  });

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  elements.forEach((element) => {
    if (prefersReduced) {
      element.classList.add("is-visible");
    } else {
      observer.observe(element);
    }
  });
}

function setupPageTransitions() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    const isInternal = href && href.startsWith("/") || (href && !href.includes("://") && !href.startsWith("mailto:") && !href.startsWith("tel:"));
    const isCurrentPage = href === window.location.pathname || href === window.location.pathname + "/";

    if (!isInternal || isCurrentPage || link.target === "_blank") return;

    e.preventDefault();

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReduced) {
      document.body.style.opacity = "0";
      document.body.style.transition = "opacity 300ms ease";

      setTimeout(() => {
        window.location.href = href;
      }, 300);
    } else {
      window.location.href = href;
    }
  });
}

function startFooterClock() {
  const elements = document.querySelectorAll("[data-live-time]");
  if (elements.length === 0) return;

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const updateClock = () => {
    const timeString = formatter.format(new Date());
    elements.forEach(el => el.textContent = timeString);
  };
  updateClock();
  setInterval(updateClock, 1000);
}

function startSpotifyLanyard() {
  const discordId = profile.discordId;
  const waveEl = document.querySelector(".spotify-wave");
  if (!waveEl) return;

  const spotifyWidget = waveEl.closest(".footer-widget");
  if (!spotifyWidget) return;

  const valueEl = spotifyWidget.querySelector(".widget-value");

  // Elemento para a capa do álbum
  let albumArtEl = spotifyWidget.querySelector(".spotify-album-art");
  if (!albumArtEl) {
    albumArtEl = document.createElement("img");
    albumArtEl.className = "spotify-album-art";
    albumArtEl.style.width = "36px";
    albumArtEl.style.height = "36px";
    albumArtEl.style.borderRadius = "6px";
    albumArtEl.style.objectFit = "cover";
    albumArtEl.style.marginRight = "8px";
    albumArtEl.style.display = "none";
    albumArtEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.4)";
    albumArtEl.style.transition = "transform 0.2s ease";
    waveEl.after(albumArtEl);
  }

  let currentTrackId = null;

  // Tomar o widget interativo via JavaScript
  spotifyWidget.style.transition = "transform 0.2s ease, color 0.2s ease";
  
  spotifyWidget.addEventListener("click", () => {
    if (currentTrackId) {
      window.open(`https://open.spotify.com/track/${currentTrackId}`, "_blank", "noopener,noreferrer");
    }
  });

  if (!discordId || discordId === "SEU_ID_DO_DISCORD") {
    if (valueEl) valueEl.textContent = "Initial D — Running in the 90s";
    spotifyWidget.style.cursor = "default";
    spotifyWidget.title = "";
    waveEl.style.display = "flex";
    albumArtEl.style.display = "none";
    return;
  }

  const updateSpotify = async () => {
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
      const data = await res.json();

      if (data.success && data.data) {
        const presence = data.data;
        if (presence.listening_to_spotify && presence.spotify) {
          const song = presence.spotify.song;
          const artist = presence.spotify.artist;
          const albumArtUrl = presence.spotify.album_art_url;
          const trackId = presence.spotify.track_id;

          if (song && artist) {
            currentTrackId = trackId || null;
            if (valueEl) valueEl.textContent = `${song} — ${artist}`;
            waveEl.style.display = "flex";
            if (albumArtUrl) {
              albumArtEl.src = albumArtUrl;
              albumArtEl.style.display = "inline-block";
            } else {
              albumArtEl.style.display = "none";
            }

            if (currentTrackId) {
              spotifyWidget.style.cursor = "pointer";
              spotifyWidget.title = "Clique para ouvir no Spotify";
              
              spotifyWidget.onmouseover = () => {
                spotifyWidget.style.transform = "scale(1.02)";
                spotifyWidget.style.color = "#1db954";
                albumArtEl.style.transform = "scale(1.05)";
              };
              spotifyWidget.onmouseout = () => {
                spotifyWidget.style.transform = "none";
                spotifyWidget.style.color = "inherit";
                albumArtEl.style.transform = "none";
              };
            } else {
              spotifyWidget.style.cursor = "default";
              spotifyWidget.title = "";
              spotifyWidget.onmouseover = null;
              spotifyWidget.onmouseout = null;
            }
            return;
          }
        }
      }
      currentTrackId = null;
      if (valueEl) valueEl.textContent = "Offline";
      waveEl.style.display = "none";
      albumArtEl.style.display = "none";
      spotifyWidget.style.cursor = "default";
      spotifyWidget.title = "";
      spotifyWidget.onmouseover = null;
      spotifyWidget.onmouseout = null;
      spotifyWidget.style.transform = "none";
      spotifyWidget.style.color = "inherit";
    } catch (err) {
      console.error("Erro ao carregar Lanyard Spotify:", err);
    }
  };

  updateSpotify();
  setInterval(updateSpotify, 10000);
}

function startDynamicWeather() {
  const weatherWidget = Array.from(document.querySelectorAll(".footer-widget")).find(el => {
    const label = el.querySelector(".widget-label");
    return label && label.textContent.includes("TEMPERATURA");
  });
  if (!weatherWidget) return;

  const valueEl = weatherWidget.querySelector(".widget-value");
  if (!valueEl) return;

  const getWeatherDesc = (code) => {
    if (code === 0) return "Céu Limpo";
    if ([1, 2, 3].includes(code)) return "Nublado";
    if ([45, 48].includes(code)) return "Nevoeiro";
    if ([51, 53, 55].includes(code)) return "Garoa";
    if ([61, 63, 65].includes(code)) return "Chuva";
    if ([80, 81, 82].includes(code)) return "Pancadas";
    if ([95, 96, 99].includes(code)) return "Tempestade";
    return "Nublado";
  };

  const updateWeather = async () => {
    let lat = -18.75; // Padrão: Curvelo, MG
    let lon = -44.43;

    try {
      // Tenta ipwho.is primeiro (seguro, rápido e sem CORS)
      const ipRes = await fetch("https://ipwho.is/");
      const ipData = await ipRes.json();
      if (ipData && ipData.success && ipData.latitude && ipData.longitude) {
        lat = ipData.latitude;
        lon = ipData.longitude;
      }
    } catch (err1) {
      console.warn("ipwho.is falhou, tentando ipapi.co...", err1);
      try {
        // Fallback: ipapi.co
        const ipRes = await fetch("https://ipapi.co/json/");
        const ipData = await ipRes.json();
        if (ipData && ipData.latitude && ipData.longitude) {
          lat = ipData.latitude;
          lon = ipData.longitude;
        }
      } catch (err2) {
        console.warn("Todos os serviços de IP falharam. Usando coordenadas padrão de Curvelo, MG.", err2);
      }
    }

    try {
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const weatherData = await weatherRes.json();

      if (weatherData && weatherData.current_weather) {
        const temp = Math.round(weatherData.current_weather.temperature);
        const code = weatherData.current_weather.weathercode;
        const desc = getWeatherDesc(code);
        valueEl.textContent = `${temp}°C • ${desc}`;
        return;
      }
    } catch (err) {
      console.error("Erro ao obter clima do Open-Meteo:", err);
    }
    
    valueEl.textContent = "22°C • Nublado";
  };

  updateWeather();
  setInterval(updateWeather, 1800000);
}

function startLivePing() {
  const pingWidget = Array.from(document.querySelectorAll(".footer-widget")).find(el => {
    const label = el.querySelector(".widget-label");
    return label && label.textContent.includes("PING STATUS");
  });
  if (!pingWidget) return;

  const valueEl = pingWidget.querySelector(".widget-value");
  const indicatorEl = pingWidget.querySelector(".widget-status-indicator");
  if (!valueEl) return;

  const checkPing = async () => {
    const startTime = performance.now();
    try {
      // Faz uma requisição HEAD leve para o robots.txt do próprio servidor com cache buster
      const cb = Date.now();
      const relativeUrl = window.location.pathname.includes("/pages/") ? "../robots.txt" : "robots.txt";
      await fetch(`${relativeUrl}?cb=${cb}`, {
        method: "HEAD",
        cache: "no-store"
      });
      const duration = Math.round(performance.now() - startTime);
      valueEl.textContent = `ONLINE • ${duration}ms`;
      if (indicatorEl) {
        indicatorEl.className = "widget-status-indicator pulse-green";
      }
    } catch (err) {
      console.warn("Ping para robots.txt falhou, tentando fallback...", err);
      // Tenta pingar a própria raiz da página se robots.txt falhar
      const fallbackStart = performance.now();
      try {
        await fetch(`?cb=${Date.now()}`, { method: "HEAD", cache: "no-store" });
        const duration = Math.round(performance.now() - fallbackStart);
        valueEl.textContent = `ONLINE • ${duration}ms`;
        if (indicatorEl) indicatorEl.className = "widget-status-indicator pulse-green";
      } catch (fallbackErr) {
        valueEl.textContent = "OFFLINE";
        if (indicatorEl) {
          indicatorEl.className = "widget-status-indicator";
          indicatorEl.style.backgroundColor = "#ef4444";
          indicatorEl.style.boxShadow = "0 0 8px #ef4444";
        }
      }
    }
  };

  checkPing();
  setInterval(checkPing, 10000); // Executa o ping a cada 10 segundos
}
window.renderHome = renderHome;
window.setupRevealAnimations = setupRevealAnimations;

document.addEventListener("DOMContentLoaded", () => {
  const currentLang = localStorage.getItem("os_lang") || "pt";

  setupMetaTags();
  renderProfileBasics();
  setupNavigation();
  
  // Renderiza os dados no idioma correto primeiro
  renderHome(currentLang);
  if (typeof window.renderAllCards === "function") {
    window.renderAllCards(currentLang);
  }

  setupRevealAnimations();
  setupPageTransitions();
  startFooterClock();
  startSpotifyLanyard();
  startDynamicWeather();
  startLivePing();

  // Traduz os textos estáticos (data-i18n) depois que o HTML dinâmico já foi gerado
  if (typeof window.translatePage === "function") {
    window.translatePage(currentLang);
  }
});
