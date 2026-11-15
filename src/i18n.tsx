/**
 * Languages of the web app (concept section 9). The texts come from lang/<code>.json, the same files the Resolve
 * script and the server use: section "web" for the web app, "output" for terms shared with the subtitles.
 * Nested keys become "a.b"; a missing key falls back to English, then to the key itself.
 * The setting ("auto" = language of the system) is stored by the server (/api/settings, settings.json) and also
 * changes the language of the installed Resolve script. Without a server it is kept in the browser.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import de from '../lang/de.json';
import en from '../lang/en.json';
import tr from '../lang/tr.json';

export type Lang = 'en' | 'de' | 'tr';
export type LangSetting = 'auto' | Lang;
export const LANGS: Lang[] = ['de', 'en', 'tr'];

type Flat = Record<string, string>;

function flatten(data: unknown, prefix = '', out: Flat = {}): Flat {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      const name = prefix + k;
      if (Array.isArray(v)) out[name] = v.map(String).join('\n');
      else if (v && typeof v === 'object') flatten(v, name + '.', out);
      else out[name] = String(v);
    }
  }
  return out;
}

const TEXTS: Record<Lang, Flat> = { en: flatten(en), de: flatten(de), tr: flatten(tr) };
const STORAGE_KEY = 'beatanalyzer.language';

export function systemLang(): Lang {
  const code = (typeof navigator !== 'undefined' ? navigator.language : 'en').slice(0, 2).toLowerCase();
  return (LANGS as string[]).includes(code) ? (code as Lang) : 'en';
}

export function resolveLang(setting: LangSetting): Lang {
  return setting === 'auto' ? systemLang() : setting;
}

/** Text of a key in a language with {name} placeholders filled in. */
export function translate(lang: Lang, key: string, params?: Record<string, string | number>): string {
  let text = TEXTS[lang][key] ?? TEXTS.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) text = text.split(`{${k}}`).join(String(v));
  }
  return text;
}

export function languageName(code: Lang): string {
  return TEXTS[code]['_meta.name'] ?? code;
}

export interface I18n {
  lang: Lang;
  setting: LangSetting;
  setSetting: (s: LangSetting) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  /** number with the decimal sign of the language, e.g. 89,6 / 89.6 */
  num: (x: number | null | undefined, decimals?: number) => string;
  /** fraction 0 ... 1 as percent in the style of the language: 75 % / 75% / %75 */
  pct: (fraction: number | null | undefined, decimals?: number) => string;
  /** whole percent value 0 ... 100 in the style of the language */
  pctValue: (value: number | null | undefined) => string;
  /** time signature "4/4" in the language (Turkish: 4/4'lük) */
  meter: (name: string | null | undefined) => string;
}

function makeI18n(lang: Lang, setting: LangSetting, setSetting: (s: LangSetting) => void): I18n {
  const t = (key: string, params?: Record<string, string | number>) => translate(lang, key, params);
  const locale = TEXTS[lang]['_meta.html_lang'] ?? lang;
  const formats = new Map<number, Intl.NumberFormat>();
  const fmt = (d: number) => {
    let f = formats.get(d);
    if (!f) {
      f = new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: false });
      formats.set(d, f);
    }
    return f;
  };
  const num = (x: number | null | undefined, decimals = 1) =>
    x === null || x === undefined || !Number.isFinite(x) ? '–' : fmt(decimals).format(x);
  const pctValue = (value: number | null | undefined) =>
    value === null || value === undefined || !Number.isFinite(value)
      ? '–'
      : (TEXTS[lang]['_meta.percent'] ?? '{v}%').replace('{v}', fmt(0).format(Math.round(value)));
  const pct = (fraction: number | null | undefined, decimals = 0) =>
    fraction === null || fraction === undefined || !Number.isFinite(fraction)
      ? '–'
      : (TEXTS[lang]['_meta.percent'] ?? '{v}%').replace('{v}', fmt(decimals).format(fraction * 100));
  const meter = (name: string | null | undefined) => {
    const m = /^(\d+)\/(\d+)/.exec(name ?? '');
    if (!m) return name ?? '–';
    const suffix = TEXTS[lang][`output.meter_suffix.${m[2]}`] ?? '';
    return t('output.meter', { num: m[1], den: m[2], suffix });
  };
  return { lang, setting, setSetting, t, num, pct, pctValue, meter };
}

const I18nContext = createContext<I18n>(makeI18n('de', 'auto', () => undefined));

function readStored(): LangSetting | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'auto' || (LANGS as string[]).includes(v ?? '') ? (v as LangSetting) : null;
  } catch {
    return null;
  }
}

function store(s: LangSetting) {
  try {
    localStorage.setItem(STORAGE_KEY, s);
  } catch {
    /* private window: only for this visit */
  }
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [setting, setSettingState] = useState<LangSetting>(() => readStored() ?? 'auto');
  // the server's resolved language for "auto" (system language of the PC, as for the Resolve script)
  const [serverAuto, setServerAuto] = useState<Lang | null>(null);

  useEffect(() => {
    fetch('/api/settings', { signal: AbortSignal.timeout(3000) })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const s = data.language as LangSetting;
        if (s === 'auto' || (LANGS as string[]).includes(s)) {
          setSettingState(s);
          store(s);
        }
        if (s === 'auto' && (LANGS as string[]).includes(data.resolvedLanguage)) setServerAuto(data.resolvedLanguage);
      })
      .catch(() => undefined); // no server: the browser setting stays
  }, []);

  const setSetting = useCallback((s: LangSetting) => {
    setSettingState(s);
    store(s);
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: s }),
      signal: AbortSignal.timeout(8000),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && s === 'auto' && (LANGS as string[]).includes(data.resolvedLanguage)) setServerAuto(data.resolvedLanguage);
      })
      .catch(() => undefined);
  }, []);

  const lang: Lang = setting === 'auto' ? serverAuto ?? systemLang() : setting;
  const value = useMemo(() => makeI18n(lang, setting, setSetting), [lang, setting, setSetting]);

  useEffect(() => {
    document.documentElement.lang = TEXTS[lang]['_meta.html_lang'] ?? lang;
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18n {
  return useContext(I18nContext);
}
