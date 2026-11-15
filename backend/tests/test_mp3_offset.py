"""Tests for backend/mp3_offset.py (offset of MP3 files in DaVinci Resolve)."""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import mp3_offset  # noqa: E402


def frame(version_bits=0b11, rate_index=0, mono=False, tag=b"Info", lame_delay=576, id3=0):
    """First frame of an MP3: header, side info, Xing/Info header with a LAME tag (as LAME and ffmpeg write it)."""
    head = bytes([0xFF, 0xE0 | (version_bits << 3) | (0b01 << 1) | 1, 0x90 | (rate_index << 2),
                  0xC0 if mono else 0x00])
    side = (17 if mono else 32) if version_bits == 0b11 else (9 if mono else 17)
    body = bytearray(head + bytes(side))
    if tag:
        body += tag + (0x0F).to_bytes(4, "big") + bytes(4 + 4 + 100 + 4)        # frames, bytes, TOC, quality
        if lame_delay is not None:
            lame = bytearray(b"LAME3.100" + bytes(27))
            lame[21] = lame_delay >> 4
            lame[22] = (lame_delay & 0xF) << 4
            body += lame
    prefix = b""
    if id3:
        prefix = b"ID3\x04\x00\x00" + bytes([0, 0, (id3 >> 7) & 0x7F, id3 & 0x7F]) + bytes(id3)
    return prefix + bytes(body) + bytes(400)


class Mp3OffsetTests(unittest.TestCase):
    def test_lame_44100(self):
        # the user's MP3 (LAME, 44.1 kHz): 1152 + 576 + 529 samples = 51.18 ms; Resolve showed about 48 ms
        self.assertAlmostEqual(mp3_offset.offset_from_bytes(frame()) * 1000, 51.18, places=2)

    def test_48000_and_id3_tag(self):
        self.assertAlmostEqual(mp3_offset.offset_from_bytes(frame(rate_index=1, id3=300)) * 1000, 47.02, places=2)

    def test_mpeg2_mono(self):
        # MPEG 2 at 22.05 kHz: frames of 576 samples
        off = mp3_offset.offset_from_bytes(frame(version_bits=0b10, mono=True, lame_delay=576))
        self.assertAlmostEqual(off, (576 + 576 + 529) / 22050, places=6)

    def test_xing_without_lame_tag_is_only_the_frame(self):
        self.assertAlmostEqual(mp3_offset.offset_from_bytes(frame(tag=b"Xing", lame_delay=None)), 1152 / 44100)

    def test_no_xing_frame_no_offset(self):
        self.assertEqual(mp3_offset.offset_from_bytes(frame(tag=None)), 0.0)

    def test_not_an_mp3(self):
        self.assertEqual(mp3_offset.offset_from_bytes(b"RIFF" + bytes(500)), 0.0)
        self.assertEqual(mp3_offset.resolve_offset("/does/not/exist.mp3"), 0.0)


if __name__ == "__main__":
    unittest.main()
