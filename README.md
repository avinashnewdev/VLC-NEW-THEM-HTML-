# VLC New Theme HTML Player

**© 2026 Avinash Jadhav. All Rights Reserved.**

This is an independent browser-based media player interface. It is proprietary software; see [LICENSE](LICENSE). VLC and related marks belong to their respective owners. This is not an official VideoLAN release.

## Open and install

- **Live player:** https://avinashnewdev.github.io/VLC-NEW-THEM-HTML-/
- **Repository:** https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-
- **Actions / deployment:** https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-/actions

On a supported desktop browser (Chrome or Edge), open the live player and use **Install App** when offered. If the button is unavailable, use the browser menu → **Install page as app** / **Apps → Install this site**. This installs the player shell as a desktop web app; it does not download YouTube videos or bypass streaming restrictions. The service worker caches the same-origin app shell for repeat visits. Media streams and third-party content are not cached.

## Features and modules

| File | Purpose |
|---|---|
| `index.html` | Player UI and playback integration |
| `js/network-playlists.js` | M3U/M3U8 channel-list import, search, play and export |
| `css/network-playlists.css` | Network playlist UI |
| `js/youtube-playlists.js` | YouTube / YouTube Music playlist URL parsing and official playlist embeds |
| `js/video-codec-compat.js` | Browser-native HEVC/H.265 capability detection |
| `js/zoom-panel-behavior.js` | Keeps 4-side zoom editor open until the user presses OK |
| `css/zoom-panel-behavior.css` | Zoom confirmation styling |
| `js/miniplayer-video.js` | Syncs video preview in the floating mini-player |
| `css/miniplayer-video.css` | Mini-player video styling |
| `js/pwa-install.js` | Desktop web-app install prompt and service-worker registration |
| `manifest.webmanifest` | PWA metadata |
| `sw.js` | Same-origin app-shell offline cache |
| `icons/player-icon.svg` | Install icon |
| `SECURITY.md` | Security and privacy notes |
| `scripts/validate_site.py` | HTML, module and repository checks |
| `vlc_media_player_redesign_community (4).html` | Preserved original source archive |

## Video zoom and HDR looks

The 4-side zoom pad applies adjustments live while the panel remains open. Press **OK** to close the panel after confirming the result. HDR10 / HDR10+ / Dolby Vision / HLG selections are **visual filter presets only**; browser JavaScript cannot switch the operating system's HDR decoder or force HDR output.

## HEVC / H.265 support

`js/video-codec-compat.js` checks whether the current browser reports native HEVC/H.265 playback support. It is a capability detector, not a standalone software decoder. A browser script cannot guarantee HEVC playback on a system without a suitable decoder. Actual support depends on browser, operating system, codec profile, licensing and hardware. The removed experimental FFmpeg/WebAssembly transcode utility was not a complete VLC-style codec engine.

## YouTube / YouTube Music playlists

Paste a YouTube Music or YouTube playlist URL into **Open Network Stream** (Auto or YouTube type). The player uses YouTube's official playlist embed. Playback is subject to YouTube's availability, embed permissions, account/region restrictions, browser autoplay rules and playlist privacy. This does not download or extract protected media.

## Mini-player

When the floating mini-player is opened, it mirrors the active video and follows playback time. A network video may open a second stream connection while the mini-player is visible, which can increase bandwidth use; close the mini-player to stop that preview.

## Codec, stream and browser limitations

This is a browser player, not VLC's native decoding engine. Playback depends on the browser's supported formats/codecs, operating-system media components, stream server CORS settings, network quality and provider restrictions. DRM, protected streams, unsupported codec profiles and some live HLS/DASH streams may not play. IPTV remote playlist import requires the playlist host to allow CORS; importing a downloaded local M3U file is the alternative.

Only use media and playlists you are authorized to access. Never commit subscription URLs, passwords, API keys, cookies or private tokens.

## Run locally

From the repository root:

```bash
python -m http.server 8000
```

Open http://localhost:8000. PWA installation and service workers require localhost or HTTPS; they do not work from a `file://` URL.

## Deployment and validation

GitHub Actions [workflow](.github/workflows/pages.yml) validates the project and publishes the repository root to GitHub Pages on pushes to `main`. See the [Actions history](https://github.com/avinashnewdev/VLC-NEW-THEM-HTML-/actions) for the latest run.

---
Made by **Avinash Jadhav**.


## User profiles, visual customization and online subtitles

- **Profile & Appearance** in Settings lets the user create, edit or delete a local profile. No sample or preset user profiles are created. Profile fields and visual preferences are stored in this browser's local storage and are not synced to a server.
- **Settings → Global Settings → Appearance → Visual Effects** provides interface glass blur, album-art background blur and artwork reflection controls. Settings are applied locally and persisted in the browser.
- The music spectrum reads the current album-art image palette where the browser permits canvas pixel access. Cross-origin artwork without CORS permission falls back to the player's accent color.
- **Online subtitles** uses the OpenSubtitles API. The user must supply their own OpenSubtitles API key in Settings → Edit Profile. Search uses the currently loaded media title where it can be detected. API limits, CORS, account and provider rules apply. API keys are stored locally in this browser; do not use a shared/public computer for private keys. Automatic best-match search is enabled by default once an API key is saved; it runs when a local video metadata event fires. You can disable automatic subtitle loading in the same settings section.


## Offline codec engine boundary

The experimental FFmpeg/WebAssembly transcode button and CDN loader have been removed. The replacement `js/offline-codec-engine.js` is a standalone integration adapter: it can use a desktop host exposed as `window.vlcNative` for native decoding, audio-track selection and subtitle loading, and it provides browser-native track/subtitle helpers where supported.

**Important:** this HTML/PWA build does not contain a native VLC/libVLC decoder. A browser JavaScript file cannot become VLC's native codec engine or guarantee offline HEVC/H.265 decoding on every device. The adapter reports native-engine availability instead of pretending unsupported codecs are decoded. Reliable offline HEVC/H.265, multi-audio and subtitle support requires packaging this UI in a desktop shell (for example Electron/Tauri) and implementing the host bridge with a licensed, correctly packaged libVLC build. Browser playback remains subject to browser/OS codec support.
