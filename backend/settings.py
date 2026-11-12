"""
settings.json in the BeatAnalyzer folder: settings shared by web app, server and installer.
Not part of the repository or the release ZIP, so an update leaves it alone.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional

SETTINGS_FILE = Path(__file__).resolve().parent.parent / "settings.json"
LANGUAGE_CHOICES = ("auto", "en", "de", "tr")
DEFAULTS = {"language": "auto"}


def load(path: Optional[Path] = None) -> dict:
    """The settings; defaults for a missing or broken file, "auto" for an unknown language."""
    path = Path(path or SETTINGS_FILE)
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))   # utf-8-sig: Notepad writes a BOM
    except (OSError, ValueError):
        data = {}
    if not isinstance(data, dict):
        data = {}
    values = {**DEFAULTS, **data}
    if values["language"] not in LANGUAGE_CHOICES:
        values["language"] = "auto"
    return values


def save(values: dict, path: Optional[Path] = None) -> dict:
    """Merge values into the file and write it in one step. ValueError for an unknown language."""
    path = Path(path or SETTINGS_FILE)
    merged = {**load(path), **values}
    if merged["language"] not in LANGUAGE_CHOICES:
        raise ValueError(f"Unknown language: {merged['language']!r} (allowed: {', '.join(LANGUAGE_CHOICES)})")
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(merged, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)
    return merged
