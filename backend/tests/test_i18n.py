"""Tests for backend/i18n.py and the language files lang/<code>.json."""

import json
import re
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import i18n  # noqa: E402


class I18nTests(unittest.TestCase):
    def test_all_languages_have_the_same_keys(self):
        keys = {c: set(i18n.load(c)) - {"_meta.review"} for c in i18n.LANGUAGES}
        self.assertTrue(keys["en"])
        self.assertEqual(keys["de"], keys["en"])
        self.assertEqual(keys["tr"], keys["en"])

    def test_same_placeholders_as_english(self):
        en = i18n.load("en")
        for code in ("de", "tr"):
            for key, value in i18n.load(code).items():
                if key in en:
                    self.assertEqual(set(re.findall(r"{(\w+)}", value)), set(re.findall(r"{(\w+)}", en[key])),
                                     (code, key))

    def test_values_from_spec(self):
        self.assertEqual(i18n.load("en")["output.intro"], "BeatAnalyzer\n{file}\n{bpm} BPM – {meter}")
        self.assertEqual(i18n.load("de")["output.bar_beat"], "Takt {bar} – Beat {beat}")
        self.assertEqual(i18n.load("tr")["output.meter_suffix.4"], "'lük")
        self.assertEqual(i18n.load("tr")["output.meter_suffix.16"], "'lık")
        self.assertEqual(i18n.load("de")["_meta.percent"], "{v} %")
        self.assertEqual(i18n.load("tr")["_meta.percent"], "%{v}")

    def test_texts_fall_back_to_english_and_filter_sections(self):
        tmp = Path(tempfile.mkdtemp())
        (tmp / "en.json").write_text(json.dumps({"output": {"a": "A", "b": "B"}, "web": {"x": "X"}}), encoding="utf-8")
        (tmp / "de.json").write_text(json.dumps({"output": {"a": "Ä"}}), encoding="utf-8")
        self.assertEqual(i18n.texts("de", lang_dir=tmp), {"output.a": "Ä", "output.b": "B"})

    def test_resolve_language(self):
        self.assertEqual(i18n.resolve_language("de"), "de")
        self.assertEqual(i18n.resolve_language("fr"), "en")
        self.assertEqual(i18n.resolve_language("auto", env={"LANG": "tr_TR.UTF-8"}, platform="linux"), "tr")
        self.assertEqual(i18n.resolve_language("auto", env={"LANG": "fr_FR.UTF-8"}, platform="linux"), "en")
        self.assertEqual(i18n.resolve_language("auto", env={}, platform="linux"), "en")

    def test_available(self):
        self.assertEqual(i18n.available(), [("en", "English"), ("de", "Deutsch"), ("tr", "Türkçe")])


if __name__ == "__main__":
    unittest.main()
