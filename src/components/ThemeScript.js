import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from '@/constants/branding';

export default function ThemeScript() {
  const script = `
(function () {
  try {
    var key = '${STORAGE_KEYS.theme}';
    var stored = localStorage.getItem(key);
    if (!stored) {
      stored = localStorage.getItem('${LEGACY_STORAGE_KEYS.theme}');
      if (stored) {
        localStorage.setItem(key, stored);
        localStorage.removeItem('${LEGACY_STORAGE_KEYS.theme}');
      }
    }
    if (!stored) return;
    var parsed = JSON.parse(stored);
    var theme = parsed.state && parsed.state.theme ? parsed.state.theme : 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      if (theme === 'light') document.documentElement.classList.add('light');
    }
  } catch (e) {}
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
