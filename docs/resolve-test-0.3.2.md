# Test – Version 0.3.2 (PyTorch CUDA build)

All points of 0.3.1 passed. This list only has what changed.

| # | What to do | What should happen |
|---|---|---|
| 1 | Get the new version, run `start.bat` | console: `PyTorch: 2.8.0+cu128 (CUDA 12.8 build)` under "Analysis" |
| 2 | Run `install_and_run.bat` on your PC (CUDA build already installed) | "PyTorch: wanted cu128 (NVIDIA driver supports CUDA 13.5), installed: cu128" and "[OK] PyTorch cu128 build kept." – nothing is downloaded |
| 3 | `debug_system.bat` | English texts; "PyTorch: 2.8.0+cu128 - CUDA 12.8 build", "GPU name: NVIDIA GeForce RTX 5080" |
| 4 | *(optional, needs time and download)* Copy of BeatAnalyzer in a new folder without `venv`, run `install_and_run.bat` | installs PyTorch 2.8.0 cu128 (about 3 GB); header of the web app "beat_this · CUDA (RTX 5080)" |
| 5 | *(optional)* In that copy: `venv\Scripts\pip install --force-reinstall torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cpu`, then `install_and_run.bat` again | "Replacing the CPU build of PyTorch with the CUDA build …", afterwards CUDA as in 4 |
| 6 | *(optional)* `set BEATANALYZER_TORCH=cpu` then `install_and_run.bat` in the copy | "wanted cpu (set by BEATANALYZER_TORCH=cpu)"; a CUDA build already there is kept |
