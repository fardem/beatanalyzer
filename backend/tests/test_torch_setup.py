"""Choice of the PyTorch build by install_and_run.bat (backend/torch_setup.py)."""

import sys
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import torch_setup as ts  # noqa: E402

# header of nvidia-smi on the user's PC (driver 621.24, RTX 5080), and the older format
NEW_HEADER = "| NVIDIA-SMI 621.24                 KMD Version: 621.24        CUDA UMD Version: 13.5     |"
OLD_HEADER = "| NVIDIA-SMI 560.94    Driver Version: 560.94    CUDA Version: 12.6     |"


class ParseTests(unittest.TestCase):
    def test_new_and_old_nvidia_smi_format(self):
        self.assertEqual(ts.parse_cuda_version(NEW_HEADER), (13, 5))
        self.assertEqual(ts.parse_cuda_version(OLD_HEADER), (12, 6))

    def test_no_version(self):
        self.assertIsNone(ts.parse_cuda_version("NVIDIA-SMI has failed"))
        self.assertIsNone(ts.parse_cuda_version(None))

    def test_no_nvidia_smi(self):
        with mock.patch.object(ts.subprocess, "run", side_effect=FileNotFoundError):
            self.assertIsNone(ts.driver_cuda_version())


class ChoiceTests(unittest.TestCase):
    def test_new_driver_gets_cu128(self):
        # RTX 50 cards need CUDA 12.8; the user's tested setup is torch 2.8.0+cu128
        self.assertEqual(ts.choose_build(None, (13, 5))[0], "cu128")
        self.assertEqual(ts.choose_build("auto", (12, 8))[0], "cu128")

    def test_older_driver(self):
        self.assertEqual(ts.choose_build(None, (12, 6))[0], "cu126")
        build, reason = ts.choose_build(None, (11, 8))
        self.assertEqual(build, "cpu")
        self.assertIn("update the driver", reason)

    def test_no_card_gets_cpu(self):
        self.assertEqual(ts.choose_build(None, None), ("cpu", "no NVIDIA graphics card or driver found"))

    def test_override(self):
        # e.g. a user who keeps the same build as another program
        self.assertEqual(ts.choose_build("CPU", (13, 5))[0], "cpu")
        self.assertEqual(ts.choose_build("cu126", None)[0], "cu126")
        self.assertEqual(ts.choose_build("nonsense", (12, 8))[0], "cu128")   # unknown value: automatic


class PlanTests(unittest.TestCase):
    def test_plan(self):
        self.assertEqual(ts.plan("cu128", None), "install")
        self.assertEqual(ts.plan("cu128", "cpu"), "replace")      # the PyPI CPU build of an older install
        self.assertEqual(ts.plan("cu128", "cu126"), "keep")       # a working CUDA build is never replaced
        self.assertEqual(ts.plan("cpu", "cu128"), "keep")
        self.assertEqual(ts.plan("cpu", "cpu"), "keep")

    def test_pip_command_pins_the_tested_version(self):
        calls = []
        ok = ts.pip_install("cu128", log=None, run=lambda cmd, log: calls.append(cmd) or 0, python="py")
        self.assertTrue(ok)
        self.assertEqual(calls[0], ["py", "-m", "pip", "install", "torch==2.8.0", "torchaudio==2.8.0",
                                    "--index-url", "https://download.pytorch.org/whl/cu128"])


class MainTests(unittest.TestCase):
    def run_main(self, env, cuda, current, results):
        """results: return codes of the pip calls in order"""
        calls = []

        def fake_run(cmd, log):
            calls.append(cmd)
            return results.pop(0) if results else 0
        with mock.patch.dict(ts.os.environ, env, clear=False), \
                mock.patch.object(ts, "driver_cuda_version", return_value=cuda), \
                mock.patch.object(ts, "installed_build", return_value=current), \
                mock.patch.object(ts, "_run", side_effect=fake_run), \
                mock.patch("builtins.print"):
            code = ts.main(["--log", "install_log.txt"])
        return code, calls

    def test_cpu_build_is_replaced_on_an_nvidia_pc(self):
        code, calls = self.run_main({"BEATANALYZER_TORCH": "auto"}, (13, 5), "cpu", [0, 0])
        self.assertEqual(code, 0)
        self.assertEqual(calls[0][-4:], ["uninstall", "-y", "torch", "torchaudio"])
        self.assertIn("https://download.pytorch.org/whl/cu128", calls[1])

    def test_working_cuda_build_is_kept(self):
        code, calls = self.run_main({"BEATANALYZER_TORCH": "auto"}, (13, 5), "cu128", [])
        self.assertEqual((code, calls), (0, []))

    def test_failed_cuda_install_falls_back_to_cpu(self):
        code, calls = self.run_main({"BEATANALYZER_TORCH": "auto"}, (12, 8), None, [1, 1, 0])
        self.assertEqual(code, 0)
        self.assertIn("torch==2.8.0", calls[0])                          # tested version
        self.assertEqual(calls[1][4:6], ["torch", "torchaudio"])         # then the newest of the cu128 index
        self.assertIn("https://download.pytorch.org/whl/cu128", calls[1])
        self.assertIn("https://download.pytorch.org/whl/cpu", calls[2])

    def test_newest_build_when_the_tested_one_is_missing(self):
        code, calls = self.run_main({"BEATANALYZER_TORCH": "auto"}, (12, 8), None, [1, 0])
        self.assertEqual((code, len(calls)), (0, 2))
        self.assertIn("https://download.pytorch.org/whl/cu128", calls[1])

    def test_nothing_installs(self):
        code, _ = self.run_main({"BEATANALYZER_TORCH": "auto"}, None, None, [1, 1])
        self.assertEqual(code, 1)


if __name__ == "__main__":
    unittest.main()
