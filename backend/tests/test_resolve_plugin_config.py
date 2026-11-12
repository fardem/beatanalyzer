"""Tests for the BA-CONFIG block that backend/resolve_plugin.py writes into the Resolve script."""

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import i18n  # noqa: E402
import resolve_plugin  # noqa: E402
import settings  # noqa: E402

try:
    from lupa import luajit21
except ImportError:  # pragma: no cover
    luajit21 = None


class ConfigBlockTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.env = {"APPDATA": str(self.tmp / "AppData"), "ProgramFiles": str(self.tmp / "Programs")}
        self._settings_file = settings.SETTINGS_FILE
        settings.SETTINGS_FILE = self.tmp / "settings.json"

    def tearDown(self):
        settings.SETTINGS_FILE = self._settings_file

    def test_lua_string_escapes(self):
        self.assertEqual(resolve_plugin.lua_string('C:\\Ş "x"\nY'), '"C:\\\\Ş \\"x\\"\\nY"')

    @unittest.skipIf(luajit21 is None, "lupa not installed")
    def test_config_round_trip_in_lua(self):
        home = Path('C:\\Users\\Şükrü "Ö"\\Beat Analyzer')
        block = resolve_plugin.render_config(home, home / "venv/Scripts/pythonw.exe", "de",
                                             {"en": i18n.texts("en"), "de": i18n.texts("de")})
        ba = luajit21.LuaRuntime().execute(block + "\nreturn BA")
        self.assertEqual(ba.home, str(home))
        self.assertEqual(ba.lang, "de")
        self.assertEqual(ba.texts["de"]["output.bar_beat"], "Takt {bar} – Beat {beat}")

    @unittest.skipIf(luajit21 is None, "lupa not installed")
    def test_template_has_nil_paths(self):
        ba = luajit21.LuaRuntime().execute(resolve_plugin.template_config() + "\nreturn BA")
        self.assertIsNone(ba.home)
        self.assertIsNone(ba.python)
        self.assertEqual(ba.texts["en"]["output.marker_downbeat"], "Bar {bar}")

    def test_apply_config_needs_markers(self):
        with self.assertRaises(ValueError):
            resolve_plugin.apply_config("print(1)\n", resolve_plugin.template_config())

    def test_repo_script_carries_english_template(self):
        text = resolve_plugin.PLUGIN_SOURCE.read_text(encoding="utf-8")
        self.assertIn(resolve_plugin.CONFIG_BEGIN, text)
        self.assertEqual(resolve_plugin.apply_config(text, resolve_plugin.template_config()), text)

    def test_install_writes_language_and_paths(self):
        settings.save({"language": "tr"})
        target = resolve_plugin.install(env=self.env, platform="win32")
        text = target.read_text(encoding="utf-8")
        self.assertIn('lang = "tr"', text)
        self.assertIn(resolve_plugin.lua_string(str(resolve_plugin.PROJECT_ROOT)), text)
        self.assertEqual(resolve_plugin.status(env=self.env, platform="win32")["state"], "current")

    def test_raw_template_from_old_updater_is_outdated_and_fixed(self):
        d = resolve_plugin.scripts_dir(self.env, "win32")
        d.mkdir(parents=True)
        (d / resolve_plugin.PLUGIN_FILE).write_bytes(resolve_plugin.PLUGIN_SOURCE.read_bytes())
        self.assertEqual(resolve_plugin.status(env=self.env, platform="win32")["state"], "outdated")
        self.assertTrue(resolve_plugin.ensure_current(env=self.env, platform="win32"))
        self.assertEqual(resolve_plugin.status(env=self.env, platform="win32")["state"], "current")
        self.assertFalse(resolve_plugin.ensure_current(env=self.env, platform="win32"))

    def test_ensure_current_does_not_install_a_missing_script(self):
        self.assertFalse(resolve_plugin.ensure_current(env=self.env, platform="win32"))
        self.assertEqual(resolve_plugin.status(env=self.env, platform="win32")["state"], "missing")

    def test_set_language_rewrites_installed_plugin(self):
        settings.save({"language": "de"})
        resolve_plugin.install(env=self.env, platform="win32")
        r = resolve_plugin.set_language("tr", env=self.env, platform="win32")
        self.assertEqual(r, {"language": "tr", "resolvedLanguage": "tr", "pluginUpdated": True})
        self.assertFalse(resolve_plugin.set_language("tr", env=self.env, platform="win32")["pluginUpdated"])
        with self.assertRaises(ValueError):
            resolve_plugin.set_language("xx", env=self.env, platform="win32")

    def test_set_language_without_plugin(self):
        r = resolve_plugin.set_language("de", env=self.env, platform="win32")
        self.assertFalse(r["pluginUpdated"])
        self.assertEqual(settings.load()["language"], "de")

    def test_venv_python(self):
        root = Path("/x")
        self.assertEqual(resolve_plugin.venv_python(root, "win32"), root / "venv" / "Scripts" / "pythonw.exe")
        self.assertEqual(resolve_plugin.venv_python(root, "linux"), root / "venv" / "bin" / "python")


if __name__ == "__main__":
    unittest.main()
