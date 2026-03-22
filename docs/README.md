# MeSame Documentation

This directory contains the VitePress documentation for MeSame.

## Development

Start the documentation dev server:

```bash
npm run docs:dev
```

The documentation will be available at `http://localhost:5173`.

## Build

Build the documentation for production:

```bash
npm run docs:build
```

The built files will be in `docs/.vitepress/dist`.

## Preview

Preview the built documentation:

```bash
npm run docs:preview
```

## Structure

- `index.md` — Home page
- `guide/` — User guides
  - `getting-started.md` — Installation and setup
  - `usage.md` — Using MeSame
  - `configuration.md` — Configuration options
  - `architecture.md` — Project architecture
  - `build.md` — Building executables
  - `troubleshooting.md` — Common issues
  - `contributing.md` — Contribution guide
- `.vitepress/config.mts` — VitePress configuration
- `public/` — Static assets

## Deployment

The documentation can be deployed to GitHub Pages using the built files in `docs/.vitepress/dist`.
