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
        r = analyzer.smooth_bars(probs("????????" + "D...D...D...D..."), 4)
        self.assertTrue(r["applied"])
        self.assertEqual(r["positions"], [1, 2, 3, 4] * 6)
        self.assertEqual(r["reanchors"], 0)

    def test_single_doubtful_downbeat_disappears(self):
        self.assertEqual(analyzer.smooth_bars(probs("D...D.d.D...D...D..."), 4)["positions"], [1, 2, 3, 4] * 5)

    def test_inserted_half_bar_reanchors(self):
        r = analyzer.smooth_bars(probs("D...D...D.." + "D...D...D...D..."), 4)
        self.assertEqual(r["reanchors"], 1)
        self.assertEqual(r["positions"][11:16], [1, 2, 3, 4, 1])   # from the new "1"; beats 9/10 are ambiguous

    def test_irregular_song_is_smoothed_too(self):
        # no share limit any more (Küçük Sevgilim: 44 % regular bars were left alone)
        r = analyzer.smooth_bars(probs("D...D.D.D.D...D.D..."), 4)
        self.assertTrue(r["applied"])

    def test_protect_1_lets_the_grid_overrule_a_clear_one(self):
        conf = probs("D...D...D.D.D...D...D...")   # a single extra "1" at beat 10, the grid goes on at 12
        conf[10] = 0.9
        ones = lambda r: [i for i, p in enumerate(r["positions"]) if p == 1]
        self.assertNotIn(10, ones(analyzer.smooth_bars(conf, 4, protect=1.0)))
        self.assertIn(10, ones(analyzer.smooth_bars(conf, 4, protect=0.85)))

    def test_clamp_protect(self):
        self.assertEqual(analyzer.clamp_protect("abc"), 0.85)
        self.assertEqual(analyzer.clamp_protect(None), 0.85)
        self.assertEqual(analyzer.clamp_protect(5), 1.0)
        self.assertEqual(analyzer.clamp_protect(0.1), 0.5)
        self.assertEqual(analyzer.clamp_protect("0.9"), 0.9)

    def test_pickup(self):
        self.assertEqual(analyzer.smooth_bars(probs("..D...D...D..."), 4)["positions"][:3], [3, 4, 1])

    def test_starts_on_one(self):
        self.assertEqual(analyzer.smooth_bars(probs("D...D...D..."), 4)["positions"][0], 1)

    def test_too_short(self):
        self.assertFalse(analyzer.smooth_bars(probs("D...D.."), 4)["applied"])

    def test_three_four(self):
        self.assertEqual(analyzer.smooth_bars(probs("D..D..?..D.."), 3)["positions"], [1, 2, 3] * 4)

    def test_extreme_probabilities(self):
        self.assertEqual(analyzer.smooth_bars([1.0, 0.0, 0.0, 0.0] * 3, 4)["positions"], [1, 2, 3, 4] * 3)


    def test_clear_downbeats_at_the_start_stay(self):
        # half bar inserted in bar 2: the song's first clear "1"s must not become a pickup
        r = analyzer.smooth_bars(probs("D...D.D...D...D...D..."), 4)
        ones = [i for i, p in enumerate(r["positions"]) if p == 1]
        self.assertEqual(ones[:3], [0, 4, 6])

    def test_isolated_clear_downbeat_stays(self):
        r = analyzer.smooth_bars(probs("D...D...D.D...D...D..."), 4)
        self.assertIn(10, [i for i, p in enumerate(r["positions"]) if p == 1])

    def test_realistic_near_zero_between_downbeats(self):
        conf = [0.97 if i % 4 == 0 else 0.001 for i in range(32)]
        conf[12] = 0.002                                    # model missed one downbeat
        self.assertEqual(analyzer.smooth_bars(conf, 4)["positions"], [1, 2, 3, 4] * 8)


if __name__ == "__main__":
    unittest.main()
