"""
Install resolve/BeatThis_Markers.lua into DaVinci Resolve's script folder.
Used by the web app (/api/resolve/*), install_and_run.bat and the updater.
"""

import os
import re
import sys
from pathlib import Path
from typing import Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PLUGIN_FILE = "BeatThis_Markers.lua"
PLUGIN_SOURCE = PROJECT_ROOT / "resolve" / PLUGIN_FILE

_VERSION_LINE = re.compile(r'^local\s+VERSION\s*=\s*"([^"]*)"', re.M)


def app_version(root: Path = PROJECT_ROOT) -> str:
    try:
        return (Path(root) / "VERSION").read_text(encoding="utf-8").strip()
    except OSError:
        return ""


def scripts_dir(env=os.environ, platform: str = sys.platform) -> Path:
    """Utility folder of Resolve's scripts: the script is listed on every page under Workspace -> Scripts."""
    if platform == "win32":
        base = Path(env.get("APPDATA") or Path.home() / "AppData" / "Roaming")
        root = base / "Blackmagic Design" / "DaVinci Resolve" / "Support" / "Fusion" / "Scripts"
    elif platform == "darwin":
        root = Path.home() / "Library" / "Application Support" / "Blackmagic Design" / "DaVinci Resolve" \
            / "Fusion" / "Scripts"
    else:
        root = Path.home() / ".local" / "share" / "DaVinciResolve" / "Fusion" / "Scripts"
    return root / "Utility"


def resolve_installed(env=os.environ, platform: str = sys.platform) -> bool:
    if platform == "win32":
        bases = [env.get("ProgramFiles", ""), env.get("APPDATA", "")]
        return any(b and (Path(b) / "Blackmagic Design" / "DaVinci Resolve").exists() for b in bases)
    if platform == "darwin":
        return Path("/Applications/DaVinci Resolve").exists()
    return Path("/opt/resolve").exists()


def script_version(path: Path) -> Optional[str]:
    """VERSION of a BeatThis_Markers.lua, or None if the file does not exist."""
    try:
        text = Path(path).read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
    m = _VERSION_LINE.search(text)
    return m.group(1) if m else ""


def status(target_dir: Optional[Path] = None, env=os.environ, platform: str = sys.platform) -> dict:
    """state: "missing", "outdated" or "current"."""
    target_dir = Path(target_dir) if target_dir else scripts_dir(env, platform)
    target = target_dir / PLUGIN_FILE
    installed = script_version(target)
    current = script_version(PLUGIN_SOURCE) or ""
    if installed is None:
        state = "missing"
    elif installed != current:
        state = "outdated"
    else:
        state = "current"
    return {
        "resolveFound": resolve_installed(env, platform),
        "path": str(target),
        "installedVersion": installed,
        "version": current,
        "state": state,
    }


def install(target_dir: Optional[Path] = None, env=os.environ, platform: str = sys.platform) -> Path:
    """Copy the script into Resolve's script folder (UTF-8 without BOM, replaced in one step)."""
    target_dir = Path(target_dir) if target_dir else scripts_dir(env, platform)
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / PLUGIN_FILE
    tmp = target.with_name(target.name + ".tmp")
    tmp.write_bytes(PLUGIN_SOURCE.read_bytes())
    os.replace(tmp, target)
    return target


def main(argv) -> int:
    """python backend/resolve_plugin.py [status|install|auto]; auto = install or update only if Resolve is there."""
    cmd = argv[1] if len(argv) > 1 else "status"
    st = status()
    if cmd == "status":
        print(st)
        return 0
    if cmd == "auto" and not st["resolveFound"]:
        print("[Resolve] DaVinci Resolve nicht gefunden - Skript nicht installiert.")
        return 0
    if cmd == "auto" and st["state"] == "current":
        print(f"[Resolve] Skript ist aktuell ({st['version']}): {st['path']}")
        return 0
    if cmd in ("install", "auto"):
        target = install()
        print(f"[Resolve] Skript installiert ({st['version']}): {target}")
        print("[Resolve] In Resolve: Workspace -> Scripts -> BeatThis_Markers (Resolve ggf. neu starten).")
        return 0
    print("Aufruf: python backend/resolve_plugin.py [status|install|auto]")
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
