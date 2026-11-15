# Security Policy

**Project:** VLC New Theme HTML Player  
**Maintainer:** Avinash Jadhav

## Reporting a vulnerability

Do not publish exploit details in a public issue. Contact the maintainer privately through https://github.com/avinashnewdev and include the impact, reproduction steps, affected browser/OS and project version. Allow reasonable time for investigation and remediation.

## Privacy and safe use

- Never commit API keys, passwords, cookies, access tokens, private playlist URLs or subscription credentials.
- IPTV playlist imports accept HTTP(S) stream URLs only. Names, groups and channel labels are rendered as text rather than trusted HTML.
- Remote playlist fetches omit credentials and use a timeout; the remote host must permit browser CORS requests.
- Imported playlist metadata is stored in local browser storage. It is not uploaded to GitHub by this app.
- The service worker caches only same-origin app-shell GET requests. It does not cache cross-origin streams or third-party YouTube media.
- The mini-player can create a second connection to a remote stream while its preview is open. Close the mini-player to stop the duplicate preview connection.
- YouTube playback uses the official embedded player and remains subject to YouTube's rules and access controls.
- The app does not bypass DRM, authentication, geo-restrictions, paywalls or provider controls.

## Codec handling

The HEVC/H.265 module detects browser-native support only. It does not claim to decode unsupported formats or execute downloaded codec binaries. Any future WebAssembly decoder must be reviewed for provenance, integrity, resource limits and license compatibility before inclusion.

© 2026 Avinash Jadhav. All Rights Reserved.
