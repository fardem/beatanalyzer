"""
Language files lang/<code>.json: the only source of all texts (web app, Resolve script, markers, subtitles).
Nested keys become "a.b", lists become lines joined with "\\n". A missing key falls back to English.
"""

from __future__ import annotations

import json
import locale
import os
import sys
from pathlib import Path
from typing import Mapping, Optional

LANG_DIR = Path(__file__).resolve().parent.parent / "lang"
LANGUAGES = ("en", "de", "tr")


def _flatten(data: dict, prefix: str = "", out: Optional[dict] = None) -> dict:
    out = {} if out is None else out
    for key, value in data.items():
        name = f"{prefix}{key}"
        if isinstance(value, dict):
            _flatten(value, name + ".", out)
        elif isinstance(value, list):
            out[name] = "\n".join(str(v) for v in value)
        else:
            out[name] = str(value)
    return out


def load(code: str, lang_dir: Optional[Path] = None) -> dict[str, str]:
    """All texts of one language, flat; {} if the file is missing or broken."""
    path = Path(lang_dir or LANG_DIR) / f"{code}.json"
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, ValueError):
        return {}
    return _flatten(data) if isinstance(data, dict) else {}


def texts(code: str, lang_dir: Optional[Path] = None,
          sections: tuple[str, ...] = ("_meta", "plugin", "output")) -> dict[str, str]:
    """English as the base, the language on top; only keys of these sections."""
    merged = dict(load("en", lang_dir))
    if code != "en":
        merged.update(load(code, lang_dir))
    return {k: v for k, v in merged.items() if k.split(".", 1)[0] in sections}


def available(lang_dir: Optional[Path] = None) -> list[tuple[str, str]]:
    """(code, native name) of the languages with a file, in the order of LANGUAGES."""
    out = []
    for code in LANGUAGES:
        data = load(code, lang_dir)
        if data:
            out.append((code, data.get("_meta.name", code)))
    return out


def _windows_ui_language() -> str:
    try:
        import ctypes
        return locale.windows_locale.get(ctypes.windll.kernel32.GetUserDefaultUILanguage(), "")
    except Exception:
        return ""


def detect(env: Mapping[str, str] = os.environ, platform: str = sys.platform) -> str:
    """Language of the system if there is a file for it, else English."""
    candidates = []
    if platform == "win32":
        candidates.append(_windows_ui_language())
    candidates += [env.get("LC_ALL", ""), env.get("LC_MESSAGES", ""), env.get("LANG", "")]
    first = next((c for c in candidates if c), "")
    code = first[:2].lower()
    return code if code in LANGUAGES else "en"


def resolve_language(setting: str, env: Mapping[str, str] = os.environ, platform: str = sys.platform) -> str:
    """"auto" -> language of the system; a known code -> that code; anything else -> English."""
    if setting == "auto":
        return detect(env, platform)
    return setting if setting in LANGUAGES else "en"
