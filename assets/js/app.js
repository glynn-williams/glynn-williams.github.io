import { createTabsController } from './tabs.js';
import { createRenewableModuleController } from './renewable-module.js?v=20261018-1';

const THEME_KEY = 'resume-theme';

function safeLocalStorage(win = window) {
  try { return win.localStorage; } catch { return null; }
}

function safeGet(storage, key) {
  try { return storage?.getItem(key) ?? null; } catch { return null; }
}

function safeSet(storage, key, value) {
  try { storage?.setItem(key, value); } catch { /* preference is non-essential */ }
}

function resolveInitialTheme(win = window, storage = safeLocalStorage(win)) {
  const saved = safeGet(storage, THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  try { return win.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'; }
  catch { return 'light'; }
}

function applyTheme(doc, theme) {
  const value = theme === 'dark' ? 'dark' : 'light';
  doc.documentElement.dataset.theme = value;
  for (const button of doc.querySelectorAll('[data-theme-toggle]')) {
    button.setAttribute('aria-label', `Switch to ${value === 'dark' ? 'light' : 'dark'} theme`);
  }
  return value;
}

export function boot(doc = document, win = window) {
  const storage = safeLocalStorage(win);
  let theme = applyTheme(doc, resolveInitialTheme(win, storage));
  for (const themeToggle of doc.querySelectorAll('[data-theme-toggle]')) {
    themeToggle.addEventListener('click', () => {
      theme = applyTheme(doc, theme === 'dark' ? 'light' : 'dark');
      safeSet(storage, THEME_KEY, theme);
    });
  }

  const tabs = createTabsController(doc, win);

  const launchButton = doc.querySelector('#launch-renewable-module');
  const moduleRoot = doc.querySelector('#renewable-module');
  if (launchButton && moduleRoot) {
    createRenewableModuleController({
      root: moduleRoot,
      launchButton,
      onExit: () => tabs.activate('portfolio')
    });
  }

  doc.documentElement.classList.add('js-ready');
  return { tabs, getTheme: () => theme };
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  boot(document, window);
}
