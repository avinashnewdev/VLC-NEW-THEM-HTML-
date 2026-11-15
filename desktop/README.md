# Windows desktop build (Electron + libVLC)

This folder adds a native desktop host for the existing HTML interface. The HTML/PWA build remains browser-only; native decoding is available only in this Electron desktop build when a compatible libVLC runtime is installed.

## Requirements

- Windows 10/11 x64
- Node.js LTS and npm
- VLC/libVLC **x64** runtime matching the app architecture
- The libVLC SDK/runtime files: `libvlc.dll`, `libvlccore.dll`, and the complete `plugins/` directory

## Prepare libVLC

Copy the matching x64 libVLC runtime into `desktop/vendor/libvlc/` so that the folder contains `libvlc.dll`, `libvlccore.dll`, and `plugins/`. Do not copy only the DLL: VLC's codec/demux plugins are required. Keep the libVLC version and architecture consistent.

Alternatively set `LIBVLC_PATH` to the directory containing `libvlc.dll` before starting the app. The runtime and plugins must be legally redistributed under the applicable VideoLAN/libVLC licenses. Review the exact build's license notices before publishing installers.

## Run

```powershell
cd desktop
npm install
npm start
```

Build a Windows installer:

```powershell
npm run dist:win
```

The installer is written to `desktop/dist/`.

## Native features

- Local file opening through the native file picker
- libVLC playback and offline demux/decoder plugin pipeline
- Native audio track enumeration and selection
- Native subtitle track enumeration and selection
- External SRT/ASS/SSA/VTT/SUB subtitle loading

HEVC/H.265 availability depends on the actual libVLC build and its installed plugins. A codec being listed here is not proof that every profile, bit depth, HDR format, or damaged file will decode. Test with representative local files.

## Important current implementation boundary

The native video surface and FFI calls are an initial Windows integration. This repository has not yet been built or runtime-tested on a Windows machine with libVLC. Linux and macOS native video surfaces are not wired. The renderer bridge tracks the HTML video element's bounds; depending on Electron's window scaling, DPI and compositing behavior, the native surface may need platform-specific adjustment. Native codec/track operation must be verified with real media files before calling this a release-ready VLC replacement.

The Electron renderer keeps `nodeIntegration: false`, `contextIsolation: true`, and a narrow preload IPC bridge. Do not change these security defaults to make native playback work.
