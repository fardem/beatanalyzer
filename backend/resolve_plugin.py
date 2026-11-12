"""
Install resolve/BeatAnalyzer_Markers.lua into DaVinci Resolve's script folder.
Used by the web app (/api/resolve/*), install_and_run.bat, the server start and the updater.

The installed copy carries a BA-CONFIG block with the BeatAnalyzer folder, the Python of its venv, the
language from settings.json and the texts of all languages (lang/<code>.json). The copy in the repository
carries the English texts only (python backend/resolve_plugin.py template), so a script copied by hand works.
"""

import os
import re
import sys
from pathlib import Path
from typing import Optional

sys.path.insert(0, str(Path(__file__).resolve().parent))
import i18n  # noqa: E402
import settings  # noqa: E402

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PLUGIN_FILE = "BeatAnalyzer_Markers.lua"
PLUGIN_SOURCE = PROJECT_ROOT / "resolve" / PLUGIN_FILE
LEGACY_FILE = "BeatThis_Markers.lua"   # name up to 0.0.4; install() removes it from Resolve

_VERSION_LINE = re.compile(r'^local\s+VERSION\s*=\s*"([^"]*)"', re.M)

CONFIG_BEGIN = "-- >>> BA-CONFIG"
CONFIG_END = "-- <<< BA-CONFIG <<<"
_LUA_ESCAPES = {"\\": "\\\\", '"': '\\"', "\n": "\\n", "\r": "\\r", "\t": "\\t"}


def lua_string(s: str) -> str:
    """A Lua string literal; non-ASCII stays UTF-8, control characters become \\ddd."""
    out = []
    for ch in s:
        if ch in _LUA_ESCAPES:
            out.append(_LUA_ESCAPES[ch])
        elif ord(ch) < 32 or ord(ch) == 127:
            out.append("\\%03d" % ord(ch))
        else:
            out.append(ch)
    return '"' + "".join(out) + '"'


def _lua_value(value) -> str:
    return "nil" if value is None else lua_string(str(value))


def render_config(home: Optional[Path], python: Optional[Path], lang: str, texts: dict) -> str:
    """The BA-CONFIG block: keys sorted, languages in the given order."""
    lines = [
        CONFIG_BEGIN + " (written by backend/resolve_plugin.py - do not edit by hand) >>>",
        "local BA = {",
        f"  home = {_lua_value(home)},",
        f"  python = {_lua_value(python)},",
        f"  lang = {lua_string(lang)},",
        "  texts = {",
    ]
    for code, values in texts.items():
        lines.append(f"    [{lua_string(code)}] = {{")
        for key in sorted(values):
            lines.append(f"      [{lua_string(key)}] = {lua_string(values[key])},")
        lines.append("    },")
    lines += ["  },", "}", CONFIG_END]
    return "\n".join(lines) + "\n"


def apply_config(script: str, block: str) -> str:
    """Replace the lines from CONFIG_BEGIN to CONFIG_END (both included) with the block."""
    lines = script.splitlines(keepends=True)
    begin = next((i for i, line in enumerate(lines) if line.startswith(CONFIG_BEGIN)), None)
    end = next((i for i, line in enumerate(lines) if line.startswith(CONFIG_END)), None)
    if begin is None or end is None or end < begin:
        raise ValueError("BA-CONFIG block not found in the script")
    return "".join(lines[:begin]) + block + "".join(lines[end + 1:])


def venv_python(root: Path = PROJECT_ROOT, platform: str = sys.platform) -> Path:
    """Python of the venv; pythonw.exe on Windows, so a job from Resolve opens no console window."""
    if platform == "win32":
        return Path(root) / "venv" / "Scripts" / "pythonw.exe"
    return Path(root) / "venv" / "bin" / "python"


def template_config() -> str:
    """The block of the copy in the repository: no paths, English texts."""
    return render_config(None, None, "en", {"en": i18n.texts("en")})


def expected_config(platform: str = sys.platform) -> str:
    """The BA-CONFIG block of the installed script: paths, language from settings.json and all texts."""
    lang = i18n.resolve_language(settings.load()["language"])
    return render_config(PROJECT_ROOT, venv_python(PROJECT_ROOT, platform), lang,
                         {code: i18n.texts(code) for code in i18n.LANGUAGES})


def expected_script(platform: str = sys.platform) -> str:
    """The script as install() writes it."""
    return apply_config(PLUGIN_SOURCE.read_text(encoding="utf-8"), expected_config(platform))


def config_block(script: Optional[str]) -> Optional[str]:
    """The BA-CONFIG block of a script text (lines from CONFIG_BEGIN to CONFIG_END), or None."""
    if script is None:
        return None
    lines = script.splitlines(keepends=True)
    begin = next((i for i, line in enumerate(lines) if line.startswith(CONFIG_BEGIN)), None)
    end = next((i for i, line in enumerate(lines) if line.startswith(CONFIG_END)), None)
    if begin is None or end is None or end < begin:
        return None
    return "".join(lines[begin:end + 1])


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
    """VERSION of a BeatAnalyzer_Markers.lua, or None if the file does not exist."""
    try:
        text = Path(path).read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
    m = _VERSION_LINE.search(text)
    return m.group(1) if m else ""


def _installed_text(path: Path) -> Optional[str]:
    try:
        return Path(path).read_text(encoding="utf-8")
    except OSError:
        return None


def status(target_dir: Optional[Path] = None, env=os.environ, platform: str = sys.platform) -> dict:
    """state: "missing", "outdated" or "current"."""
    target_dir = Path(target_dir) if target_dir else scripts_dir(env, platform)
    target = target_dir / PLUGIN_FILE
    installed = script_version(target)
    current = script_version(PLUGIN_SOURCE) or ""
    legacy = script_version(target_dir / LEGACY_FILE)
    if installed is None and legacy is not None:
        installed, state = legacy, "outdated"   # only the script of an older version under its old name
    elif installed is None:
        state = "missing"
    elif installed != current or legacy is not None \
            or config_block(_installed_text(target)) != expected_config(platform):
        state = "outdated"   # other version, old script next to it, or other folder / language / texts

    else:
        state = "current"
    return {
        "resolveFound": resolve_installed(env, platform),
        "path": str(target),
        "installedVersion": installed,
        "version": current,
        "legacyInstalled": legacy is not None,
        "state": state,
    }


def install(target_dir: Optional[Path] = None, env=os.environ, platform: str = sys.platform) -> Path:
    """Write the script with its BA-CONFIG block into Resolve's script folder (UTF-8 without BOM, in one step)."""
    target_dir = Path(target_dir) if target_dir else scripts_dir(env, platform)
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / PLUGIN_FILE
    tmp = target.with_name(target.name + ".tmp")
    tmp.write_bytes(expected_script(platform).encode("utf-8"))
    os.replace(tmp, target)
    legacy = target_dir / LEGACY_FILE
    if legacy.exists():
        legacy.unlink()
    return target


def ensure_current(target_dir: Optional[Path] = None, env=os.environ, platform: str = sys.platform) -> bool:
    """Bring an installed, outdated script up to date; True if written. A missing script stays missing.
    Same version: only the BA-CONFIG block is rewritten, so edits elsewhere (e.g. the colours at the top) stay.
    Other version: the script is installed anew."""
    st = status(target_dir, env, platform)
    if st["state"] != "outdated":
        return False
    target = Path(st["path"])
    text = _installed_text(target)
    if st["installedVersion"] == st["version"] and not st["legacyInstalled"] and config_block(text) is not None:
        tmp = target.with_name(target.name + ".tmp")
        tmp.write_bytes(apply_config(text, expected_config(platform)).encode("utf-8"))
        os.replace(tmp, target)
        return True
    install(target_dir, env, platform)
    return True


def set_language(code: str, target_dir: Optional[Path] = None, env=os.environ, platform: str = sys.platform) -> dict:
    """Save the language in settings.json and bring an installed script up to date. ValueError for an unknown code."""
    settings.save({"language": code})
    return {
        "language": code,
        "resolvedLanguage": i18n.resolve_language(code),
        "pluginUpdated": ensure_current(target_dir, env, platform),
    }


def write_template() -> None:
    """Write the template block (English, no paths) into the script of the repository."""
    text = PLUGIN_SOURCE.read_text(encoding="utf-8")
    PLUGIN_SOURCE.write_bytes(apply_config(text, template_config()).encode("utf-8"))


def main(argv) -> int:
    """python backend/resolve_plugin.py [status|install|auto]; auto = install or update only if Resolve is there."""
    cmd = argv[1] if len(argv) > 1 else "status"
    st = status()
    if cmd == "template":
        write_template()
        print(f"[Resolve] Vorlage geschrieben: {PLUGIN_SOURCE}")
        return 0
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
        print("[Resolve] In Resolve: Workspace -> Scripts -> BeatAnalyzer_Markers (Resolve ggf. neu starten).")
        return 0
    print("Aufruf: python backend/resolve_plugin.py [status|install|auto|template]")
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
