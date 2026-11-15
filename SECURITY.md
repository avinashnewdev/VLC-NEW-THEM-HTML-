# Security Policy

**Project:** VLC New Theme HTML  
**Maintainer:** Avinash Jadhav  
**Version:** 1.0

## Reporting a vulnerability

Please do not publish exploit details in a public issue. Contact the maintainer privately through the GitHub profile at https://github.com/avinashnewdev and include:
- A clear description and potential impact.
- Reproduction steps or a proof of concept.
- Affected browser, operating system, and project version.

Please allow reasonable time for investigation and a fix before public disclosure.

## Scope and privacy

The demo plays audio files selected locally by the visitor and embeds YouTube through the official IFrame API. Do not submit private media, credentials, or personal data in public issues. Never add API secrets, access tokens, or passwords to this repository.

© 2026 Avinash Jadhav. All Rights Reserved.

## Network playlist security

- M3U imports accept only HTTP and HTTPS stream URLs; executable schemes such as `javascript:`, `file:`, and `data:` are rejected.
- Playlist names, channel names, and group labels are rendered as text, not trusted HTML.
- Remote playlist fetches omit credentials and use a request timeout. Remote playlist servers must enable CORS.
- Imported playlists are stored in local browser storage and are not sent to this GitHub repository. Do not store secret subscription URLs in shared devices or screenshots.
- The manager does not bypass DRM, authentication, geo-restrictions, or provider access controls.
