import { useEffect, useState } from 'react';
import { Cat, X } from 'lucide-react';

import {
  DashboardCatOverlay,
  DashboardCatSettingsPanel,
} from './dashboard/DashboardKit';

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!settingsOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSettingsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingsOpen]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eae8e1] text-[#292723]">
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        aria-label="Open cat settings"
        title="Cat settings"
        className="fixed right-4 top-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full border border-black bg-black text-[#eafda8] transition-all hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
      >
        <Cat className="h-8 w-8 stroke-[2.5]" />
      </button>

      <DashboardCatOverlay visible />

      {settingsOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/15 p-3 backdrop-blur-[2px] sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSettingsOpen(false);
          }}
        >
          <section
            data-kedi-settings
            aria-label="Cat settings"
            className="relative h-[min(92vh,900px)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-black/[0.08] bg-[#f6f5f1] shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              aria-label="Close cat settings"
              className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white/90 text-gray-500 shadow-sm transition-colors hover:bg-white hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
            </button>

            <DashboardCatSettingsPanel />
          </section>
        </div>
      )}
    </main>
  );
}
