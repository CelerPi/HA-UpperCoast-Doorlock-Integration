from pathlib import Path
import unittest


REPO_DIR = Path(__file__).resolve().parents[1]
ADDON_DIR = REPO_DIR / "addons" / "yunhai_intercom"


class AddonMetadataTest(unittest.TestCase):
    def test_addon_display_name_and_version_are_declared(self):
        config_text = (ADDON_DIR / "config.yaml").read_text(encoding="utf-8")

        self.assertIn('name: "UpperCoast Doorlock System"', config_text)
        self.assertIn('version: "0.1.2"', config_text)

    def test_addon_changelog_exists_for_home_assistant_store(self):
        changelog = ADDON_DIR / "CHANGELOG.md"

        self.assertTrue(changelog.exists())
        self.assertIn("## 0.1.2 - 2026-05-27", changelog.read_text(encoding="utf-8"))

    def test_simplified_chinese_configuration_translation_exists(self):
        translation = ADDON_DIR / "translations" / "zh-Hans.yaml"
        translation_text = translation.read_text(encoding="utf-8")

        self.assertIn("门禁网本机 IP", translation_text)
        self.assertIn("1号机 IP 覆盖", translation_text)


if __name__ == "__main__":
    unittest.main()
