"""Tests for smooth_bars in backend/analyzer.py (bar grid from beat_this downbeat probabilities)."""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import analyzer  # noqa: E402

LEVELS = {"D": 0.95, "d": 0.6, ".": 0.05, "?": 0.3}


def probs(pattern):
    """'D' sure downbeat, 'd' doubtful downbeat, '.' clearly no downbeat, '?' unsure."""
    return [LEVELS[c] for c in pattern]


class SmoothBarsTests(unittest.TestCase):
    def test_intro_is_counted_in_the_grid(self):
        r = analyzer.smooth_bars(probs("????????" + "D...D...D...D..."), 4, 74)
        self.assertTrue(r["applied"])
        self.assertEqual(r["positions"], [1, 2, 3, 4] * 6)
        self.assertEqual(r["reanchors"], 0)

    def test_single_doubtful_downbeat_disappears(self):
        self.assertEqual(analyzer.smooth_bars(probs("D...D.d.D...D...D..."), 4, 80)["positions"], [1, 2, 3, 4] * 5)

    def test_inserted_half_bar_reanchors(self):
        r = analyzer.smooth_bars(probs("D...D...D.." + "D...D...D...D..."), 4, 75)
        self.assertEqual(r["reanchors"], 1)
        self.assertEqual(r["positions"][11:16], [1, 2, 3, 4, 1])   # from the new "1"; beats 9/10 are ambiguous

    def test_irregular_song_is_left_alone(self):
        self.assertEqual(analyzer.smooth_bars(probs("D...D...D..."), 4, 40),
                         {"applied": False, "positions": [], "reanchors": 0})
        self.assertFalse(analyzer.smooth_bars(probs("D...D...D..."), 4, None)["applied"])

    def test_pickup(self):
        self.assertEqual(analyzer.smooth_bars(probs("..D...D...D..."), 4, 100)["positions"][:3], [3, 4, 1])

    def test_starts_on_one(self):
        self.assertEqual(analyzer.smooth_bars(probs("D...D...D..."), 4, 100)["positions"][0], 1)

    def test_too_short(self):
        self.assertFalse(analyzer.smooth_bars(probs("D...D.."), 4, 100)["applied"])

    def test_three_four(self):
        self.assertEqual(analyzer.smooth_bars(probs("D..D..?..D.."), 3, 90)["positions"], [1, 2, 3] * 4)

    def test_extreme_probabilities(self):
        self.assertEqual(analyzer.smooth_bars([1.0, 0.0, 0.0, 0.0] * 3, 4, 100)["positions"], [1, 2, 3, 4] * 3)


if __name__ == "__main__":
    unittest.main()
