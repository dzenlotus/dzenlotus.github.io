import { icon, iconify } from "./icons.js";
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
      "Four ways to explore the work. No locked content, no scores — just things worth trying.",
    readCase: "Explore the project",
    conceptStudy: "CONCEPT STUDY",
    demoInterface: "DEMO INTERFACE",
    runtimeCapture: "RUNTIME CAPTURE",
    approach: "ENGINEERING FOCUS",
    contribution: "MY CONTRIBUTION",
    viewSource: "Public repository ↗",
    visit: "Visit project ↗",
    preview: "Download preview ↗",
    profile: "Quick profile ↗",
    noteFound: "Field note added",
    questNames: [
      "Explore the 3D instrument",
      "Switch between all three systems",
      "Open a project study",
      "Read the engineering perspective",
    ],
    reward:
      "All four observations recorded. The interesting part was always the exploration.",
    contactEmail: "Email ↗",
    availability: "ENGINEERING ROLES & COLLABORATIONS",
    commandPlaceholder: "Find a project or jump somewhere…",
    sections: "SECTION",
    project: "PROJECT",
    noResults: "No matching results.",
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
      "Четыре способа познакомиться с работой. Всё доступно сразу: просто несколько вещей, которые стоит попробовать.",
    readCase: "Подробнее о проекте",
    conceptStudy: "КОНЦЕПТ",
    demoInterface: "ДЕМО-ИНТЕРФЕЙС",
    runtimeCapture: "ЗАХВАТ ИНТЕРФЕЙСА",
    approach: "ИНЖЕНЕРНЫЙ ФОКУС",
    contribution: "МОЙ ВКЛАД",
    viewSource: "Открытый репозиторий ↗",
    visit: "Сайт проекта ↗",
    preview: "Скачать preview ↗",
    profile: "Короткий профиль ↗",
    noteFound: "Наблюдение записано",
    questNames: [
      "Исследовать 3D-механизм",
      "Переключить все три системы",
      "Изучить проект",
      "Прочитать об инженерном подходе",
    ],
    reward:
      "Все четыре наблюдения записаны. Главное здесь — сам процесс исследования.",
    contactEmail: "Написать ↗",
    availability: "ИНЖЕНЕРНЫЕ РОЛИ И СОТРУДНИЧЕСТВО",
    commandPlaceholder: "Найти проект или раздел…",
    sections: "РАЗДЕЛ",
    project: "ПРОЕКТ",
    noResults: "Ничего не найдено.",
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
        "A sanitized capture of the running Mudra terminal interface, shown in a desktop window.",
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
        "Обезличенный захват работающего терминального интерфейса Mudra в окне приложения.",
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
        "The actual Worklife demo interface showing sample vacancies, match explanations and application statuses.",
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
        "Демонстрационный интерфейс Worklife: примеры вакансий, пояснения соответствия и статусы откликов.",
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
    website: "https://pholiant.space/",
    category: "INTERACTIVE PRODUCT",
    tags: ["Python", "Next.js", "React", "Telegram"],
    en: {
      imageAlt:
        "The spells screen from the Book of Shadow Mini App, captured locally with demo data.",
      secondaryImageAlt:
        "The skills screen from the Book of Shadow Mini App, captured locally with demo data.",
      subtitle: "A spell book that lives in your chat.",
      description:
        "A Telegram game and companion Mini App that turn spells, rituals and progression into a shared interactive world.",
      lead: "A persistent game world where chat interactions, mechanics and a visual grimoire meet.",
      focus:
        "Telegram interaction design, game-state consistency, progression systems and a multilingual Mini App.",
      contribution:
        "Backend mechanics, Telegram workflows, frontend interactions and iterative product development.",
      status:
        "Public website and Telegram Mini App. The codebase is private; these interface captures use demo data.",
    },
    ru: {
      imageAlt:
        "Экран заклинаний Mini App Book of Shadow, снятый локально с демонстрационными данными.",
      secondaryImageAlt:
        "Экран развития Mini App Book of Shadow, снятый локально с демонстрационными данными.",
      subtitle: "Книга заклинаний, живущая в чате.",
      description:
        "Игра в Telegram и Mini App, объединяющие заклинания, ритуалы и развитие персонажей в общий интерактивный мир.",
      lead: "Постоянный игровой мир на пересечении общения, механик и визуального гримуара.",
      focus:
        "Взаимодействие в Telegram, согласованность состояния игры, прогрессия и многоязычный Mini App.",
      contribution:
        "Серверные механики, Telegram-сценарии, интерфейс и последовательное развитие продукта.",
      status:
        "Публичный сайт и Telegram Mini App. Кодовая база закрыта; на снимках интерфейса использованы демонстрационные данные.",
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
function projectVisual(p) {
  if (p.id === "abyss")
    return `<img class="project-image" src="/images/${p.id}.webp" width="1536" height="1024" alt="${p[lang].imageAlt}" loading="lazy" decoding="async" draggable="false">`;
  const capture = (file, width, height, alt) =>
    `<img class="product-capture" src="/images/product/${file}" width="${width}" height="${height}" alt="${alt}" loading="lazy" decoding="async" draggable="false">`;
  if (p.id === "magik")
    return `<span class="product-stage product-stage--phones"><span class="product-phone product-phone--spells">${capture("book-spells.jpg", 430, 932, p[lang].imageAlt)}</span><span class="product-phone product-phone--skills">${capture("book-skills.jpg", 430, 932, p[lang].secondaryImageAlt)}</span></span>`;
  const terminal = p.id === "mudra";
  return `<span class="product-stage"><span class="product-window product-window--${terminal ? "terminal" : "browser"}"><span class="product-window-chrome" aria-hidden="true"><span class="window-dots"><i></i><i></i><i></i></span><span>${terminal ? "mudra" : "Worklife"}</span><span class="window-chrome-spacer"></span></span>${terminal ? capture("mudra-runtime.png", 1600, 1050, p[lang].imageAlt) : capture("worklife-jobs.webp", 1440, 1080, p[lang].imageAlt)}</span></span>`;
}
function renderProjects() {
  $("#projects").innerHTML = iconify(
    projects
      .map(
        (p, i) =>
          `<article class="project reveal" id="project-${p.id}"><button class="project-visual${p.id === "abyss" ? "" : ` project-product project-product--${p.id}`}" data-project="${p.id}" aria-label="${copy[lang].readCase}: ${p.name}">${projectVisual(p)}<span class="visual-corner">${copy[lang][p.id === "abyss" ? "conceptStudy" : p.id === "mudra" ? "runtimeCapture" : "demoInterface"]} / 00${i + 1}</span><span class="visual-open" aria-hidden="true">↗</span></button><div class="project-copy"><div class="project-meta"><span class="project-num">0${i + 1}</span><span>${p.category}</span></div><h3>${p.name}</h3><span class="project-subtitle">${p[lang].subtitle}</span><p class="project-description">${p[lang].description}</p><div class="tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div><button class="project-open" data-project="${p.id}"><span>${copy[lang].readCase}</span><span aria-hidden="true">↗</span></button></div></article>`,
      )
      .join(""),
  );
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
    if (value) el.innerHTML = iconify(value);
  });
  $("#command-input").placeholder = copy[lang].commandPlaceholder;
  renderProjects();
  renderQuests();
  renderCommands();
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
  notify(
    `${copy[lang].noteFound} · ${completed.size}/${copy[lang].questNames.length}`,
  );
}
function renderQuests() {
  $("#quest-count").textContent =
    `${completed.size}/${copy[lang].questNames.length}`;
  $(".quest-progress i").style.width =
    `${(completed.size / copy[lang].questNames.length) * 100}%`;
  $("#quest-list").innerHTML = iconify(
    copy[lang].questNames
      .map(
        (q, i) =>
          `<li class="${completed.has(i) ? "complete" : ""}"><span class="check">${completed.has(i) ? "✓" : "○"}</span><span>${q}</span></li>`,
      )
      .join(""),
  );
  $("#quest-reward").textContent =
    completed.size === copy[lang].questNames.length ? copy[lang].reward : "";
}
let currentProject = "mudra";
function renderProject(id) {
  const p = projects.find((p) => p.id === id);
  if (!p) return;
  $("#project-detail").innerHTML = iconify(
    `<span class="overline">${p.category}</span><h2 id="project-modal-title">${p.name}</h2><p class="detail-lead">${p[lang].lead}</p><div class="tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div><div class="detail-grid"><div><h3>${copy[lang].approach}</h3><p>${p[lang].focus}</p></div><div><h3>${copy[lang].contribution}</h3><p>${p[lang].contribution}</p></div></div><p class="detail-status">${p[lang].status}</p><div class="detail-links">${p.link ? `<a href="${p.link}" target="_blank" rel="noopener noreferrer">${copy[lang].viewSource}</a>` : ""}${p.website ? `<a href="${p.website}" target="_blank" rel="noopener noreferrer">${copy[lang].visit}</a>` : ""}${p.preview ? `<a href="${p.preview}" target="_blank" rel="noopener noreferrer">${copy[lang].preview}</a>` : ""}<a href="mailto:i.kuriukin@icloud.com">${copy[lang].contactEmail}</a></div>`,
  );
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
  $("#motion span").innerHTML = icon(paused ? "play" : "pause");
  scene?.setPaused(paused);
  if (paused) {
    resetProjectDepths();
    $$(".reveal").forEach((el) => el.classList.add("visible"));
  }
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
  $("#command-results").innerHTML = iconify(
    filteredCommands.length
      ? filteredCommands
          .map(
            (c, i) =>
              `<button data-command="${i}"><span>${c.label}</span><small>${c.type} ↗</small></button>`,
          )
          .join("")
      : `<p style="padding:15px;color:var(--muted);font-size:13px">${copy[lang].noResults}</p>`,
  );
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

// A fast route for a hiring reader, without replacing the exploratory page.
$(".brand-sub").textContent = "AI SYSTEMS & FULL-STACK";
$(".hero-copy").insertAdjacentHTML(
  "beforeend",
  '<div class="hero-links"></div>',
);
$(".hero-links").append($(".hero-copy .button"));
$(".hero-links").insertAdjacentHTML(
  "beforeend",
  iconify(
    '<a class="text-link" href="/profile.html" data-i18n="profile">Quick profile ↗</a>',
  ),
);
$(".contact-link").href = "mailto:i.kuriukin@icloud.com";
$(".contact-bottom").insertAdjacentHTML(
  "afterend",
  iconify(
    '<div class="contact-secondary"><a href="mailto:i.kuriukin@icloud.com">i.kuriukin@icloud.com ↗</a><a href="https://github.com/dzenlotus" target="_blank" rel="noopener noreferrer">GitHub / dzenlotus ↗</a><a href="/profile.html" data-i18n="profile">Quick profile ↗</a></div>',
  ),
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
      "#contact .section-number",
      ru ? "03 / СЛЕДУЮЩАЯ ГЛАВА" : "03 / NEXT CHAPTER",
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
  ];
  for (const [selector, text] of arias)
    $(selector).setAttribute("aria-label", text);
  $$(".dialog-close").forEach((b) =>
    b.setAttribute("aria-label", ru ? "Закрыть окно" : "Close dialog"),
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
