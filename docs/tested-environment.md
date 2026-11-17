# Tested environment

BeatAnalyzer 0.3.x was tested on this PC (user's system, 2026-11-17).

| Part | Version |
|---|---|
| Operating system | Windows (64-bit) |
| Graphics card | NVIDIA GeForce RTX 5080, 16 GB |
| NVIDIA driver | 621.24 (CUDA UMD 13.5) |
| Python | 3.13 |
| PyTorch / torchaudio | 2.8.0+cu128 (CUDA 12.8 build) |
| CPJKU beat_this | git commit `b95c8ab0c58c2d9fcfd40508ae8dffbc05ac4f5c` |
| md_beat_this (optional) | `main` of fosfrancesco/md_beat_this |
| DaVinci Resolve | Studio 21 |

`install_and_run.bat` installs exactly this PyTorch version (`backend/torch_setup.py`): the CUDA 12.8 build when the
NVIDIA driver supports CUDA 12.8 or newer, otherwise the CPU build. On this PC the installer keeps the existing CUDA
build (tested with 0.3.2); a fresh installation with the new installer has not been run yet.

## Packages in the environment (`pip freeze`)

```
av==19.0.2
beat-this @ git+https://github.com/CPJKU/beat_this.git@b95c8ab0c58c2d9fcfd40508ae8dffbc05ac4f5c
certifi==2026.10.23
cffi==2.1.1
charset-normalizer==3.5.2
cloudpickle==3.1.2
colorama==0.4.6
decorator==5.3.1
einops==0.8.2
filelock==4.2.4
fsspec==2026.9.0
idna==3.20
Jinja2==3.1.6
joblib==1.6.0
lazy-loader==0.6
librosa==1.0.1
llvmlite==0.50.0
MarkupSafe==3.0.3
md-beat-this @ https://github.com/fosfrancesco/md_beat_this/archive/main.zip#sha256=11e9a688a6b739aaa2fc30ec3024067d31994ac35f7a955990f1c43d78c4adf9
mpmath==1.3.0
msgpack==1.2.4
narwhals==2.28.0
networkx==3.7
numba==0.68.1
numpy==2.5.4
packaging==26.3
platformdirs==4.14.5
pooch==1.9.0
pycparser==3.12
requests==2.34.2
rotary-embedding-torch==0.9.2
scikit-learn==1.9.1
scipy==1.18.1
setuptools==78.1.0
soundfile==0.14.0
soxr==1.1.0
sympy==1.14.0
threadpoolctl==3.8.0
torch==2.8.0+cu128
torchaudio==2.8.0+cu128
tqdm==4.70.1
typing_extensions==4.16.0
urllib3==2.8.0
```
