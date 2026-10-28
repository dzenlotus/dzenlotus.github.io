import "./style.css";

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Browsing without storage is supported. */
    }
  },
};
let lang = storage.get("ik-language") === "ru" ? "ru" : "en";
let scene;
const preference = matchMedia("(prefers-reduced-motion: reduce)");
const projectPointer = matchMedia("(hover: hover) and (pointer: fine)");
let paused = preference.matches;
let soundEnabled = false;
let audio;
let toastTimer;
const completed = new Set();
const copy = {
  en: {
    navWork: "Selected work",
    navAbout: "The human",
    navContact: "Connect ↗",
    eyebrow: "SOMEWHERE BETWEEN LOGIC & MAGIC",
    heroRole: "AI SYSTEMS & FULL-STACK ENGINEER",
    heroLine1: "I build",
    heroLine2: "living",
    heroLine3: "systems.",
    heroDescription:
      "I'm Ivan Kurukin. I build AI agents, developer tools and interactive products — from the system underneath to the experience on the surface.",
    explore: "Selected projects",
    livingEngine: "THE LIVING ENGINE",
    sceneHint: "Drag to rotate · select an orbiting signal",
    scroll: "SCROLL TO DISCOVER",
    intelligence: "Intelligence",
    magic: "Magic",
    physics: "Physics",
    workTitle: "Different worlds.<br>Same restless mind.",
    workIntro:
      "Architecture, implementation and interaction. A selection of independently built products and ongoing research.",
    alsoBuild: "ALSO ON MY WORKBENCH",
    aboutTitle:
      "An engineer's mind.<br>A worldbuilder's<br><em>curiosity.</em>",
    aboutLead:
      "I like the moment an abstract idea starts doing something real.",
    aboutText:
      "My work lives where AI, software engineering and interactive design overlap. I build tools that remember, agents that act, and worlds with rules worth exploring.",
    aboutText2:
      "I work across architecture, backend systems and the interface people use. My process is hands-on: build, run, inspect, improve.",
    principle1: "Ideas need<br><strong>working proof.</strong>",
    principle2: "Complex systems.<br><strong>Clear interfaces.</strong>",
    principle3: "Stay curious.<br><strong>Keep building.</strong>",
    labTitle: "A little controlled<br><em>chaos.</em>",
    labIntro:
      "An interactive study in gravity and control. Pilot a probe through three signals. The pull of the central mass changes your trajectory.",
    launch: "Launch a probe",
    labControls: "ARROWS / WASD · THREE SIGNALS",
    reset: "Reset ↺",
    agentEyebrow: "A NOTE FROM THE OTHER SIDE OF THE KEYBOARD",
    agentNote:
      "“Ivan doesn’t stop at ‘what if’. He asks what it would take, builds it, and makes me prove it works. This little universe is how I see that mind.”",
    agentSign: "— His AI collaborator · built together, questioned constantly.",
    contactTitle: "Have a complex<br>and <em>ambitious</em> idea?",
    contactText:
      "Open to engineering roles and project collaborations.<br>AI systems, developer tools and interactive products.",
    contactButton: "Start a conversation",
    source: "Explore the source ↗",
    references: "10 inspirations ↗",
    footerNote: "HUMAN CURIOSITY. MACHINE COLLABORATION.",
    explorer: "FIELD NOTES",
    questLabel: "EXPLORATION INDEX",
    questTitle: "Stay curious.",
    questIntro:
      "Five ways to explore the work. No locked content, no scores — just things worth trying.",
    readCase: "Explore the project",
    conceptStudy: "CONCEPT STUDY",
    approach: "ENGINEERING FOCUS",
    contribution: "MY CONTRIBUTION",
    viewSource: "Public repository ↗",
    visit: "Visit project ↗",
    preview: "Download preview ↗",
    profile: "Quick profile ↗",
    noteFound: "Field note added",
    labDone: "Trajectory complete. Three signals collected.",
    questNames: [
      "Explore the 3D instrument",
      "Switch between all three systems",
      "Open a project study",
      "Read the engineering perspective",
      "Complete the gravity experiment",
    ],
    reward:
      "All five observations recorded. The interesting part was always the exploration.",
    contactEmail: "Email ↗",
    availability: "ENGINEERING ROLES & COLLABORATIONS",
    commandPlaceholder: "Find a project or jump somewhere…",
    signals: "SIGNALS",
    sections: "SECTION",
    project: "PROJECT",
    noResults: "No matching results.",
    labWin: "Experiment complete",
    labReplay: "Run again",
    professional: "Professional profile",
    projectSelect: "Select a project to inspect",
    soundOn: "Interaction sounds enabled",
    soundOff: "Interaction sounds disabled",
    motionOn: "Motion resumed",
    motionOff: "Motion paused",
  },
  ru: {
    navWork: "Проекты",
    navAbout: "Обо мне",
    navContact: "Связаться ↗",
    eyebrow: "НА ПЕРЕСЕЧЕНИИ ЛОГИКИ И МАГИИ",
    heroRole: "AI SYSTEMS & FULL-STACK ENGINEER",
    heroLine1: "Создаю",
    heroLine2: "живые",
    heroLine3: "системы.",
    heroDescription:
      "Я Иван Курукин. Создаю AI-агентов, инструменты для разработчиков и интерактивные продукты — от архитектуры до интерфейса.",
    explore: "Смотреть проекты",
    livingEngine: "ЖИВОЙ МЕХАНИЗМ",
    sceneHint: "Вращайте объект · выбирайте сигналы на орбите",
    scroll: "ИССЛЕДОВАТЬ ДАЛЬШЕ",
    intelligence: "Интеллект",
    magic: "Магия",
    physics: "Физика",
    workTitle: "Разные миры.<br>Один исследователь.",
    workIntro:
      "Архитектура, разработка и взаимодействие. Продукты, которые я создаю самостоятельно, и текущие исследования.",
    alsoBuild: "ЕЩЁ НА МОЁМ ВЕРСТАКЕ",
    aboutTitle:
      "Мышление инженера.<br>Любопытство<br><em>создателя миров.</em>",
    aboutLead:
      "Люблю момент, когда абстрактная идея начинает делать что-то настоящее.",
    aboutText:
      "Работаю на пересечении AI, программной инженерии и интерактивного дизайна. Создаю инструменты с памятью, агентов, способных действовать, и миры, чьи правила интересно исследовать.",
    aboutText2:
      "Соединяю архитектуру, серверную часть и интерфейс. Мой процесс практический: собрать, запустить, изучить результат, улучшить.",
    principle1: "Идеям нужно<br><strong>рабочее доказательство.</strong>",
    principle2: "Сложные системы.<br><strong>Понятные интерфейсы.</strong>",
    principle3: "Исследовать.<br><strong>Продолжать создавать.</strong>",
    labTitle: "Немного управляемого<br><em>хаоса.</em>",
    labIntro:
      "Интерактивный этюд о гравитации и управлении. Проведите зонд через три сигнала. Притяжение центральной массы меняет траекторию.",
    launch: "Запустить зонд",
    labControls: "СТРЕЛКИ / WASD · ТРИ СИГНАЛА",
    reset: "Сначала ↺",
    agentEyebrow: "ЗАМЕТКА С ДРУГОЙ СТОРОНЫ КЛАВИАТУРЫ",
    agentNote:
      "«Иван не останавливается на „а что, если“. Он выясняет, что потребуется, собирает это и заставляет меня доказать, что оно работает. Эта маленькая вселенная — мой взгляд на его мышление».",
    agentSign: "— Его AI-соавтор · создаём вместе, постоянно проверяем.",
    contactTitle: "Есть сложная<br>и <em>амбициозная</em> идея?",
    contactText:
      "Рассматриваю инженерные роли и проектное сотрудничество.<br>AI-системы, инструменты разработки и интерактивные продукты.",
    contactButton: "Давайте обсудим",
    source: "Исходный код ↗",
    references: "10 источников вдохновения ↗",
    footerNote: "ЧЕЛОВЕЧЕСКОЕ ЛЮБОПЫТСТВО. СОТРУДНИЧЕСТВО С AI.",
    explorer: "НАБЛЮДЕНИЯ",
    questLabel: "ИНДЕКС ИССЛЕДОВАНИЯ",
    questTitle: "Сохранять любопытство.",
    questIntro:
      "Пять способов познакомиться с работой. Всё доступно сразу: просто несколько вещей, которые стоит попробовать.",
    readCase: "Подробнее о проекте",
    conceptStudy: "КОНЦЕПТ",
    approach: "ИНЖЕНЕРНЫЙ ФОКУС",
    contribution: "МОЙ ВКЛАД",
    viewSource: "Открытый репозиторий ↗",
    visit: "Сайт проекта ↗",
    preview: "Скачать preview ↗",
    profile: "Короткий профиль ↗",
    noteFound: "Наблюдение записано",
    labDone: "Траектория пройдена. Три сигнала собраны.",
    questNames: [
      "Исследовать 3D-механизм",
      "Переключить все три системы",
      "Изучить проект",
      "Прочитать об инженерном подходе",
      "Завершить гравитационный эксперимент",
    ],
    reward:
      "Все пять наблюдений записаны. Главное здесь — сам процесс исследования.",
    contactEmail: "Написать ↗",
    availability: "ИНЖЕНЕРНЫЕ РОЛИ И СОТРУДНИЧЕСТВО",
    commandPlaceholder: "Найти проект или раздел…",
    signals: "СИГНАЛЫ",
    sections: "РАЗДЕЛ",
    project: "ПРОЕКТ",
    noResults: "Ничего не найдено.",
    labWin: "Эксперимент завершён",
    labReplay: "Запустить снова",
    professional: "Профессиональный профиль",
    projectSelect: "Выберите проект",
    soundOn: "Звук взаимодействий включён",
    soundOff: "Звук выключен",
    motionOn: "Анимация включена",
    motionOff: "Анимация приостановлена",
  },
};
const projects = [
  {
    id: "mudra",
    name: "Mudra / Vajra",
    category: "AI & KNOWLEDGE SYSTEMS",
    tags: ["Python", "Rust", "MCP", "Knowledge graphs"],
    link: "https://github.com/dzenlotus/mudra",
    preview: "https://github.com/dzenlotus/mudra/releases",
    en: {
      imageAlt:
        "A precision engine with titanium rings around a smoky quartz core and a luminous branching lattice.",
      subtitle: "Intelligence with a memory.",
      description:
        "An agent harness and knowledge-engine ecosystem exploring how software can formalize goals, keep reusable knowledge and execute procedures.",
      lead: "Turning a natural-language intention into an explicit, inspectable path from knowledge to action.",
      focus:
        "Agent tooling, structured knowledge, procedure execution, and persistence across sessions.",
      contribution:
        "Architecture and implementation across the Mudra tool layer, Ghanta orchestration and Vajra knowledge engine.",
      status:
        "Active development. Mudra has a public macOS Apple Silicon preview; the public repository distributes builds. Core implementation is private.",
    },
    ru: {
      imageAlt:
        "Точный механизм: титановые кольца вокруг ядра из дымчатого кварца со светящейся разветвлённой структурой.",
      subtitle: "Интеллект с памятью.",
      description:
        "Агентная среда и экосистема движка знаний: формализация целей, накопление пригодного для повторного использования опыта и выполнение процедур.",
      lead: "От намерения на естественном языке — к явному, проверяемому пути от знаний к действию.",
      focus:
        "Инструменты агентов, структурированные знания, выполнение процедур и сохранение контекста между сессиями.",
      contribution:
        "Архитектура и разработка слоя инструментов Mudra, оркестрации Ghanta и движка знаний Vajra.",
      status:
        "Активная разработка. Доступен macOS Apple Silicon preview Mudra; открытый репозиторий распространяет сборки. Основная реализация закрыта.",
    },
  },
  {
    id: "worklife",
    name: "Worklife",
    category: "AUTONOMOUS AGENTS",
    tags: ["Python", "MCP", "SQLite", "Agent workflows"],
    link: "https://github.com/dzenlotus/worklife-agent",
    website: "https://dzenlotus.github.io/worklife-agent/",
    en: {
      imageAlt:
        "Branching architectural walkways and frosted glass portals, connected by a single chartreuse route in a dark gallery.",
      subtitle: "A career workspace for personal agents.",
      description:
        "An MCP server for job search, resume matching, application tracking and shared employer knowledge. Personal search context stays local.",
      lead: "Giving an AI agent the tools and durable context to support a real, ongoing job search.",
      focus:
        "Source-backed matching, a persistent application pipeline, and a clear boundary between personal records and shared employer observations.",
      contribution:
        "Product design, Python implementation, MCP tool contracts and the employer-knowledge publishing workflow.",
      status:
        "Public source, documentation and installable Python package. Provider access and capabilities depend on configuration.",
    },
    ru: {
      imageAlt:
        "Разветвлённые переходы и порталы из матового стекла; один салатовый маршрут проходит через тёмную галерею.",
      subtitle: "Карьерное пространство для личных агентов.",
      description:
        "MCP-сервер для поиска вакансий, сопоставления резюме, ведения откликов и обмена знаниями о работодателях. Личный контекст остаётся локально.",
      lead: "Инструменты и долговременный контекст для AI-агента, который помогает с реальным, продолжающимся поиском работы.",
      focus:
        "Доказательное сопоставление опыта с вакансией, постоянная воронка откликов и разделение личных записей и общих наблюдений о работодателях.",
      contribution:
        "Продуктовое проектирование, реализация на Python, контракты MCP-инструментов и публикация знаний о работодателях.",
      status:
        "Открытый код, документация и Python-пакет. Доступ к источникам и возможности зависят от настройки.",
    },
  },
  {
    id: "magik",
    name: "Book of Shadow",
    category: "INTERACTIVE PRODUCT",
    tags: ["Python", "Next.js", "React", "Telegram"],
    en: {
      imageAlt:
        "A dark leather grimoire with brass fittings, open parchment pages and a floating geometric seal.",
      subtitle: "A spell book that lives in your chat.",
      description:
        "A Telegram game and companion Mini App that turn spells, rituals and progression into a shared interactive world.",
      lead: "A persistent game world where chat interactions, mechanics and a visual grimoire meet.",
      focus:
        "Telegram interaction design, game-state consistency, progression systems and a multilingual Mini App.",
      contribution:
        "Backend mechanics, Telegram workflows, frontend interactions and iterative product development.",
      status:
        "A continuing product with a private codebase. This overview describes engineering scope; no public demo is linked.",
    },
    ru: {
      imageAlt:
        "Гримуар в тёмной кожаной обложке с латунными деталями, раскрытым пергаментом и парящей геометрической печатью.",
      subtitle: "Книга заклинаний, живущая в чате.",
      description:
        "Игра в Telegram и Mini App, объединяющие заклинания, ритуалы и развитие персонажей в общий интерактивный мир.",
      lead: "Постоянный игровой мир на пересечении общения, механик и визуального гримуара.",
      focus:
        "Взаимодействие в Telegram, согласованность состояния игры, прогрессия и многоязычный Mini App.",
      contribution:
        "Серверные механики, Telegram-сценарии, интерфейс и последовательное развитие продукта.",
      status:
        "Развивающийся продукт с закрытой кодовой базой. Здесь описана инженерная часть; публичная демоверсия не указана.",
    },
  },
  {
    id: "abyss",
    name: "Abyss Wars",
    category: "SIMULATION & GAME SYSTEMS",
    tags: ["Godot", "GDScript", "Rust", "Simulation"],
    en: {
      imageAlt:
        "A detailed spacecraft with articulated engines and pale chartreuse exhaust in dark space.",
      subtitle: "Worlds built from first principles.",
      description:
        "A space-flight prototype exploring modular propulsion, ship systems and programmable onboard procedures.",
      lead: "Exploring what a spacecraft feels like when its systems become part of the game.",
      focus:
        "Force, impulse, thermal and energy budgets; observable simulation state and procedures authored in code.",
      contribution:
        "Simulation and system design, prototype implementation and engineering-oriented player interfaces.",
      status:
        "Experimental Godot prototype in active development. Some mechanics are design studies; no public playable build is linked.",
    },
    ru: {
      imageAlt:
        "Детализированный космический корабль с поворотными двигателями и бледно-салатовым выхлопом в тёмном космосе.",
      subtitle: "Миры из первых принципов.",
      description:
        "Прототип космической игры: модульная тяга, системы корабля и программируемые процедуры бортового компьютера.",
      lead: "Исследование того, как ощущается космический корабль, когда его системы становятся частью игры.",
      focus:
        "Силы и импульс, тепло и энергия, наблюдаемое состояние симуляции и процедуры, написанные кодом.",
      contribution:
        "Проектирование систем и симуляции, реализация прототипа и инженерные интерфейсы игрока.",
      status:
        "Экспериментальный Godot-прототип в разработке. Часть механик находится на стадии проектирования; публичная игровая сборка не указана.",
    },
  },
];
function resetProjectDepth(el) {
  el.style.removeProperty("--pointer-x");
  el.style.removeProperty("--pointer-y");
}
function resetProjectDepths() {
  $$(".project-visual").forEach(resetProjectDepth);
}
projectPointer.addEventListener("change", resetProjectDepths);
function bindProjectDepth() {
  $$(".project-visual").forEach((el) => {
    let bounds;
    el.addEventListener("pointerenter", () => {
      bounds = el.getBoundingClientRect();
    });
    el.addEventListener("pointermove", (event) => {
      if (
        paused ||
        preference.matches ||
        !projectPointer.matches ||
        event.pointerType === "touch"
      )
        return;
      const x = Math.max(
        -1,
        Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2),
      );
      const y = Math.max(
        -1,
        Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2),
      );
      el.style.setProperty("--pointer-x", x.toFixed(3));
      el.style.setProperty("--pointer-y", y.toFixed(3));
    });
    el.addEventListener("pointerleave", () => resetProjectDepth(el));
    el.addEventListener("pointercancel", () => resetProjectDepth(el));
  });
}
function renderProjects() {
  $("#projects").innerHTML = projects
    .map(
      (p, i) =>
        `<article class="project reveal" id="project-${p.id}"><button class="project-visual" data-project="${p.id}" aria-label="${copy[lang].readCase}: ${p.name}"><img class="project-image" src="/images/${p.id}.webp" width="1536" height="1024" alt="${p[lang].imageAlt}" loading="lazy" decoding="async" draggable="false"><span class="visual-corner">${copy[lang].conceptStudy} / 00${i + 1}</span><span class="visual-open" aria-hidden="true">↗</span></button><div class="project-copy"><div class="project-meta"><span class="project-num">0${i + 1}</span><span>${p.category}</span></div><h3>${p.name}</h3><span class="project-subtitle">${p[lang].subtitle}</span><p class="project-description">${p[lang].description}</p><div class="tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div><button class="project-open" data-project="${p.id}"><span>${copy[lang].readCase}</span><span aria-hidden="true">↗</span></button></div></article>`,
    )
    .join("");
  $$("[data-project]").forEach((el) =>
    el.addEventListener("click", () => openProject(el.dataset.project)),
  );
  bindProjectDepth();
  observeReveals();
}
function setLanguage() {
  document.documentElement.lang = lang;
  $("#language").value = lang;
  $$("[data-i18n]").forEach((el) => {
    const value = copy[lang][el.dataset.i18n];
    if (value) el.innerHTML = value;
  });
  $("#command-input").placeholder = copy[lang].commandPlaceholder;
  renderProjects();
  renderQuests();
  renderCommands();
  updateLabScore();
  localizeControls();
  if ($("#project-dialog").open) renderProject(currentProject);
}
$("#language").addEventListener("change", (e) => {
  lang = e.target.value;
  storage.set("ik-language", lang);
  setLanguage();
});
const revealObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObserver.unobserve(e.target);
      }
    }),
  { threshold: 0.09 },
);
function observeReveals() {
  $$(".reveal:not(.visible)").forEach((el) => revealObserver.observe(el));
}
document.body.classList.add("js-ready");
function notify(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 3200);
}
function tone(freq = 420) {
  if (!soundEnabled) return;
  try {
    audio ??= new AudioContext();
    audio.resume();
    const osc = audio.createOscillator(),
      gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audio.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      freq * 1.5,
      audio.currentTime + 0.15,
    );
    gain.gain.setValueAtTime(0.025, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.25);
    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.25);
  } catch {
    soundEnabled = false;
    $("#sound").setAttribute("aria-pressed", "false");
  }
}
function discover(key) {
  if (completed.has(key)) return;
  completed.add(key);
  renderQuests();
  tone(440 + completed.size * 80);
  notify(`${copy[lang].noteFound} · ${completed.size}/5`);
}
function renderQuests() {
  $("#quest-count").textContent = `${completed.size}/5`;
  $(".quest-progress i").style.width = `${completed.size * 20}%`;
  $("#quest-list").innerHTML = copy[lang].questNames
    .map(
      (q, i) =>
        `<li class="${completed.has(i) ? "complete" : ""}"><span class="check">${completed.has(i) ? "✓" : "○"}</span><span>${q}</span></li>`,
    )
    .join("");
  $("#quest-reward").textContent =
    completed.size === 5 ? copy[lang].reward : "";
}
let currentProject = "mudra";
function renderProject(id) {
  const p = projects.find((p) => p.id === id);
  if (!p) return;
  $("#project-detail").innerHTML =
    `<span class="overline">${p.category}</span><h2 id="project-modal-title">${p.name}</h2><p class="detail-lead">${p[lang].lead}</p><div class="tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div><div class="detail-grid"><div><h3>${copy[lang].approach}</h3><p>${p[lang].focus}</p></div><div><h3>${copy[lang].contribution}</h3><p>${p[lang].contribution}</p></div></div><p class="detail-status">${p[lang].status}</p><div class="detail-links">${p.link ? `<a href="${p.link}" target="_blank" rel="noopener noreferrer">${copy[lang].viewSource}</a>` : ""}${p.website ? `<a href="${p.website}" target="_blank" rel="noopener noreferrer">${copy[lang].visit}</a>` : ""}${p.preview ? `<a href="${p.preview}" target="_blank" rel="noopener noreferrer">${copy[lang].preview}</a>` : ""}<a href="mailto:i.kuriukin@icloud.com">${copy[lang].contactEmail}</a></div>`;
}
function openProject(id) {
  currentProject = id === "vajra" ? "mudra" : id;
  renderProject(currentProject);
  const d = $("#project-dialog");
  if (!d.open) d.showModal();
  discover(2);
  tone();
}
$$("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        dialog.close();
    }
  });
  $(".dialog-close", dialog).addEventListener("click", () => dialog.close());
});
$("#quest-trigger").addEventListener("click", () =>
  $("#quest-dialog").showModal(),
);
const modes = new Set(["intelligence"]);
$$(".mode").forEach((btn) =>
  btn.addEventListener("click", () => {
    $$(".mode").forEach((b) => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-pressed", String(b === btn));
    });
    scene?.setMode(btn.dataset.mode);
    modes.add(btn.dataset.mode);
    if (modes.size === 3) discover(1);
    tone(360);
  }),
);
$("#sound").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  $("#sound").setAttribute("aria-pressed", String(soundEnabled));
  $("#sound").setAttribute(
    "aria-label",
    soundEnabled ? "Disable interaction sounds" : "Enable interaction sounds",
  );
  $("#sound").title = soundEnabled ? "Sound on" : "Sound off";
  notify(copy[lang][soundEnabled ? "soundOn" : "soundOff"]);
  tone();
});
function applyMotion() {
  document.documentElement.classList.toggle("motion-paused", paused);
  $("#motion").setAttribute("aria-pressed", String(paused));
  $("#motion").setAttribute(
    "aria-label",
    paused ? "Resume animations" : "Pause animations",
  );
  $("#motion").title = paused ? "Resume animations" : "Pause animations";
  $("#motion span").textContent = paused ? "▷" : "Ⅱ";
  scene?.setPaused(paused);
  if (paused) {
    resetProjectDepths();
    $$(".reveal").forEach((el) => el.classList.add("visible"));
  }
  if (!paused && labRunning) startLabLoop();
}
$("#motion").addEventListener("click", () => {
  paused = !paused;
  applyMotion();
  notify(copy[lang][paused ? "motionOff" : "motionOn"]);
});
preference.addEventListener("change", (e) => {
  paused = e.matches;
  applyMotion();
});
new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) discover(3);
    }),
  { threshold: 0.4 },
).observe($(".about-text"));
$("#world").addEventListener("pointerdown", () => discover(0), { once: true });
$("#world").addEventListener("keydown", (e) => {
  if (["Enter", "ArrowLeft", "ArrowRight"].includes(e.key)) discover(0);
});
function commandEntries() {
  return [
    {
      label: copy[lang].navWork,
      action: () => jump("work"),
      type: copy[lang].sections,
    },
    {
      label: copy[lang].navAbout,
      action: () => jump("about"),
      type: copy[lang].sections,
    },
    {
      label: "Gravity sandbox",
      action: () => jump("lab"),
      type: copy[lang].sections,
    },
    {
      label: copy[lang].navContact,
      action: () => jump("contact"),
      type: copy[lang].sections,
    },
    ...projects.map((p) => ({
      label: p.name,
      action: () => openProject(p.id),
      type: copy[lang].project,
    })),
  ];
}
function jump(id) {
  $("#command-dialog").close();
  $("#" + id).scrollIntoView({ behavior: paused ? "instant" : "smooth" });
}
let filteredCommands = [];
function renderCommands() {
  const q = $("#command-input").value.toLowerCase();
  filteredCommands = commandEntries().filter((c) =>
    c.label.toLowerCase().includes(q),
  );
  $("#command-results").innerHTML = filteredCommands.length
    ? filteredCommands
        .map(
          (c, i) =>
            `<button data-command="${i}"><span>${c.label}</span><small>${c.type} ↗</small></button>`,
        )
        .join("")
    : `<p style="padding:15px;color:var(--muted);font-size:13px">${copy[lang].noResults}</p>`;
  $$("[data-command]").forEach((b) =>
    b.addEventListener("click", () => {
      $("#command-dialog").close();
      filteredCommands[Number(b.dataset.command)].action();
    }),
  );
}
function openCommands() {
  if ($("#command-dialog").open) return;
  $$("dialog[open]").forEach((d) => d.close());
  $("#command-input").value = "";
  renderCommands();
  $("#command-dialog").showModal();
  $("#command-input").focus();
}
$(".command-trigger").addEventListener("click", openCommands);
$("#command-input").addEventListener("input", renderCommands);
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openCommands();
  }
  if ($("#command-dialog").open) {
    const buttons = $$("[data-command]");
    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      const index = buttons.indexOf(document.activeElement);
      buttons[
        (index + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) %
          buttons.length
      ]?.focus();
    }
    if (e.key === "Enter" && document.activeElement === $("#command-input")) {
      e.preventDefault();
      buttons[0]?.click();
    }
  }
});

// This small physics study uses fixed simulation steps, independent of display refresh rate.
const canvas = $("#gravity"),
  ctx = canvas.getContext("2d");
let labRunning = false,
  labVisible = false,
  labFrame = 0,
  lastTime = 0,
  accumulator = 0,
  signalCount = 0;
const keys = new Set();
let probe,
  trail = [],
  signals = [];
function resetLab() {
  probe = { x: 0.2, y: 0.68, vx: 0.05, vy: -0.1 };
  trail = [];
  signals = [
    { x: 0.74, y: 0.25, found: false },
    { x: 0.79, y: 0.74, found: false },
    { x: 0.27, y: 0.24, found: false },
  ];
  signalCount = 0;
  updateLabScore();
  drawLab();
}
function updateLabScore() {
  $("#lab-score").textContent = `${copy[lang].signals} ${signalCount} / 3`;
}
function drawLab() {
  if (!ctx || !probe) return;
  const w = canvas.width,
    h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#191d16";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#9aaf7712";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#a0b57d20";
  [0.14, 0.25, 0.38].forEach((r) => {
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * r, h * r, 0, 0, Math.PI * 2);
    ctx.stroke();
  });
  const glow = ctx.createRadialGradient(
    w / 2,
    h / 2,
    0,
    w / 2,
    h / 2,
    h * 0.25,
  );
  glow.addColorStop(0, "#a0d75b30");
  glow.addColorStop(1, "#a0d75b00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 12, 0, Math.PI * 2);
  ctx.fillStyle = "#9aba69";
  ctx.fill();
  ctx.strokeStyle = "#d7ff75";
  signals.forEach((s, i) => {
    if (s.found) return;
    ctx.save();
    ctx.translate(s.x * w, s.y * h);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-7, -7, 14, 14);
    ctx.restore();
    ctx.fillStyle = "#8d9e79";
    ctx.font = "9px monospace";
    ctx.fillText(`0${i + 1}`, s.x * w + 14, s.y * h + 3);
  });
  if (trail.length > 1) {
    ctx.beginPath();
    trail.forEach((p, i) =>
      i ? ctx.lineTo(p.x * w, p.y * h) : ctx.moveTo(p.x * w, p.y * h),
    );
    ctx.strokeStyle = "#c0e38666";
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(probe.x * w, probe.y * h);
  ctx.rotate(Math.atan2(probe.vy * h, probe.vx * w));
  ctx.beginPath();
  ctx.moveTo(9, 0);
  ctx.lineTo(-6, -4);
  ctx.lineTo(-3, 0);
  ctx.lineTo(-6, 4);
  ctx.closePath();
  ctx.fillStyle = "#e6ffb3";
  ctx.fill();
  ctx.restore();
}
function physicsStep(dt) {
  const dx = 0.5 - probe.x,
    dy = 0.5 - probe.y,
    r2 = dx * dx + dy * dy + 0.035;
  const gravity = 0.018 / Math.pow(r2, 1.5);
  probe.vx += dx * gravity * dt;
  probe.vy += dy * gravity * dt;
  const thrust = 0.7 * dt;
  if (keys.has("left")) probe.vx -= thrust;
  if (keys.has("right")) probe.vx += thrust;
  if (keys.has("up")) probe.vy -= thrust;
  if (keys.has("down")) probe.vy += thrust;
  const speed = Math.hypot(probe.vx, probe.vy);
  if (speed > 0.45) {
    probe.vx *= 0.45 / speed;
    probe.vy *= 0.45 / speed;
  }
  probe.x += probe.vx * dt;
  probe.y += probe.vy * dt;
  if (probe.x < 0.025 || probe.x > 0.975) {
    probe.x = Math.max(0.025, Math.min(0.975, probe.x));
    probe.vx *= -0.7;
  }
  if (probe.y < 0.035 || probe.y > 0.965) {
    probe.y = Math.max(0.035, Math.min(0.965, probe.y));
    probe.vy *= -0.7;
  }
  trail.push({ x: probe.x, y: probe.y });
  if (trail.length > 230) trail.shift();
  for (const s of signals) {
    if (
      !s.found &&
      Math.hypot(
        (s.x - probe.x) * canvas.width,
        (s.y - probe.y) * canvas.height,
      ) < 24
    ) {
      s.found = true;
      signalCount++;
      updateLabScore();
      tone(700 + signalCount * 100);
      if (signalCount === 3) {
        labRunning = false;
        discover(4);
        notify(copy[lang].labDone);
        $("#lab-start").innerHTML =
          `<span class="overline">${copy[lang].labWin}</span><button class="button primary" id="relaunch">${copy[lang].labReplay} ↗</button>`;
        $("#lab-start").classList.remove("hidden");
        $("#relaunch").addEventListener("click", launchLab);
      }
    }
  }
}
function labTick(now) {
  labFrame = 0;
  if (!labRunning || paused || !labVisible || document.hidden) return;
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  accumulator += dt;
  while (accumulator >= 1 / 60) {
    physicsStep(1 / 60);
    accumulator -= 1 / 60;
  }
  drawLab();
  if (labRunning) labFrame = requestAnimationFrame(labTick);
}
function startLabLoop() {
  if (labFrame || !labRunning || paused || !labVisible || document.hidden)
    return;
  lastTime = performance.now();
  accumulator = 0;
  labFrame = requestAnimationFrame(labTick);
}
function launchLab() {
  resetLab();
  labRunning = true;
  $("#lab-start").classList.add("hidden");
  if (paused) {
    paused = false;
    applyMotion();
  }
  canvas.tabIndex = 0;
  canvas.focus({ preventScroll: true });
  startLabLoop();
}
$("#launch").addEventListener("click", launchLab);
$("#reset-lab").addEventListener("click", () => {
  if (!labRunning) {
    launchLab();
  } else {
    resetLab();
    startLabLoop();
  }
});
const directionMap = {
  ArrowLeft: "left",
  a: "left",
  ArrowRight: "right",
  d: "right",
  ArrowUp: "up",
  w: "up",
  ArrowDown: "down",
  s: "down",
};
document.addEventListener("keydown", (e) => {
  if (
    labRunning &&
    labVisible &&
    !$("dialog[open]") &&
    (document.activeElement === canvas ||
      $(".touch-controls").contains(document.activeElement))
  ) {
    const dir = directionMap[e.key];
    if (dir) {
      e.preventDefault();
      keys.add(dir);
    }
  }
});
document.addEventListener("keyup", (e) => {
  keys.delete(directionMap[e.key]);
});
window.addEventListener("blur", () => keys.clear());
$$("[data-direction]").forEach((btn) => {
  btn.addEventListener("pointerdown", (e) => {
    if (!labRunning) return;
    e.preventDefault();
    btn.setPointerCapture(e.pointerId);
    keys.add(btn.dataset.direction);
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((evt) =>
    btn.addEventListener(evt, () => keys.delete(btn.dataset.direction)),
  );
});
new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      labVisible = e.isIntersecting;
      if (labVisible) startLabLoop();
      else keys.clear();
    }),
  { threshold: 0.15 },
).observe(canvas);
document.addEventListener("visibilitychange", () => {
  keys.clear();
  if (!document.hidden) startLabLoop();
});
const canvasResize = new ResizeObserver(() => {
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.round(r.width * Math.min(devicePixelRatio, 1.5));
  canvas.height = Math.round(r.height * Math.min(devicePixelRatio, 1.5));
  drawLab();
});
canvasResize.observe(canvas);

// A fast route for a hiring reader, without replacing the exploratory page.
$(".brand-sub").textContent = "AI SYSTEMS & FULL-STACK";
$(".hero-copy").insertAdjacentHTML(
  "beforeend",
  '<div class="hero-links"></div>',
);
$(".hero-links").append($(".hero-copy .button"));
$(".hero-links").insertAdjacentHTML(
  "beforeend",
  '<a class="text-link" href="/profile.html" data-i18n="profile">Quick profile ↗</a>',
);
$(".contact-link").href = "mailto:i.kuriukin@icloud.com";
$(".contact-bottom").insertAdjacentHTML(
  "afterend",
  '<div class="contact-secondary"><a href="mailto:i.kuriukin@icloud.com">i.kuriukin@icloud.com ↗</a><a href="https://github.com/dzenlotus" target="_blank" rel="noopener noreferrer">GitHub / dzenlotus ↗</a><a href="/profile.html" data-i18n="profile">Quick profile ↗</a></div>',
);
$("#references-link").href = "/references.html";
$("#world").removeAttribute("role");
function localizeControls() {
  const ru = lang === "ru";
  const labels = [
    [".skip-link", ru ? "К проектам" : "Skip to projects"],
    [".section-number", ru ? "01 / ИЗБРАННЫЕ ПРОЕКТЫ" : "01 / SELECTED WORK"],
    [
      "#about .section-number",
      ru ? "02 / ЧЕЛОВЕК В СИСТЕМЕ" : "02 / THE HUMAN IN THE LOOP",
    ],
    [
      "#lab .section-number",
      ru ? "03 / НЕБОЛЬШОЙ ЭКСПЕРИМЕНТ" : "03 / A SMALL EXPERIMENT",
    ],
    [
      "#contact .section-number",
      ru ? "04 / СЛЕДУЮЩАЯ ГЛАВА" : "04 / NEXT CHAPTER",
    ],
  ];
  for (const [selector, text] of labels) $(selector).textContent = text;
  const arias = [
    [".brand", ru ? "Иван Курукин — главная" : "Ivan Kurukin home"],
    ["nav", ru ? "Основная навигация" : "Main navigation"],
    [".command-trigger", ru ? "Открыть поиск (⌘K)" : "Open command menu (⌘K)"],
    [".mode-control", ru ? "Режим 3D-скульптуры" : "Sculpture mode"],
    ["#quest-trigger", ru ? "Открыть наблюдения" : "Open field notes"],
    [
      "#command-dialog",
      ru ? "Найти проект или раздел" : "Find a project or section",
    ],
    [
      "#command-input",
      ru ? "Поиск проекта или раздела" : "Find a project or section",
    ],
    [
      "#gravity",
      ru
        ? "Гравитационный эксперимент: управляйте зондом стрелками или WASD и соберите три сигнала"
        : "Gravity sandbox: steer a probe with arrows or WASD and collect three signals",
    ],
  ];
  for (const [selector, text] of arias)
    $(selector).setAttribute("aria-label", text);
  $$(".dialog-close").forEach((b) =>
    b.setAttribute("aria-label", ru ? "Закрыть окно" : "Close dialog"),
  );
  $$(".touch-controls button").forEach((b) =>
    b.setAttribute(
      "aria-label",
      {
        left: ru ? "Тяга влево" : "Steer left",
        right: ru ? "Тяга вправо" : "Steer right",
        up: ru ? "Тяга вверх" : "Steer up",
        down: ru ? "Тяга вниз" : "Steer down",
      }[b.dataset.direction],
    ),
  );
  $(".touch-controls").setAttribute(
    "aria-label",
    ru ? "Направление тяги" : "Probe direction",
  );
  const artifact = $("#world canvas");
  if (artifact)
    artifact.setAttribute(
      "aria-label",
      ru
        ? "Орбитальная 3D-скульптура. Перетаскивайте для вращения. Стрелки влево и вправо выбирают проект; Enter открывает его."
        : "Interactive orbital sculpture. Drag to rotate. Left and right arrows select a project; Enter opens it.",
    );
  $("#motion").setAttribute(
    "aria-label",
    ru
      ? paused
        ? "Включить анимацию"
        : "Приостановить анимацию"
      : paused
        ? "Resume animations"
        : "Pause animations",
  );
  $("#sound").setAttribute(
    "aria-label",
    ru
      ? soundEnabled
        ? "Выключить звук"
        : "Включить звук"
      : soundEnabled
        ? "Disable interaction sounds"
        : "Enable interaction sounds",
  );
}
setLanguage();
resetLab();
applyMotion();
import("./scene.js")
  .then(async ({ createScene }) => {
    scene = await createScene($("#world"), {
      onDiscover: (id) => {
        discover(0);
        openProject(id);
      },
      reducedMotion: paused,
    });
    scene.setPaused(paused);
    scene.setMode($(".mode.active").dataset.mode);
    localizeControls();
  })
  .catch(() => {
    $("#world").dataset.scene = "fallback";
  });
