#!/usr/bin/env python3
"""Lightweight repository-integrity checks for the VLC HTML site."""
from html.parser import HTMLParser
from pathlib import Path
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
        self.tags = []
        self.has_title = False
        self.has_app = False
        self.has_vlc_menu = False
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append(tag)
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

for required in (INDEX, ORIGINAL, README, LICENSE, SECURITY):
    if not required.is_file():
        fail(f"Required linked project file is missing: {required.relative_to(ROOT)}")


parser = SiteParser()
try:
    parser.feed(INDEX.read_text(encoding="utf-8"))
    parser.close()
except Exception as exc:
    fail(f"HTML parser could not read index.html: {exc}")

if not parser.has_title:
    fail("The homepage has no readable document title.")
if not parser.has_app:
    fail("The original #vlc-app root element is missing.")
if not parser.has_vlc_menu:
    fail("The original top-left VLC menu/logo button is missing.")

for asset in (ROOT / "css/network-playlists.css", ROOT / "js/network-playlists.js"):
    if not asset.is_file():
        fail(f"Missing linked network module: {asset.relative_to(ROOT)}")
html_text = INDEX.read_text(encoding="utf-8")
if "css/network-playlists.css" not in html_text or "js/network-playlists.js" not in html_text:
    fail("Network playlist CSS/JS modules are not linked from index.html.")
if "VLCNetworkBridge" not in html_text:
    fail("Network player bridge is missing.")
try:
    subprocess.run(["node", "--check", str(ROOT / "js/network-playlists.js")], check=True, capture_output=True, text=True)
except (subprocess.CalledProcessError, FileNotFoundError) as exc:
    fail("IPTV JavaScript syntax check failed: " + (getattr(exc, "stderr", "") or str(exc)))
if parser.duplicate_ids:
    fail("Duplicate HTML id attributes: " + ", ".join(sorted(set(parser.duplicate_ids))))

readme_text = README.read_text(encoding="utf-8")
for link in ("index.html", "vlc_media_player_redesign_community (4).html", "LICENSE", "SECURITY.md", ".github/workflows/pages.yml"):
    if link not in readme_text:
        fail(f"README.md does not link/document {link}")

print("OK: original HTML source archive is preserved; homepage links modular IPTV assets.")
print("OK: VLC app root, top-left VLC cone button, title, and HTML IDs checked.")
print("OK: README, LICENSE, SECURITY, and deployment workflow are connected.")
print("HTML integrity checks passed.")
