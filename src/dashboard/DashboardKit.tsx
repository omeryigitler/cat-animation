import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Cat, Glasses, Palette, Plus, RotateCcw, SlidersHorizontal, Trash2 } from 'lucide-react';

import CatWidget from '../components/CatWidget';

export type DashboardCatType = 'default' | 'garfield' | 'cute';
export type DashboardCatColor = 'orange' | 'calico' | 'gray' | 'black' | 'white';
export type DashboardCatAccessory = 'none' | 'hat' | 'glasses' | 'bowtie';

export type DashboardCatPhrase = {
  id: string;
  text: string;
  timeSec: number;
};

export type DashboardCatSettings = {
  active: boolean;
  scale: number;
  speed: number;
  swattingEnabled: boolean;
  roamingEnabled: boolean;
  catType: DashboardCatType;
  colorTheme: DashboardCatColor;
  accessory: DashboardCatAccessory;
  phrases: DashboardCatPhrase[];
};

const SETTINGS_KEY = 'berfin-dashboard-cat-settings-v2';
const VISIBILITY_KEY = 'berfin-dashboard-cat-visible-v1';
const SETTINGS_EVENT = 'berfin-dashboard-cat-settings-change';

export const DEFAULT_DASHBOARD_CAT_SETTINGS: DashboardCatSettings = {
  active: true,
  scale: 1.3,
  speed: 1000,
  swattingEnabled: true,
  roamingEnabled: true,
  catType: 'default',
  colorTheme: 'orange',
  accessory: 'none',
  phrases: [
    { id: '1', text: 'Miyav!', timeSec: 5 },
    { id: '2', text: 'Mrrr...', timeSec: 15 },
    { id: '3', text: 'Canım sıkıldı!', timeSec: 30 },
  ],
};

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function readDashboardCatSettings(): DashboardCatSettings {
  if (typeof window === 'undefined') return DEFAULT_DASHBOARD_CAT_SETTINGS;

  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_DASHBOARD_CAT_SETTINGS;

    const parsed = JSON.parse(stored) as Partial<DashboardCatSettings>;
    const phrases = Array.isArray(parsed.phrases)
      ? parsed.phrases
          .filter((phrase): phrase is DashboardCatPhrase => Boolean(phrase && typeof phrase.text === 'string'))
          .map((phrase) => ({
            id: String(phrase.id || createId()),
            text: phrase.text,
            timeSec: Number.isFinite(Number(phrase.timeSec)) ? Math.max(1, Number(phrase.timeSec)) : 5,
          }))
      : DEFAULT_DASHBOARD_CAT_SETTINGS.phrases;

    return {
      ...DEFAULT_DASHBOARD_CAT_SETTINGS,
      ...parsed,
      phrases,
    };
  } catch {
    return DEFAULT_DASHBOARD_CAT_SETTINGS;
  }
}

export function writeDashboardCatSettings(settings: DashboardCatSettings) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: settings }));
}

export function readDashboardCatVisibility() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(VISIBILITY_KEY) === 'true';
}

export function writeDashboardCatVisibility(visible: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(VISIBILITY_KEY, String(visible));
}

function useDashboardCatSettings() {
  const [settings, setSettings] = useState<DashboardCatSettings>(() => readDashboardCatSettings());

  useEffect(() => {
    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<DashboardCatSettings>;
      setSettings(customEvent.detail || readDashboardCatSettings());
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === SETTINGS_KEY) setSettings(readDashboardCatSettings());
    };

    window.addEventListener(SETTINGS_EVENT, handleCustomEvent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(SETTINGS_EVENT, handleCustomEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const updateSettings = (patch: Partial<DashboardCatSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      writeDashboardCatSettings(next);
      return next;
    });
  };

  return { settings, setSettings, updateSettings };
}

export function DashboardCatOverlay({ visible }: { visible: boolean }) {
  const { settings, updateSettings } = useDashboardCatSettings();
  const phrases = useMemo(
    () =>
      settings.phrases
        .filter((phrase) => phrase.text.trim())
        .map((phrase) => ({ text: phrase.text.trim(), timeMs: phrase.timeSec * 1000 })),
    [settings.phrases],
  );

  return (
    <CatWidget
      isActive={visible && settings.active}
      setIsActive={(active) => updateSettings({ active })}
      scale={settings.scale}
      speed={settings.speed}
      phrases={phrases}
      swattingEnabled={settings.swattingEnabled}
      roamingEnabled={settings.roamingEnabled}
      colorTheme={settings.colorTheme}
      accessory={settings.accessory}
      catType={settings.catType}
    />
  );
}

function Toggle({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`flex w-full items-center gap-3 rounded-[1.4rem] border p-4 text-left transition-all ${
        checked ? 'border-black/10 bg-[#eafda8]' : 'border-black/[0.06] bg-[#faf9f6]'
      }`}
    >
      <span className="min-w-0 flex-1">
        <strong className="block text-[12px] font-black text-gray-950">{label}</strong>
        <small className="mt-1 block text-[10px] font-semibold leading-relaxed text-gray-500">{description}</small>
      </span>
      <span className={`h-6 w-10 rounded-full p-1 transition-all ${checked ? 'bg-black' : 'bg-gray-200'}`}>
        <span
          className={`block h-4 w-4 rounded-full transition-transform ${
            checked ? 'translate-x-4 bg-[#eafda8]' : 'translate-x-0 bg-white'
          }`}
        />
      </span>
    </button>
  );
}

function ChoiceButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-3 py-3 text-[11px] font-black transition-all ${
        active
          ? 'border-black bg-black text-[#eafda8] shadow-sm'
          : 'border-black/[0.07] bg-[#faf9f6] text-gray-600 hover:border-black/20 hover:bg-white'
      }`}
    >
      {children}
    </button>
  );
}

export function DashboardCatSettingsPanel() {
  const { settings, setSettings, updateSettings } = useDashboardCatSettings();

  const updatePhrase = (id: string, patch: Partial<DashboardCatPhrase>) => {
    updateSettings({
      phrases: settings.phrases.map((phrase) => (phrase.id === id ? { ...phrase, ...patch } : phrase)),
    });
  };

  const addPhrase = () => {
    updateSettings({
      phrases: [...settings.phrases, { id: createId(), text: 'Miyav!', timeSec: 10 }],
    });
  };

  const removePhrase = (id: string) => {
    updateSettings({ phrases: settings.phrases.filter((phrase) => phrase.id !== id) });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_DASHBOARD_CAT_SETTINGS);
    writeDashboardCatSettings(DEFAULT_DASHBOARD_CAT_SETTINGS);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f6f5f1] p-5 text-[#292723] sm:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 pb-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-black/[0.07] bg-white/90 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-black text-[#eafda8]">
              <Cat className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">Yönetim eklentisi</p>
              <h1 className="text-2xl font-black tracking-tight text-gray-950">Kedi Ayarları</h1>
              <p className="mt-1 text-[10px] font-semibold text-gray-500">Ayarlar otomatik kaydedilir ve çalışan kediye anında uygulanır.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetSettings}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[10px] font-black text-gray-600 hover:border-black/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Varsayılana dön
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={settings.active}
              onClick={() => updateSettings({ active: !settings.active })}
              className={`flex items-center gap-3 rounded-full px-4 py-2 text-[10px] font-black transition-all ${
                settings.active ? 'bg-black text-[#eafda8]' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {settings.active ? 'Kedi aktif' : 'Kedi pasif'}
              <span className={`h-5 w-9 rounded-full p-0.5 ${settings.active ? 'bg-[#eafda8]' : 'bg-white'}`}>
                <span
                  className={`block h-4 w-4 rounded-full transition-transform ${
                    settings.active ? 'translate-x-4 bg-black' : 'translate-x-0 bg-gray-400'
                  }`}
                />
              </span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className="rounded-[2rem] border border-black/[0.07] bg-white/90 p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2 border-b border-black/[0.06] pb-4">
              <Palette className="h-4 w-4 text-[#d96f4d]" />
              <h2 className="text-[13px] font-black text-gray-950">Görünüm</h2>
            </div>

            <div className="space-y-6">
              <div>
                <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.12em] text-gray-400">Kedi tipi</span>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ['default', 'Klasik'],
                    ['garfield', 'Şişman'],
                    ['cute', 'Minnoş'],
                  ] as const).map(([value, label]) => (
                    <ChoiceButton key={value} active={settings.catType === value} onClick={() => updateSettings({ catType: value })}>
                      {label}
                    </ChoiceButton>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.12em] text-gray-400">Renk</span>
                <div className="grid grid-cols-5 gap-2">
                  {([
                    ['orange', 'Sarı', '#f48b29'],
                    ['calico', 'Benekli', '#e69c30'],
                    ['gray', 'Gri', '#8a94a0'],
                    ['black', 'Siyah', '#2a2a2a'],
                    ['white', 'Beyaz', '#f0f0f0'],
                  ] as const).map(([value, label, color]) => (
                    <button
                      key={value}
                      type="button"
                      title={label}
                      onClick={() => updateSettings({ colorTheme: value })}
                      className={`flex flex-col items-center gap-2 rounded-2xl border p-2 text-[9px] font-black transition-all ${
                        settings.colorTheme === value ? 'border-black bg-[#eafda8]' : 'border-black/[0.07] bg-[#faf9f6]'
                      }`}
                    >
                      <span className="h-8 w-8 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: color }} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.12em] text-gray-400">
                  <Glasses className="h-3.5 w-3.5" /> Aksesuar
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    ['none', 'Yok'],
                    ['hat', 'Şapka'],
                    ['glasses', 'Gözlük'],
                    ['bowtie', 'Papyon'],
                  ] as const).map(([value, label]) => (
                    <ChoiceButton key={value} active={settings.accessory === value} onClick={() => updateSettings({ accessory: value })}>
                      {label}
                    </ChoiceButton>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/[0.07] bg-white/90 p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2 border-b border-black/[0.06] pb-4">
              <SlidersHorizontal className="h-4 w-4 text-[#d96f4d]" />
              <h2 className="text-[13px] font-black text-gray-950">Hareket ayarları</h2>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 flex justify-between text-[10px] font-black text-gray-700">
                  Kedi büyüklüğü <strong className="text-[#cf6747]">{settings.scale.toFixed(1)}x</strong>
                </span>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={settings.scale}
                  onChange={(event) => updateSettings({ scale: Number(event.target.value) })}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-100 accent-black"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex justify-between text-[10px] font-black text-gray-700">
                  Maksimum hız <strong className="text-[#cf6747]">{settings.speed}</strong>
                </span>
                <input
                  type="range"
                  min="300"
                  max="2500"
                  step="100"
                  value={settings.speed}
                  onChange={(event) => updateSettings({ speed: Number(event.target.value) })}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-100 accent-black"
                />
              </label>

              <Toggle
                checked={settings.swattingEnabled}
                label="Patiyle oynama"
                description="Fare kediye yaklaştığında pati hareketini çalıştırır."
                onChange={() => updateSettings({ swattingEnabled: !settings.swattingEnabled })}
              />
              <Toggle
                checked={settings.roamingEnabled}
                label="Serbest dolaşma"
                description="Kedi boşta kaldığında yönetim ekranının altında kendi kendine gezinir."
                onChange={() => updateSettings({ roamingEnabled: !settings.roamingEnabled })}
              />
            </div>
          </section>
        </div>

        <section className="rounded-[2rem] border border-black/[0.07] bg-white/90 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
            <div>
              <h2 className="text-[13px] font-black text-gray-950">Kedi sözleri</h2>
              <p className="mt-1 text-[10px] font-semibold text-gray-400">Kedi hareketsiz kaldığında süreye göre gösterilecek mesajlar.</p>
            </div>
            <button
              type="button"
              onClick={addPhrase}
              className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[10px] font-black text-[#eafda8]"
            >
              <Plus className="h-3.5 w-3.5" />
              Söz ekle
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {settings.phrases.map((phrase) => (
              <div key={phrase.id} className="flex items-center gap-2 rounded-2xl border border-black/[0.06] bg-[#faf9f6] p-2">
                <input
                  value={phrase.text}
                  onChange={(event) => updatePhrase(phrase.id, { text: event.target.value })}
                  className="min-w-0 flex-1 rounded-xl border border-black/[0.07] bg-white px-3 py-2 text-[11px] font-bold outline-none focus:border-black/20"
                  placeholder="Kedinin sözü"
                />
                <div className="flex items-center rounded-xl border border-black/[0.07] bg-white px-2">
                  <input
                    type="number"
                    min="1"
                    value={phrase.timeSec}
                    onChange={(event) => updatePhrase(phrase.id, { timeSec: Math.max(1, Number(event.target.value) || 1) })}
                    className="w-12 bg-transparent py-2 text-center text-[11px] font-black outline-none"
                  />
                  <span className="text-[9px] font-black text-gray-400">sn</span>
                </div>
                <button
                  type="button"
                  onClick={() => removePhrase(phrase.id)}
                  className="grid h-9 w-9 place-items-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Sözü sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
