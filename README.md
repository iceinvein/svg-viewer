# SVG Viewer

A minimal web app to preview and inspect SVGs in the browser. Paste SVG, drag & drop files, adjust zoom and background, and export PNGs.

## Features

- Paste or drop .svg files (supports .svgz via on-load decompression)
- Zoom, pan, grid overlay, background toggle/color
- Basic SVGO optimization with selectable flags
- React component code generation from SVG

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS
- HeroUI components
- SVGO, pako, CodeMirror

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Notes

- You can customize site name/description in `src/config/site.ts`.
- Footer text lives in `src/layouts/default.tsx`.
- Update links in `src/config/site.ts` when you’re ready (currently empty).

## License

Add a license of your choice (e.g., MIT) in a LICENSE file.
