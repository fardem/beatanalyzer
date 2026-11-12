"""The Windows batch files: an unescaped & in echo or title runs the rest of the line as a command."""

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


class BatchFileTests(unittest.TestCase):
    def test_no_unescaped_ampersand_in_echo_or_title(self):
        bad = []
        for bat in sorted(ROOT.glob("*.bat")):
            for no, line in enumerate(bat.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
                stripped = line.strip()
                if not re.match(r"(?i)(@?echo|title)\b", stripped):
                    continue
                text = re.sub(r"\^&|&&|[12]?>&[12]?|>>?\s*\S+.*$", "", stripped)   # escaped, chained, redirects
                if "&" in text:
                    bad.append(f"{bat.name}:{no}: {stripped}")
        self.assertEqual(bad, [])


    def test_no_unescaped_parenthesis_in_echo_inside_blocks(self):
        # inside an if/else block a ")" in an echo ends the block early ("(bitte kurz warten)")
        bad = []
        for bat in sorted(ROOT.glob("*.bat")):
            depth = 0
            for no, line in enumerate(bat.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
                stripped = line.strip()
                is_echo = re.match(r"(?i)@?echo\b", stripped) is not None
                if is_echo and depth > 0:
                    text = re.sub(r"\^[()]", "", stripped)
                    text = re.sub(r"\s[12]?>>?\s*\S+.*$", "", text)   # redirect at the end
                    if "(" in text or ")" in text:
                        bad.append(f"{bat.name}:{no}: {stripped}")
                if not is_echo:
                    if stripped.startswith(")"):
                        depth -= 1
                    if stripped.endswith("(") and not stripped.startswith("::") and not stripped.lower().startswith("rem"):
                        depth += 1
        self.assertEqual(bad, [])

    def test_install_checks_beat_this_and_numpy(self):
        text = (ROOT / "install_and_run.bat").read_text(encoding="utf-8")
        self.assertIn("import numpy", text)
        self.assertIn("beat_this.inference", text)   # the module the analyzer imports


if __name__ == "__main__":
    unittest.main()
