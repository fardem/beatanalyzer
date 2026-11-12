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


if __name__ == "__main__":
    unittest.main()
