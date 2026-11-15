#!/usr/bin/env python3
"""Lightweight repository-integrity checks for the VLC HTML site."""
from html.parser import HTMLParser
from pathlib import Path
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
ORIGINAL = ROOT / "vlc_media_player_redesign_community (4).html"
README = ROOT / "README.md"
LICENSE = ROOT / "LICENSE"
SECURITY = ROOT / "SECURITY.md"

class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.duplicate_ids = []
        self.has_title = False
        self.has_app = False
        self.has_vlc_menu = False
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self.in_title = True
        if attrs.get("id") == "vlc-app":
            self.has_app = True
        if attrs.get("id") == "btn-vlc-menu":
            self.has_vlc_menu = True
        element_id = attrs.get("id")
        if element_id:
            if element_id in self.ids:
                self.duplicate_ids.append(element_id)
            self.ids.add(element_id)

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title and data.strip():
            self.has_title = True

def fail(message):
    print("ERROR:", message)
    sys.exit(1)

required = [
    INDEX, ORIGINAL, README, LICENSE, SECURITY,
    ROOT / "manifest.webmanifest", ROOT / "sw.js", ROOT / "icons/player-icon.svg",
    ROOT / "css/network-playlists.css", ROOT / "css/zoom-panel-behavior.css",
    ROOT / "css/miniplayer-video.css", ROOT / "js/network-playlists.js",
    ROOT / "js/video-codec-compat.js", ROOT / "js/youtube-playlists.js",
    ROOT / "js/zoom-panel-behavior.js", ROOT / "js/miniplayer-video.js",
    ROOT / "js/pwa-install.js", ROOT / "js/ffmpeg-wasm-decoder.js",
    ROOT / "js/player-enhancements.js",
]
for path in required:
    if not path.is_file():
        fail(f"Required project file is missing: {path.relative_to(ROOT)}")

parser = SiteParser()
try:
    html_text = INDEX.read_text(encoding="utf-8")
    parser.feed(html_text)
    parser.close()
except Exception as exc:
    fail(f"HTML parser could not read index.html: {exc}")

if not parser.has_title:
    fail("The homepage has no readable document title.")
if not parser.has_app:
    fail("The original #vlc-app root element is missing.")
if not parser.has_vlc_menu:
    fail("The original top-left VLC menu/logo button is missing.")

for asset in (
    "manifest.webmanifest", "css/network-playlists.css", "css/zoom-panel-behavior.css",
    "css/miniplayer-video.css", "js/network-playlists.js", "js/video-codec-compat.js",
    "js/youtube-playlists.js", "js/zoom-panel-behavior.js", "js/miniplayer-video.js",
    "js/pwa-install.js", "js/ffmpeg-wasm-decoder.js", "js/player-enhancements.js",
):
    if asset not in html_text:
        fail(f"Homepage does not link required module: {asset}")
if "VLCNetworkBridge" not in html_text:
    fail("Network player bridge is missing.")

try:
    manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))
    if manifest.get("display") != "standalone" or not manifest.get("icons"):
        fail("PWA manifest is missing standalone display or icons.")
except (ValueError, OSError) as exc:
    fail(f"PWA manifest is invalid: {exc}")

js_files = [
    "js/network-playlists.js", "js/video-codec-compat.js", "js/youtube-playlists.js",
    "js/zoom-panel-behavior.js", "js/miniplayer-video.js", "js/pwa-install.js", "js/ffmpeg-wasm-decoder.js", "js/player-enhancements.js", "sw.js",
]
for relative in js_files:
    try:
        subprocess.run(["node", "--check", str(ROOT / relative)], check=True, capture_output=True, text=True)
    except (subprocess.CalledProcessError, FileNotFoundError) as exc:
        fail(f"JavaScript syntax check failed for {relative}: " + (getattr(exc, "stderr", "") or str(exc)))

if parser.duplicate_ids:
    fail("Duplicate HTML id attributes: " + ", ".join(sorted(set(parser.duplicate_ids))))

readme_text = README.read_text(encoding="utf-8")
for link in ("index.html", "LICENSE", "SECURITY.md", "manifest.webmanifest", "sw.js", "js/video-codec-compat.js", "js/youtube-playlists.js", "js/zoom-panel-behavior.js", "js/miniplayer-video.js", ".github/workflows/pages.yml"):
    if link not in readme_text:
        fail(f"README.md does not link/document {link}")

print("OK: original source archive is preserved; modular player assets are linked.")
print("OK: VLC app root, top-left cone button, title and HTML IDs checked.")
print("OK: PWA manifest, service worker, module links and JavaScript syntax checked.")
print("OK: README, LICENSE, SECURITY and deployment workflow are connected.")
print("HTML integrity checks passed.")
