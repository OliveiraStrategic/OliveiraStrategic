function renderCards(selector, items, template) {
  const container = document.querySelector(selector);
  if (!container || !Array.isArray(items)) return;
  container.innerHTML = items.map(template).join("");
}

// Função auxiliar para buscar chaves traduzidas dinamicamente
function getLocalized(item, field, lang) {
  if (!item) return "";
  const key = `${field}_${lang}`;
  if (lang !== "pt" && item[key] !== undefined && item[key] !== "") {
    return item[key];
  }
  return item[field] || "";
}

function renderAllCards(lang = "pt") {
  // 1. Timeline/Jornada
  renderCards("[data-timeline]", window.OS_TIMELINE, (item) => {
    const period = getLocalized(item, "period", lang);
    const context = getLocalized(item, "context", lang);
    const lesson = getLocalized(item, "lesson", lang);
    const tag = getLocalized(item, "tag", lang);
    const lessonLabel = lang === 'en' ? 'Lesson learned' : lang === 'es' ? 'Lección aprendida' : 'Lição aprendida';
    
    // Mapeamento de classe CSS baseado na tag original em português para consistência de estilos
    const tagClass = (item.tag || "").toLowerCase();

    return `
      <article class="timeline-card" data-reveal>
        <div class="timeline-header">
          <span class="timeline-period">${period}</span>
          <span class="timeline-badge badge-${tagClass}">${tag}</span>
        </div>
        <p class="timeline-context">${context}</p>
        <div class="timeline-lesson-container">
          <strong class="timeline-lesson-label">${lessonLabel}</strong>
          <p class="timeline-lesson-text">${lesson}</p>
        </div>
      </article>
    `;
  });

  // 2. Laboratório
  renderCards("[data-lab]", window.OS_LAB, (item) => {
    const name = getLocalized(item, "name", lang);
    const type = getLocalized(item, "type", lang);
    const status = getLocalized(item, "status", lang);
    const learned = getLocalized(item, "learned", lang);
    const next = getLocalized(item, "next", lang);
    
    const techLabel = lang === 'en' ? 'Technologies:' : lang === 'es' ? 'Tecnologías:' : 'Tecnologias:';
    const learnedLabel = lang === 'en' ? 'What I learned:' : lang === 'es' ? 'Lo que aprendí:' : 'O que aprendi:';
    const nextLabel = lang === 'en' ? 'Next step:' : lang === 'es' ? 'Próximo paso:' : 'Próximo passo:';

    return `
      <article class="entry-card" data-reveal style="padding: 0; overflow: hidden; border-radius: 16px; display: flex; flex-direction: column;">
        <img src="${item.image}" alt="Capa de ${name}" style="width: 100%; aspect-ratio: 16/10; object-fit: cover;">
        <div style="padding: 24px; display: flex; flex-direction: column; flex-grow: 1;">
          <div class="entry-top" style="margin-bottom: 12px;">
            <span class="status">${status}</span>
            <span>${type}</span>
          </div>
          <h2 style="margin-top: 0; margin-bottom: 12px; font-size: 1.25rem;">${name}</h2>
          <p style="font-size: 0.9rem; margin-bottom: 8px; color: var(--muted);"><strong>${techLabel}</strong> ${item.technologies.join(", ")}</p>
          <p style="font-size: 0.9rem; margin-bottom: 8px; color: var(--muted);"><strong>${learnedLabel}</strong> ${learned}</p>
          <p style="font-size: 0.9rem; margin-bottom: 0; color: var(--accent);"><strong>${nextLabel}</strong> ${next}</p>
        </div>
      </article>
    `;
  });

  // 3. Projetos
  renderCards("[data-projects]", window.OS_PROJECTS, (item) => {
    const name = getLocalized(item, "name", lang);
    const desc = getLocalized(item, "description", lang);
    const lessons = getLocalized(item, "lessons", lang);
    
    const techLabel = lang === 'en' ? 'Technologies:' : lang === 'es' ? 'Tecnologías:' : 'Tecnologias:';
    const lessonsLabel = lang === 'en' ? 'Lessons learned:' : lang === 'es' ? 'Lecciones aprendidas:' : 'Lições aprendidas:';
    const btnText = lang === 'en' ? 'Visit Website' : lang === 'es' ? 'Visitar Sitio Web' : 'Visitar Website';

    let langBarHtml = "";
    if (Array.isArray(item.languages)) {
      langBarHtml = `
        <div class="project-languages">
          ${item.languages.map(l => `
            <span class="project-lang-badge" style="--border-color: ${l.color}33; --bg-color: ${l.color}0d; --dot-color: ${l.color};">
              <span class="project-lang-dot"></span>
              <span>${l.name}</span>
              <span style="opacity: 0.7; font-weight: 700;">${Math.round(l.percent)}%</span>
            </span>
          `).join("")}
        </div>
      `;
    }

    return `
      <article class="project-card" data-reveal>
        <img src="${item.image}" alt="Imagem do projeto ${name}">
        <div class="project-content">
          <h2>${name}</h2>
          <p class="project-desc">${desc}</p>
          <p class="project-tech"><strong>${techLabel}</strong> ${item.technologies.join(", ")}</p>
          ${langBarHtml}
          <p class="project-lessons"><strong>${lessonsLabel}</strong> ${lessons}</p>
          <div style="margin-top: 20px;">
            <a class="button" href="${item.link}" target="_blank" rel="noreferrer">${btnText}</a>
          </div>
        </div>
      </article>
    `;
  });

  // 4. Jogos Locais (se aplicável)
  renderCards("[data-games]", window.OS_GAMES, (item) => {
    const name = getLocalized(item, "name", lang);
    const status = getLocalized(item, "status", lang);
    const description = getLocalized(item, "description", lang);
    const btnText = lang === 'en' ? 'Open game space' : lang === 'es' ? 'Abrir espacio de juego' : 'Abrir espaço do jogo';

    return `
      <article class="entry-card" data-reveal>
        <div class="entry-top">
          <span class="status">${status}</span>
        </div>
        <h2>${name}</h2>
        <p>${description}</p>
        <a class="text-link" href="${item.path}">${btnText}</a>
      </article>
    `;
  });

  // 5. Biblioteca Steam (Jogos Memoráveis)
  renderCards("[data-memorable-games]", window.OS_MEMORABLE_GAMES, (item) => {
    const year = getLocalized(item, "year", lang);
    const playtime = getLocalized(item, "playtime", lang);
    const description = getLocalized(item, "description", lang);
    const personalNote = getLocalized(item, "personalNote", lang);
    const curiosity = getLocalized(item, "curiosity", lang);
    
    const experienceLabel = lang === 'en' ? 'Personal experience' : lang === 'es' ? 'Experiencia personal' : 'Experiência pessoal';
    const curiosityLabel = lang === 'en' ? 'Fun fact' : lang === 'es' ? 'Curiosidad' : 'Curiosidade';

    return `
      <article class="memorable-game" data-reveal>
        <img src="${item.image}" alt="${item.name}">
        <div class="memorable-content">
          <div class="game-header">
            <h3>${item.name}</h3>
            <div class="game-badges" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
              <span class="game-year" style="font-size: 0.75rem; padding: 2px 8px; background: var(--surface-strong); border-radius: 4px; color: var(--muted);">${year}</span>
              ${playtime ? `
                <span class="game-playtime" style="font-size: 0.75rem; padding: 2px 8px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 4px; color: var(--accent); display: inline-flex; align-items: center; gap: 4px;">
                  <svg class="steam-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <path d="M12 .007c-6.22 0-11.33 4.708-11.93 10.8a12.012 12.012 0 0 0 9.29 12.83 5.485 5.485 0 0 1 .46-2.58l3.19-4.52a2.446 2.446 0 0 1 1.94-.13l4.52 3.19c1.07.756 2.492.748 3.55-.02a11.996 11.996 0 0 0 .97-8.77c-.6-6.092-5.71-10.8-11.93-10.8v.007zm3.17 14.1a1.22 1.22 0 1 1-1.22 1.22c0-.68.54-1.22 1.22-1.22z"/>
                  </svg>
                  ${playtime}
                </span>
              ` : ''}
            </div>
          </div>
          <p class="game-description" style="margin-top: 12px; font-size: 0.9rem; color: var(--text);">${description}</p>
          <div class="game-insights">
            <div>
              <strong>${experienceLabel}</strong>
              <p>${personalNote}</p>
            </div>
            <div>
              <strong>${curiosityLabel}</strong>
              <p>${curiosity}</p>
            </div>
          </div>
        </div>
      </article>
    `;
  });
}

window.renderAllCards = renderAllCards;
