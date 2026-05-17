'use client';

import dynamic from 'next/dynamic';
import type { PlotParams } from 'react-plotly.js';

// Plotly must not render on server (no DOM APIs)
const Plot = dynamic<PlotParams>(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-[#16181D] rounded border border-slate-800 animate-pulse" />
  ),
});

export default Plot;
