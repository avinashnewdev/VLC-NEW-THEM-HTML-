# VLC New Theme HTML — Version 1.0

**© 2026 Avinash Jadhav. All Rights Reserved.**

> Original project and HTML interface by Avinash Jadhav. This is proprietary software. No permission for commercial use, redistribution, or modification is granted without prior written permission. See [LICENSE](LICENSE).

[![Version](https://img.shields.io/badge/version-1.0-blue)](https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-/releases)
[![Proprietary](https://img.shields.io/badge/license-proprietary-red)](LICENSE)
[![GitHub Pages](https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-/actions/workflows/pages.yml/badge.svg)](https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-/actions/workflows/pages.yml)
[![Validate](https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-/actions/workflows/pages.yml/badge.svg)](https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-/actions)

## Open / preview

- **Live website:** [Open VLC New Theme HTML](https://avinashnewdev.github.io/VLC-NEW-THEM-HTML-/) — available after GitHub Pages is enabled and the deployment succeeds.
- **Original HTML source:** [vlc_media_player_redesign_community (4).html](vlc_media_player_redesign_community%20(4).html)
- **Published homepage:** [index.html](index.html)
- **Deployment history:** [GitHub Actions](https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-/actions)
- **Repository:** [VLC-NEW-THEM-HTML-](https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-)

## About

This repository contains the original VLC-inspired media-player HTML interface created by **Avinash Jadhav**. The website homepage `index.html` is kept byte-for-byte identical to the preserved original source file `vlc_media_player_redesign_community (4).html`. The original VLC cone SVG at the top-left of the player is retained from that source; no substitute logo or redesigned demo is used.

- **Creator:** Avinash Jadhav
- **Version:** 1.0
- **Copyright:** © 2026 Avinash Jadhav. All Rights Reserved.
- **License:** Proprietary — [read LICENSE](LICENSE)
- **Security reporting:** [SECURITY.md](SECURITY.md)

## Repository map

| File | Purpose |
|---|---|
| `index.html` | GitHub Pages entry point; exact copy of the original HTML |
| `vlc_media_player_redesign_community (4).html` | Preserved original HTML source |
| `README.md` | Project overview, links, setup, and roadmap |
| `LICENSE` | Proprietary usage terms |
| `SECURITY.md` | Responsible vulnerability reporting |
| `.github/workflows/pages.yml` | HTML integrity checks and GitHub Pages deployment |
| `scripts/validate_site.py` | Automated checks for required files and original HTML integrity |
| `.nojekyll` | Disables Jekyll processing for static publishing |

## Version 1.0 and future roadmap

Version 1.0 packages the original HTML as the homepage, preserves the original VLC logo, documents ownership, and adds automated repository integrity checks plus GitHub Pages deployment configuration.

The items below are future improvements, not claims that they are already implemented:

- [ ] Expand automated browser testing across Chrome, Edge, and Firefox.
- [ ] Verify local media playback and codec/container compatibility on target browsers.
- [ ] Review every player control and fix confirmed interaction bugs without changing the design.
- [ ] Improve accessibility, keyboard navigation, and responsive layouts.
- [ ] Add multilingual UI support.
- [ ] Document supported media formats and limitations.

## Run locally

Use Python's built-in static server from the repository root:

```bash
python -m http.server 8000
```

Open http://localhost:8000 in your browser.

## Deployment

The workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs repository integrity checks and then publishes the repository root to GitHub Pages on pushes to `main`.

**One-time GitHub setting required:** open repository **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**, and save. GitHub currently reports Pages as not enabled for this repository; the workflow cannot enable that repository setting by itself. Once enabled, each push deploys automatically.

Check [Actions](https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-/actions) for validation and deployment results.

## Ownership and third-party notices

Public repository visibility does not grant permission to reuse the proprietary source. The owner retains rights in original work, subject to applicable third-party materials and their licenses. VLC and related marks belong to their respective owners; this is an independent interface/theme project and is not represented as an official VideoLAN release.

For permission requests, contact the owner through [GitHub](https://github.com/avinashnewdev).

---
Made by **Avinash Jadhav**.
