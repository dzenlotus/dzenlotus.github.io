# Ivan Kurukin — living systems

Personal portfolio and professional profile, built with vanilla JavaScript, Vite and Three.js.

**Live:** https://dzenlotus.github.io/

- Original procedural 3D sculpture with three modes and five selectable signals.
- Project studies, a printable professional profile, English and Russian.
- A quiet four-step exploration index.
- Keyboard navigation, reduced motion, pause, sound opt-in and a WebGL fallback.
- Self-hosted fonts. No analytics, tracking services or runtime API keys.

## Local development

```sh
npm ci
npm run dev
```

`npm run build` produces `dist/`. `npm run preview` serves the production build.

`npm test` checks that interface marks use SVG rather than font symbols that iOS can turn into emoji. Mobile controls stay in document flow and do not cover project content.

## Publication

Run `npm run deploy` to build and publish the static output to `gh-pages`. GitHub Pages serves that branch through its standard publishing mechanism. Source lives on `main`. This repository is a user site and uses Vite's default `/` base.

## References and scope

[Ten inspected personal websites](docs/references.md) informed the research. The composition, sculpture and implementation are original. Project covers use actual demo interfaces and one retained ImageGen spacecraft render, with bounded pointer depth; [visual provenance and asset paths](docs/project-artwork.md) are included. The selected projects have explicit public/private/experimental status. This is a project-based professional profile; no employment history or invented business metrics are implied.

Fonts: Space Grotesk and Instrument Serif (SIL Open Font License, distributed through Fontsource). Three.js and Vite are MIT-licensed.
