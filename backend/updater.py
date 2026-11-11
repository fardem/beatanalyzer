"""
Update BeatThis from the newest GitHub release.

The release ZIP (BeatThis.zip) is built by .github/workflows/release.yml for every version tag.
Files the update replaces or removes go to update-backup/<old version>/ first. venv/ and files
that are not part of a release stay untouched. A Git checkout is not updated (use git pull there).

Command line: python backend/updater.py [check|update]
Private repository: set BEATTHIS_GITHUB_TOKEN to a token with read access to the repository.
"""

import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
import zipfile
from pathlib import Path
from typing import Callable, Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import resolve_plugin  # noqa: E402

GITHUB_REPO = "fardem/beatanalyzer"
RELEASE_API = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"
RELEASE_ASSET = "BeatThis.zip"
TEMP_DIR = "update-temp"
BACKUP_DIR = "update-backup"
MANIFEST = ".beatthis-files"           # program files of the installed release, one path per line
KEEP = {"venv", TEMP_DIR, BACKUP_DIR, "install_log.txt", ".git"}


class UpdateError(Exception):
    pass


def version_key(v: str) -> tuple:
    m = re.match(r"^v?(\d+(?:\.\d+)*)$", (v or "").strip())
    if not m:
        return (-1,)
    parts = [int(x) for x in m.group(1).split(".")]
    while len(parts) > 1 and parts[-1] == 0:
        parts.pop()
    return tuple(parts)


def newer(a: str, b: str) -> bool:
    return version_key(a) > version_key(b)


def read_version(folder: Path) -> str:
    return resolve_plugin.app_version(folder)


def _headers(accept: str) -> dict:
    h = {"User-Agent": "BeatThis-Updater", "Accept": accept}
    token = os.environ.get("BEATTHIS_GITHUB_TOKEN", "").strip()
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


def _get(url: str, accept: str = "application/vnd.github+json", timeout: float = 15) -> bytes:
    req = urllib.request.Request(url, headers=_headers(accept))
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def parse_release(data: dict) -> Optional[dict]:
    tag = str(data.get("tag_name") or "").strip()
    if not tag or data.get("draft") or data.get("prerelease") or version_key(tag) == (-1,):
        return None
    asset = next((a for a in data.get("assets", []) if a.get("name") == RELEASE_ASSET), None)
    if not asset:
        return None
    # The API URL of the asset works for public repositories and, with a token, for private ones.
    return {"version": tag.lstrip("v"), "zip": asset.get("url") or asset.get("browser_download_url"),
            "page": data.get("html_url") or ""}


def latest_release(timeout: float = 10) -> Optional[dict]:
    try:
        return parse_release(json.loads(_get(RELEASE_API, timeout=timeout)))
    except urllib.error.HTTPError as e:
        if e.code == 404:
            raise UpdateError("Kein Release gefunden (oder das Repository ist privat und "
                              "BEATTHIS_GITHUB_TOKEN ist nicht gesetzt).") from e
        raise UpdateError(f"GitHub antwortet mit HTTP {e.code}.") from e
    except OSError as e:
        raise UpdateError(f"GitHub nicht erreichbar: {e}") from e


def check(root: Path = PROJECT_ROOT, fetch: Callable[[], Optional[dict]] = latest_release) -> dict:
    current = read_version(root)
    try:
        release = fetch()
    except UpdateError as e:
        return {"current": current, "latest": None, "available": False, "error": str(e)}
    if not release:
        return {"current": current, "latest": None, "available": False, "error": "Kein Release gefunden."}
    return {"current": current, "latest": release["version"], "available": newer(release["version"], current),
            "page": release["page"], "zip": release["zip"]}


def download(url: str, dest: Path, timeout: float = 30):
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers=_headers("application/octet-stream"))
    with urllib.request.urlopen(req, timeout=timeout) as r, open(dest, "wb") as f:
        shutil.copyfileobj(r, f, 1 << 16)


def extract_release(zip_path: Path, dest: Path) -> Path:
    """Unpack and return the folder with the file VERSION; entries outside dest are refused."""
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    root = dest.resolve()
    with zipfile.ZipFile(zip_path) as z:
        for member in z.namelist():
            target = (dest / member).resolve()
            if target != root and root not in target.parents:
                raise UpdateError(f"Ungültiger Pfad im ZIP: {member}")
        z.extractall(dest)
    for cand in [dest, *sorted(p for p in dest.iterdir() if p.is_dir())]:
        if (cand / "VERSION").is_file() and (cand / "backend" / "server.py").is_file():
            return cand
    raise UpdateError("Das ZIP enthält kein BeatThis (VERSION oder backend/server.py fehlt).")


def release_files(folder: Path) -> list:
    out = []
    for p in sorted(folder.rglob("*")):
        rel = p.relative_to(folder)
        if p.is_file() and rel.parts[0] not in KEEP and rel.as_posix() != MANIFEST:
            out.append(rel.as_posix())
    return out


def read_manifest(folder: Path) -> list:
    try:
        return [x for x in (folder / MANIFEST).read_text(encoding="utf-8").splitlines() if x.strip()]
    except OSError:
        return []


def copy_program(src: Path, dst: Path, log=print) -> dict:
    """
    Copy the files of the new release to dst. Replaced files and program files of the old release that
    the new one has no more go to update-backup/<old version>/. Without a manifest (first update)
    the old files under dist/ count as program files, because their names change with every build.
    """
    new = release_files(src)
    old = read_manifest(dst) or [p.relative_to(dst).as_posix() for p in (dst / "dist").rglob("*") if p.is_file()]
    backup = dst / BACKUP_DIR / (read_version(dst) or "old")
    if backup.exists():
        shutil.rmtree(backup)
    changed_requirements = (src / "requirements.txt").read_bytes() != (
        (dst / "requirements.txt").read_bytes() if (dst / "requirements.txt").is_file() else b"")
    copied, removed = [], []
    for rel in new:
        s, d = src / rel, dst / rel
        if d.is_file():
            if d.read_bytes() == s.read_bytes():
                continue
            (backup / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(d, backup / rel)
        d.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(s, d)
        copied.append(rel)
    for rel in sorted(set(old) - set(new)):
        p = dst / rel
        if p.is_file():
            (backup / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(p), str(backup / rel))
            removed.append(rel)
    (dst / MANIFEST).write_text("\n".join(new) + "\n", encoding="utf-8")
    log(f"[Update] {len(copied)} Dateien ersetzt, {len(removed)} entfernt. Backup: {backup}")
    return {"copied": copied, "removed": removed, "requirements": changed_requirements, "backup": str(backup)}


def install_requirements(root: Path, log=print) -> bool:
    log("[Update] requirements.txt hat sich geändert - installiere Python-Pakete ...")
    r = subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(root / "requirements.txt")],
                       cwd=str(root))
    return r.returncode == 0


def update(root: Path = PROJECT_ROOT, release: Optional[dict] = None, log=print,
           pip: Callable[[Path], bool] = None) -> dict:
    root = Path(root)
    if (root / ".git").exists():
        raise UpdateError("Dieser Ordner ist ein Git-Checkout. Aktualisiere ihn mit 'git pull'.")
    info = check(root) if release is None else {"current": read_version(root), "latest": release["version"],
                                                 "available": newer(release["version"], read_version(root)),
                                                 "zip": release["zip"]}
    if info.get("error"):
        raise UpdateError(info["error"])
    if not info["available"]:
        return {"updated": False, "version": info["current"], "message": f"BeatThis {info['current']} ist aktuell."}
    tmp = root / TEMP_DIR
    zip_path = tmp / RELEASE_ASSET
    log(f"[Update] Lade BeatThis {info['latest']} ...")
    download(info["zip"], zip_path)
    src = extract_release(zip_path, tmp / "unpacked")
    if read_version(src) != info["latest"]:
        raise UpdateError(f"Das ZIP enthält Version {read_version(src)}, erwartet {info['latest']}.")
    result = copy_program(src, root, log)
    shutil.rmtree(tmp, ignore_errors=True)
    pip_ok = True
    if result["requirements"]:
        pip_ok = (pip or (lambda r: install_requirements(r, log)))(root)
    plugin = resolve_plugin.status()
    if plugin["state"] == "outdated":
        resolve_plugin.install()
        log(f"[Update] Resolve-Skript aktualisiert: {plugin['path']}")
    msg = f"BeatThis {info['latest']} installiert. Starte BeatThis neu (start.bat)."
    if not pip_ok:
        msg += " Achtung: Die Python-Pakete konnten nicht installiert werden - starte install_and_run.bat."
    return {"updated": True, "version": info["latest"], "message": msg, **result}


def main(argv) -> int:
    cmd = argv[1] if len(argv) > 1 else "check"
    try:
        if cmd == "check":
            info = check()
            if info.get("error"):
                print(f"[Update] {info['error']}")
                return 1
            print(f"[Update] Installiert: {info['current']} | Neuestes Release: {info['latest']}"
                  + (" -> Update verfügbar" if info["available"] else " -> aktuell"))
            return 0
        if cmd == "update":
            print(f"[Update] {update()['message']}")
            return 0
    except UpdateError as e:
        print(f"[Update] Fehler: {e}")
        return 1
    print("Aufruf: python backend/updater.py [check|update]")
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
