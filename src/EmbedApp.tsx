import { useEffect } from 'react';

import {
  DashboardCatOverlay,
  DashboardCatSettingsPanel,
} from './dashboard/DashboardKit';

export default function EmbedApp() {
  const mode = new URLSearchParams(window.location.search).get('mode');
  const widgetMode = mode === 'widget';

  useEffect(() => {
    const htmlBackground = document.documentElement.style.background;
    const bodyBackground = document.body.style.background;
    const bodyOverflow = document.body.style.overflow;

    document.documentElement.style.background = widgetMode ? 'transparent' : '#f6f5f1';
    document.body.style.background = widgetMode ? 'transparent' : '#f6f5f1';
    document.body.style.overflow = widgetMode ? 'hidden' : 'auto';

    return () => {
      document.documentElement.style.background = htmlBackground;
      document.body.style.background = bodyBackground;
      document.body.style.overflow = bodyOverflow;
    };
  }, [widgetMode]);

  if (widgetMode) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-transparent pointer-events-none">
        <DashboardCatOverlay visible />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f5f1] text-[#292723]">
      <DashboardCatSettingsPanel />
    </main>
  );
}
