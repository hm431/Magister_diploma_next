'use client';

import PlotlyChart from './PlotlyChart';

export interface GanttWork {
  id: number;
  name: string;
  es: number;
  ef: number;
  ls: number;
  lf: number;
  tf: number;
  is_critical: boolean;
  material_constrained?: boolean;
}

interface GanttChartProps {
  works: GanttWork[];
  projectDuration?: number;
}

export default function GanttChart({ works, projectDuration }: GanttChartProps) {
  if (!works.length) {
    return (
      <div className="flex items-center justify-center h-48 bg-[#15181d] border border-slate-800 rounded text-slate-600 text-sm font-mono">
        Нет данных. Сначала выполните расчёт графика.
      </div>
    );
  }

  const sorted = [...works].sort((a, b) => a.es - b.es);
  const maxDay = projectDuration ?? Math.max(...sorted.map(w => w.lf), 1);

  // Separate traces by category so legend works
  const critical = sorted.filter(w => w.is_critical);
  const matConstrained = sorted.filter(w => !w.is_critical && w.material_constrained);
  const normal = sorted.filter(w => !w.is_critical && !w.material_constrained);

  function makeTrace(
    items: GanttWork[],
    color: string,
    name: string,
    showLegend: boolean,
  ) {
    return {
      type: 'bar' as const,
      orientation: 'h' as const,
      name,
      x: items.map(w => w.ef - w.es),
      y: items.map(w => `#${w.id} ${w.name}`),
      base: items.map(w => w.es),
      marker: { color, opacity: 0.85 },
      width: 0.5,
      showlegend: showLegend,
      hovertemplate:
        '<b>%{y}</b><br>' +
        'ES: %{base}<br>' +
        'EF: %{x}<br>' +
        'Длит.: %{x} дн.<br>' +
        '<extra></extra>',
      customdata: items.map(w => [w.ls, w.lf, w.tf]),
    };
  }

  // Float traces (show LS→LF slack)
  function makeFloatTrace(items: GanttWork[]) {
    return {
      type: 'bar' as const,
      orientation: 'h' as const,
      name: 'Резерв TF',
      x: items.map(w => w.tf),
      y: items.map(w => `#${w.id} ${w.name}`),
      base: items.map(w => w.ef),
      marker: { color: 'rgba(100,116,139,0.3)', line: { color: 'rgba(100,116,139,0.5)', width: 1 } },
      width: 0.25,
      showlegend: false,
      hovertemplate: 'Резерв: %{x} дн.<extra></extra>',
    };
  }

  const data = [
    ...(normal.length ? [makeTrace(normal, '#6a93c8', 'Работы', true)] : []),
    ...(critical.length ? [makeTrace(critical, '#ef4444', 'Критический путь', true)] : []),
    ...(matConstrained.length ? [makeTrace(matConstrained, '#f59e0b', 'Огр. МТР', true)] : []),
    // Floats for non-critical
    ...([...normal, ...matConstrained].filter(w => w.tf > 0).length
      ? [makeFloatTrace([...normal, ...matConstrained].filter(w => w.tf > 0))]
      : []),
  ];

  return (
    <PlotlyChart
      data={data}
      layout={{
        barmode: 'overlay',
        paper_bgcolor: '#15181d',
        plot_bgcolor: '#0e1014',
        font: { color: '#aab1bd', family: "'JetBrains Mono', ui-monospace, monospace", size: 11 },
        xaxis: {
          title: { text: 'День проекта', font: { size: 11 } },
          gridcolor: '#272c34',
          zeroline: false,
          range: [0, maxDay + Math.ceil(maxDay * 0.05)],
          tickmode: 'linear',
          dtick: Math.max(1, Math.ceil(maxDay / 20)),
        },
        yaxis: {
          automargin: true,
          gridcolor: '#272c34',
          tickfont: { size: 10 },
        },
        legend: {
          bgcolor: 'rgba(21,24,29,0.8)',
          bordercolor: '#272c34',
          borderwidth: 1,
          font: { size: 11 },
          x: 1,
          xanchor: 'right',
          y: 1,
        },
        margin: { l: 10, r: 10, t: 10, b: 40 },
        height: Math.max(200, sorted.length * 36 + 80),
      }}
      config={{
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['select2d', 'lasso2d'],
        toImageButtonOptions: { format: 'svg', filename: 'gantt_chart', width: 1200, height: 600 },
      }}
      style={{ width: '100%' }}
    />
  );
}
