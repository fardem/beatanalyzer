"""Glossary checks of the language files (concept 3.2): Resolve terms stay English in every language."""

import json
import unittest
from pathlib import Path

LANG = Path(__file__).resolve().parents[2] / "lang"


def texts(code):
    out = []

    def walk(v):
        if isinstance(v, dict):
            for x in v.values():
                walk(x)
        elif isinstance(v, list):
            for x in v:
                walk(x)
        else:
            out.append(str(v))
    walk(json.loads((LANG / f"{code}.json").read_text(encoding="utf-8")))
    return out


class GlossaryTests(unittest.TestCase):
    def test_turkish_says_marker(self):
        # Resolve test 0.3.0: Resolve has no Turkish interface, so "marker" stays the English word (not "işaretçi")
        self.assertEqual([t for t in texts("tr") if "işaretç" in t.lower()], [])

    def test_progress_line_does_not_repeat_itself(self):
        # Resolve test 0.3.0: "Parça analiz ediliyor (analiz ediliyor)"
        for code in ("de", "en", "tr"):
            plugin = json.loads((LANG / f"{code}.json").read_text(encoding="utf-8"))["plugin"]
            task, step = plugin["task_analyze"].lower(), plugin["step_analyze"].lower()
            self.assertNotIn(step, task, code)


if __name__ == "__main__":
    unittest.main()
