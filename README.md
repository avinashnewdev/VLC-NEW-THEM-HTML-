# VLC New Theme HTML — Version 1.0

**© 2026 Avinash Jadhav. All Rights Reserved.**

> Original project by Avinash Jadhav. This repository is proprietary software. No license is granted to copy, modify, redistribute, sublicense, or use it commercially without prior written permission.

[![Version](https://img.shields.io/badge/version-1.0-blue)](https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-/releases)
[![License](https://img.shields.io/badge/license-Proprietary-red)](./LICENSE)
[![Deploy](https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-/actions/workflows/pages.yml/badge.svg)](https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-/actions/workflows/pages.yml)

## Open the project

- **Live demo (after the first successful Pages deployment):** https://avinashnewdev.github.io/VLC-NEW-THEM-HTML-/
- **Repository:** https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-
- **Build / deployment status:** [GitHub Actions](https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-/actions)

## About

VLC New Theme HTML is an independently developed HTML-based media-player interface project by **Avinash Jadhav**. The live homepage uses the original uploaded file `vlc_media_player_redesign_community (4).html` from this repository, published as `index.html` for GitHub Pages. The original top-left VLC cone icon is part of that HTML (inline SVG), so no replacement logo has been substituted. Version **1.0** is the documentation/deployment release label; the original player design and code have been retained.

## Version 1.0 — included in this repository

- Original VLC-inspired player HTML published as the site homepage.
- Original top-left VLC cone icon retained from the HTML source.
- GitHub Actions workflow to publish the repository root to GitHub Pages.
- Project attribution, proprietary terms, and basic security guidance.

## Planned HTML roadmap

The following are **planned / future features**, not promises that they are already implemented:

- [ ] Integrate the complete original HTML theme and all existing player controls.
- [ ] Add playlist management, drag-and-drop import, favourites, and queue.
- [ ] Add subtitle selection and multi-audio-track support where the browser/player supports it.
- [ ] Add video fit, fill, stretch, zoom, and aspect-ratio controls.
- [ ] Add keyboard shortcuts, touch-friendly controls, and fullscreen refinements.
- [ ] Add language selection and accessible UI labels.
- [ ] Add theme customization, transparency, and accent controls.
- [ ] Add cross-browser testing and documented codec/container compatibility.

## Run locally

Open `index.html` in a modern browser, or run a local static server:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

## YouTube and audio notes

- YouTube videos are rendered by the official YouTube embedded player. Playback is subject to YouTube's terms, availability, embed permissions, and regional restrictions.
- This project does not extract, download, or separate audio from YouTube videos.
- Local audio is played only from files the visitor selects. The browser's Web Audio API is used for visualization; it does not upload the selected file.
- Browser codec support varies by browser, operating system, and media format. This demo does not guarantee support for every codec.

## Deployment with GitHub Actions

The workflow at `.github/workflows/pages.yml` publishes the repository root to GitHub Pages whenever code is pushed to `main`, and can also be run manually.

If the first deployment does not start, open **Settings → Pages** in the repository and set **Build and deployment → Source** to **GitHub Actions**. Then open the Actions tab and check the Pages workflow.

## Creator and version

- **Creator:** Avinash Jadhav
- **Version:** 1.0
- **Copyright:** © 2026 Avinash Jadhav. All Rights Reserved.
- **License:** Proprietary — see [LICENSE](./LICENSE).

## Ownership and contribution policy

Please do not assume that a public GitHub repository is open source. Public visibility only makes the repository viewable; it does not grant permission to reuse the code. The project owner retains all rights, subject to applicable third-party components and their respective licenses. Do not remove copyright or attribution notices.

For permission requests, contact the repository owner through the GitHub profile: https://github.com/avinashnewdev.

---
Made by **Avinash Jadhav**.
