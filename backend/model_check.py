"""
Load the beat_this model once (beat_this downloads it into the torch hub cache on first use) and say why if that
fails. beat_this.inference.load_checkpoint turns every download error into "Could not load the checkpoint given
the provided name"; the real cause (no network, firewall, proxy, server down) is in the chained exception.

Called by install_and_run.bat:  python backend/model_check.py   (exit code 0 = model ready)
"""

import os
import sys
from typing import Callable, Optional, Tuple

CHECKPOINT = "final0"   # the model the analyzer uses (beat_this's default, main model, ~78 MB)
FILE_NAME = f"beat_this-{CHECKPOINT}.ckpt"
URL = f"https://cloud.cp.jku.at/public.php/dav/files/7ik4RrBKTS273gp/{CHECKPOINT}.ckpt"


def cause_of(err: BaseException) -> str:
    """The innermost exception behind err (through __cause__ / __context__), as 'Type: message'."""
    seen = set()
    while id(err) not in seen:
        seen.add(id(err))
        nxt = err.__cause__ or err.__context__
        if nxt is None:
            break
        err = nxt
    return f"{type(err).__name__}: {err}"


def cache_dir() -> str:
    """Folder where beat_this's checkpoint lands (torch hub cache)."""
    try:
        import torch
        return os.path.join(torch.hub.get_dir(), "checkpoints")
    except Exception:
        return os.path.join(os.path.expanduser("~"), ".cache", "torch", "hub", "checkpoints")


def _default_load():
    from beat_this.inference import load_checkpoint
    return load_checkpoint(CHECKPOINT, device="cpu")


def check(load: Optional[Callable] = None) -> Tuple[bool, str]:
    try:
        (load or _default_load)()
    except Exception as e:
        return False, "\n".join([
            f"Modell {CHECKPOINT} von beat_this konnte nicht geladen werden.",
            f"Ursache: {cause_of(e)}",
            f"Datei: {FILE_NAME}",
            f"Ordner: {cache_dir()}",
            f"Download von Hand: {URL}",
            f"Die Datei unter dem Namen {FILE_NAME} in den Ordner legen und BeatAnalyzer neu starten.",
        ])
    return True, f"Modell {CHECKPOINT} von beat_this bereit ({os.path.join(cache_dir(), FILE_NAME)})."


def main(load: Optional[Callable] = None) -> int:
    ok, text = check(load)
    print(text)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
