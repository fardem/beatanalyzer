"""Tests for backend/settings.py (settings.json)."""

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import settings  # noqa: E402


class SettingsTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.path = self.tmp / "settings.json"

    def test_missing_file_gives_defaults(self):
        self.assertEqual(settings.load(self.path), {"language": "auto"})

    def test_broken_json_gives_defaults(self):
        self.path.write_text("{kaputt", encoding="utf-8")
        self.assertEqual(settings.load(self.path), {"language": "auto"})

    def test_bom_from_notepad_is_accepted(self):
        self.path.write_bytes('﻿{"language": "tr"}'.encode("utf-8"))
        self.assertEqual(settings.load(self.path)["language"], "tr")

    def test_unknown_language_reads_as_auto(self):
        self.path.write_text('{"language": "fr"}', encoding="utf-8")
        self.assertEqual(settings.load(self.path)["language"], "auto")

    def test_save_and_load_keep_other_keys(self):
        self.path.write_text('{"language": "de", "other": 1}', encoding="utf-8")
        self.assertEqual(settings.save({"language": "tr"}, self.path), {"language": "tr", "other": 1})
        self.assertEqual(settings.load(self.path), {"language": "tr", "other": 1})

    def test_invalid_language_is_refused_and_file_unchanged(self):
        settings.save({"language": "de"}, self.path)
        with self.assertRaises(ValueError):
            settings.save({"language": "xx"}, self.path)
        self.assertEqual(settings.load(self.path)["language"], "de")

    def test_default_path_is_read_at_call_time(self):
        old = settings.SETTINGS_FILE
        settings.SETTINGS_FILE = self.path
        try:
            settings.save({"language": "de"})
            self.assertEqual(settings.load()["language"], "de")
        finally:
            settings.SETTINGS_FILE = old


if __name__ == "__main__":
    unittest.main()
