// Draw interface marks as vectors so iOS never substitutes color emoji.
const paths = {
  spark:
    '<path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"/><circle cx="12" cy="12" r="6"/>',
  "arrow-up-right": '<path d="M6 18 18 6M6 6h12v12"/>',
  "arrow-down-right": '<path d="m6 6 12 12M6 18h12V6"/>',
  "arrow-down-left": '<path d="M18 6 6 18M6 6v12h12"/>',
  "arrow-left": '<path d="M20 12H4m7-7-7 7 7 7"/>',
  "arrow-right": '<path d="M4 12h16m-7-7 7 7-7 7"/>',
  "arrow-up": '<path d="M12 20V4m-7 7 7-7 7 7"/>',
  "arrow-down": '<path d="M12 4v16m-7-7 7 7 7-7"/>',
  enter: '<path d="M20 4v9H4m6-6-6 6 6 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  circle: '<circle cx="12" cy="12" r="8"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="m8 5 11 7-11 7Z"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
};

export function icon(name) {
  if (!paths[name]) throw new Error(`Unknown interface icon: ${name}`);
  return `<svg class="icon icon-${name}" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}

const symbols = {
  "✳": "spark",
  "✶": "spark",
  "✦": "spark",
  "↗": "arrow-up-right",
  "↘": "arrow-down-right",
  "↙": "arrow-down-left",
  "←": "arrow-left",
  "→": "arrow-right",
  "↑": "arrow-up",
  "↓": "arrow-down",
  "↵": "enter",
  "⌕": "search",
  "✓": "check",
  "○": "circle",
  Ⅱ: "pause",
  "▷": "play",
  "×": "close",
};

// Only called on author-owned interface markup, never on visitor input.
export function iconify(markup) {
  return markup.replace(/[✳✶✦↗↘↙←→↑↓↵⌕✓○Ⅱ▷×]/gu, (symbol) =>
    icon(symbols[symbol]),
  );
}
