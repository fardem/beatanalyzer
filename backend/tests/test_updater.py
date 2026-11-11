"""Tests for backend/updater.py and backend/resolve_plugin.py (no network: the release ZIP is a local file)."""

import os
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

import resolve_plugin  # noqa: E402
import updater  # noqa: E402


def make_install(folder: Path, version: str, files: dict):
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "VERSION").write_text(version + "\n", encoding="utf-8")
    for rel, text in files.items():
        p = folder / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding="utf-8")


def make_zip(path: Path, version: str, files: dict, prefix="BeatAnalyzer/"):
    with zipfile.ZipFile(path, "w") as z:
        z.writestr(prefix + "VERSION", version + "\n")
        for rel, text in files.items():
            z.writestr(prefix + rel, text)
    return {"version": version, "zip": path.as_uri(), "page": ""}


class VersionTests(unittest.TestCase):
    def test_compare(self):
        self.assertTrue(updater.newer("0.0.10", "0.0.9"))
        self.assertTrue(updater.newer("v0.1", "0.0.9"))
        self.assertFalse(updater.newer("0.1.0", "0.1"))
        self.assertFalse(updater.newer("garbage", "0.0.1"))

    def test_parse_release_needs_asset(self):
        data = {"tag_name": "0.0.3", "assets": [{"name": "BeatAnalyzer.zip", "url": "https://api/asset/1"}]}
        self.assertEqual(updater.parse_release(data)["zip"], "https://api/asset/1")
        self.assertIsNone(updater.parse_release({"tag_name": "0.0.3", "assets": []}))
        self.assertIsNone(updater.parse_release({"tag_name": "0.0.3", "prerelease": True, "assets": data["assets"]}))

    def test_parse_release_takes_old_asset_name(self):
        old = {"tag_name": "0.0.5", "assets": [{"name": "BeatThis.zip", "url": "https://api/asset/old"}]}
        self.assertEqual(updater.parse_release(old)["zip"], "https://api/asset/old")
        both = {"tag_name": "0.0.5", "assets": [{"name": "BeatThis.zip", "url": "https://api/asset/old"},
                                                {"name": "BeatAnalyzer.zip", "url": "https://api/asset/new"}]}
        self.assertEqual(updater.parse_release(both)["zip"], "https://api/asset/new")

    def test_transition_script_version_matches(self):
        # the updater up to 0.0.4 installs resolve/BeatThis_Markers.lua only if its version is new
        legacy_source = resolve_plugin.PLUGIN_SOURCE.with_name(resolve_plugin.LEGACY_FILE)
        self.assertEqual(resolve_plugin.script_version(legacy_source), resolve_plugin.app_version())

    def test_script_and_app_version_match(self):
        self.assertEqual(resolve_plugin.script_version(resolve_plugin.PLUGIN_SOURCE),
                         resolve_plugin.app_version())


class UpdateTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.root = self.tmp / "BeatAnalyzer"
        old_files = {"backend/server.py": "old", "requirements.txt": "numpy\n",
                     "dist/assets/index-OLD.js": "old js", "dist/index.html": "old html"}
        make_install(self.root, "0.0.1", old_files)
        (self.root / "venv").mkdir()
        (self.root / "venv" / "keep.txt").write_text("venv", encoding="utf-8")
        self.new_files = {"backend/server.py": "new", "requirements.txt": "numpy\n",
                          "dist/assets/index-NEW.js": "new js", "dist/index.html": "new html"}
        self.plugin_dir = self.tmp / "Scripts" / "Utility"
        self._status, self._install = resolve_plugin.status, resolve_plugin.install
        resolve_plugin.status = lambda: {"state": "missing", "path": ""}

    def tearDown(self):
        resolve_plugin.status, resolve_plugin.install = self._status, self._install

    def test_update_replaces_files_backs_up_and_keeps_venv(self):
        release = make_zip(self.tmp / "BeatAnalyzer.zip", "0.0.2", self.new_files)
        result = updater.update(self.root, release=release, log=lambda *a: None, pip=lambda r: True)
        self.assertTrue(result["updated"])
        self.assertEqual((self.root / "VERSION").read_text().strip(), "0.0.2")
        self.assertEqual((self.root / "backend/server.py").read_text(), "new")
        self.assertFalse((self.root / "dist/assets/index-OLD.js").exists())
        self.assertTrue((self.root / "dist/assets/index-NEW.js").exists())
        backup = self.root / "update-backup" / "0.0.1"
        self.assertEqual((backup / "backend/server.py").read_text(), "old")
        self.assertTrue((backup / "dist/assets/index-OLD.js").exists())
        self.assertEqual((self.root / "venv/keep.txt").read_text(), "venv")
        self.assertFalse(result["requirements"])
        self.assertFalse((self.root / "update-temp").exists())
        self.assertIn("dist/index.html", (self.root / updater.MANIFEST).read_text())

    def test_changed_requirements_run_pip(self):
        self.new_files["requirements.txt"] = "numpy\nscipy\n"
        release = make_zip(self.tmp / "BeatAnalyzer.zip", "0.0.2", self.new_files)
        calls = []
        updater.update(self.root, release=release, log=lambda *a: None, pip=lambda r: calls.append(r) or True)
        self.assertEqual(calls, [self.root])

    def test_requirements_with_other_line_endings_do_not_run_pip(self):
        (self.root / "requirements.txt").write_bytes(b"numpy\r\n")
        release = make_zip(self.tmp / "BeatAnalyzer.zip", "0.0.2", self.new_files)
        calls = []
        result = updater.update(self.root, release=release, log=lambda *a: None,
                                pip=lambda r: calls.append(r) or True)
        self.assertFalse(result["requirements"])
        self.assertEqual(calls, [])

    def test_no_update_when_current(self):
        release = make_zip(self.tmp / "BeatAnalyzer.zip", "0.0.1", self.new_files)
        result = updater.update(self.root, release=release, log=lambda *a: None)
        self.assertFalse(result["updated"])
        self.assertEqual((self.root / "backend/server.py").read_text(), "old")

    def test_git_checkout_is_refused(self):
        (self.root / ".git").mkdir()
        release = make_zip(self.tmp / "BeatAnalyzer.zip", "0.0.2", self.new_files)
        with self.assertRaises(updater.UpdateError):
            updater.update(self.root, release=release, log=lambda *a: None)

    def test_zip_with_path_outside_is_refused(self):
        bad = self.tmp / "bad.zip"
        with zipfile.ZipFile(bad, "w") as z:
            z.writestr("../evil.txt", "x")
        with self.assertRaises(updater.UpdateError):
            updater.extract_release(bad, self.tmp / "out")

    def test_outdated_plugin_is_updated(self):
        installed = []
        resolve_plugin.status = lambda: {"state": "outdated", "path": "x"}
        resolve_plugin.install = lambda: installed.append(True)
        release = make_zip(self.tmp / "BeatAnalyzer.zip", "0.0.2", self.new_files)
        updater.update(self.root, release=release, log=lambda *a: None, pip=lambda r: True)
        self.assertEqual(installed, [True])


class ResolvePluginTests(unittest.TestCase):
    def test_old_script_name_is_outdated_and_removed_by_install(self):
        d = resolve_plugin.scripts_dir(self.env, "win32")
        d.mkdir(parents=True)
        (d / "BeatThis_Markers.lua").write_text('local VERSION = "0.0.4"\n', encoding="utf-8")
        st = resolve_plugin.status(env=self.env, platform="win32")
        self.assertEqual((st["state"], st["installedVersion"]), ("outdated", "0.0.4"))
        self.assertTrue(st["legacyInstalled"])
        resolve_plugin.install(env=self.env, platform="win32")
        self.assertFalse((d / "BeatThis_Markers.lua").exists())
        self.assertTrue((d / "BeatAnalyzer_Markers.lua").exists())
        self.assertEqual(resolve_plugin.status(env=self.env, platform="win32")["state"], "current")

    def test_current_script_with_old_one_next_to_it_is_outdated(self):
        resolve_plugin.install(env=self.env, platform="win32")
        d = resolve_plugin.scripts_dir(self.env, "win32")
        (d / "BeatThis_Markers.lua").write_text('local VERSION = "0.0.5"\n', encoding="utf-8")
        self.assertEqual(resolve_plugin.status(env=self.env, platform="win32")["state"], "outdated")

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.env = {"APPDATA": str(self.tmp / "AppData"), "ProgramFiles": str(self.tmp / "Programs")}

    def test_windows_paths_and_detection(self):
        d = resolve_plugin.scripts_dir(self.env, "win32")
        self.assertEqual(d, self.tmp / "AppData" / "Blackmagic Design" / "DaVinci Resolve" / "Support"
                         / "Fusion" / "Scripts" / "Utility")
        self.assertFalse(resolve_plugin.resolve_installed(self.env, "win32"))
        (self.tmp / "Programs" / "Blackmagic Design" / "DaVinci Resolve").mkdir(parents=True)
        self.assertTrue(resolve_plugin.resolve_installed(self.env, "win32"))

    def test_install_and_status(self):
        st = resolve_plugin.status(env=self.env, platform="win32")
        self.assertEqual(st["state"], "missing")
        target = resolve_plugin.install(env=self.env, platform="win32")
        self.assertEqual(target.read_bytes(), resolve_plugin.PLUGIN_SOURCE.read_bytes())
        self.assertFalse(target.read_bytes().startswith(b"\xef\xbb\xbf"))
        self.assertEqual(resolve_plugin.status(env=self.env, platform="win32")["state"], "current")
        target.write_text('local VERSION = "0.0.0"\n', encoding="utf-8")
        st = resolve_plugin.status(env=self.env, platform="win32")
        self.assertEqual((st["state"], st["installedVersion"]), ("outdated", "0.0.0"))


if __name__ == "__main__":
    unittest.main()
