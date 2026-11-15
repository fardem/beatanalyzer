"""
Offset of MP3 files in DaVinci Resolve.

BeatAnalyzer decodes MP3 gapless (soundfile/mpg123, ffmpeg and PyAV drop the Xing/Info frame and the encoder delay
from the LAME tag), so beat times count from the first real sample. Resolve plays the file without that: the
Xing/Info frame (silence) and the delay come first, the music starts later (test 0.2.2: about 50 ms). Markers in
Resolve have to be moved by this offset.
"""

from typing import Optional

DECODER_DELAY = 529   # samples every MP3 decoder adds (LAME documentation); not stored in the file

_RATES = {3: (44100, 48000, 32000), 2: (22050, 24000, 16000), 0: (11025, 12000, 8000)}   # MPEG 1, 2, 2.5


def _skip_id3v2(data: bytes) -> int:
    pos = 0
    while data[pos:pos + 3] == b"ID3" and len(data) >= pos + 10:
        size = (data[pos + 6] << 21) | (data[pos + 7] << 14) | (data[pos + 8] << 7) | data[pos + 9]
        pos += 10 + size + (10 if data[pos + 5] & 0x10 else 0)   # footer flag
    return pos


def resolve_offset(path: str) -> float:
    """Seconds Resolve plays this MP3 later than BeatAnalyzer analyses it; 0.0 without a Xing/Info frame or for
    another format."""
    try:
        with open(path, "rb") as f:
            data = f.read(256 * 1024)
    except OSError:
        return 0.0
    return offset_from_bytes(data)


def offset_from_bytes(data: bytes) -> float:
    pos = _skip_id3v2(data)
    # first frame header: 11 sync bits
    while pos + 4 <= len(data) and not (data[pos] == 0xFF and (data[pos + 1] & 0xE0) == 0xE0):
        pos += 1
    if pos + 4 > len(data):
        return 0.0
    h1, h2, h3 = data[pos + 1], data[pos + 2], data[pos + 3]
    version = (h1 >> 3) & 3          # 3 = MPEG 1, 2 = MPEG 2, 0 = MPEG 2.5
    layer = (h1 >> 1) & 3            # 1 = Layer III
    rate_index = (h2 >> 2) & 3
    if version not in _RATES or layer != 1 or rate_index == 3:
        return 0.0
    rate = _RATES[version][rate_index]
    mono = (h3 >> 6) & 3 == 3
    side = (17 if mono else 32) if version == 3 else (9 if mono else 17)
    tag = pos + 4 + side
    if data[tag:tag + 4] not in (b"Xing", b"Info"):
        return 0.0                   # no Xing/Info frame: every decoder starts the same way
    frame_samples = 1152 if version == 3 else 576
    samples = frame_samples          # the Xing/Info frame, played as silence by Resolve
    lame = _lame_delay(data, tag)
    if lame is not None:
        samples += lame + DECODER_DELAY
    return samples / rate


def _lame_delay(data: bytes, tag: int) -> Optional[int]:
    """Encoder delay from the LAME tag after the Xing header, None without one."""
    flags = int.from_bytes(data[tag + 4:tag + 8], "big")
    p = tag + 8 + (4 if flags & 1 else 0) + (4 if flags & 2 else 0) + (100 if flags & 4 else 0) + (4 if flags & 8 else 0)
    if data[p:p + 4] not in (b"LAME", b"Lavf", b"Lavc", b"GOGO") and not data[p:p + 4].isalnum():
        return None
    d = data[p + 21:p + 24]
    if len(d) < 3:
        return None
    return (d[0] << 4) | (d[1] >> 4)
