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
  predecessors?: number[];
}

interface GanttChartProps {
  works: GanttWork[];
  planWorks?: GanttWork[];
  projectDuration?: number;
}

export default function GanttChart({ works, planWorks, projectDuration }: GanttChartProps) {
  if (!works.length) {
    return (
      <div className="flex items-center justify-center h-48 bg-[#15181d] border border-slate-800 rounded text-slate-600 text-sm font-mono">
        Нет данных. Сначала выполните расчёт графика.
      </div>
    );
  }

  // Sort by ES, then by ID for stable order
  const sorted = [...works].sort((a, b) => a.es - b.es || a.id - b.id);
  const maxDay = projectDuration ?? Math.max(...sorted.map(w => w.lf), 1);

  const label = (w: GanttWork) => `#${w.id} ${w.name}`;
  const idToWork = new Map(sorted.map(w => [w.id, w]));

  // ── Traces ────────────────────────────────────────────────────────────────
  const critical = sorted.filter(w => w.is_critical);
  const matConstrained = sorted.filter(w => !w.is_critical && w.material_constrained);
  const normal = sorted.filter(w => !w.is_critical && !w.material_constrained);

  function makeTrace(items: GanttWork[], color: string, name: string) {
    return {
      type: 'bar' as const,
      orientation: 'h' as const,
      name,
      x: items.map(w => w.ef - w.es),          // ширина полосы = длительность
      y: items.map(label),
      base: items.map(w => w.es),               // начало полосы = ES
      marker: { color, opacity: 0.88 },
      width: 0.5,
      showlegend: true,
      hovertemplate:
        '<b>%{y}</b><br>' +
        'ES: %{base}  EF: %{customdata[0]}<br>' +
        'LS: %{customdata[1]}  LF: %{customdata[2]}<br>' +
        'TF: %{customdata[3]} дн.<br>' +
        '<extra></extra>',
      customdata: items.map(w => [w.ef, w.ls, w.lf, w.tf]),
    };
  }

  // Float (резерв TF) — тонкая полоска после EF
  function makeFloatTrace(items: GanttWork[]) {
    const withFloat = items.filter(w => w.tf > 0);
    if (!withFloat.length) return null;
    return {
      type: 'bar' as const,
      orientation: 'h' as const,
      name: 'Резерв TF',
      x: withFloat.map(w => w.tf),
      y: withFloat.map(label),
      base: withFloat.map(w => w.ef),
      marker: { color: 'rgba(100,116,139,0.28)', line: { color: 'rgba(100,116,139,0.5)', width: 1 } },
      width: 0.22,
      showlegend: true,
      hovertemplate: 'Резерв: %{x} дн.<extra></extra>',
    };
  }

  // Plan outlines
  const planTrace = planWorks?.length
    ? [{
        type: 'bar' as const,
        orientation: 'h' as const,
        name: 'Плановый',
        x: planWorks.map(w => w.ef - w.es),
        y: planWorks.map(label),
        base: planWorks.map(w => w.es),
        marker: { color: 'rgba(0,0,0,0)', line: { color: 'rgba(148,163,184,0.55)', width: 2 } },
        width: 0.55,
        showlegend: true,
        hovertemplate: '<b>%{y}</b> (план)<br>ES: %{base} → EF: %{customdata[0]}<extra></extra>',
        customdata: planWorks.map(w => [w.ef]),
      }]
    : [];

  const floatTrace = makeFloatTrace([...normal, ...matConstrained]);

  const data = [
    ...planTrace,
    ...(normal.length ? [makeTrace(normal, '#6a93c8', 'Выполняется')] : []),
    ...(critical.length ? [makeTrace(critical, '#ef4444', 'Критический путь')] : []),
    ...(matConstrained.length ? [makeTrace(matConstrained, '#f59e0b', 'Огр. МТР')] : []),
    ...(floatTrace ? [floatTrace] : []),
  ];

  // ── Г-образные коннекторы зависимостей ───────────────────────────────────
  // Каждое соединение: 3 отрезка (горизонталь → вертикаль → горизонталь).
  // yref:'y' принимает строковые метки категорий.
  type LineShape = {
    type: 'line'; x0: number; y0: string; x1: number; y1: string;
    xref: string; yref: string; line: { color: string; width: number };
  };

  const connectors: LineShape[] = [];
  const tipAnnotations: object[] = [];

  const lineStyle = { color: 'rgba(148,163,184,0.32)', width: 1 };

  for (const w of sorted) {
    if (!w.predecessors?.length) continue;
    for (const predId of w.predecessors) {
      const pred = idToWork.get(predId);
      if (!pred) continue;

      const predLbl = label(pred);
      const succLbl = label(w);

      // Точка поворота — на 1 день правее конца предшественника
      const xTurn = pred.ef + 1;

      // Сегмент 1: горизонталь от конца предшественника до xTurn
      connectors.push({ type: 'line', x0: pred.ef, y0: predLbl, x1: xTurn, y1: predLbl, xref: 'x', yref: 'y', line: lineStyle });
      // Сегмент 2: вертикаль от ряда предшественника до ряда преемника
      connectors.push({ type: 'line', x0: xTurn, y0: predLbl, x1: xTurn, y1: succLbl, xref: 'x', yref: 'y', line: lineStyle });
      // Сегмент 3: горизонталь от xTurn до начала преемника
      connectors.push({ type: 'line', x0: xTurn, y0: succLbl, x1: w.es, y1: succLbl, xref: 'x', yref: 'y', line: lineStyle });

      // Маленький наконечник (▶) прямо перед началом преемника
      tipAnnotations.push({
        x: w.es, y: succLbl,
        xref: 'x', yref: 'y',
        text: '▶',
        font: { size: 7, color: 'rgba(148,163,184,0.55)' },
        showarrow: false,
        xanchor: 'right',
        yanchor: 'middle',
      });
    }
  }

  const chartHeight = Math.max(220, sorted.length * 38 + 80);

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
          range: [0, maxDay + Math.ceil(maxDay * 0.06)],
          tickmode: 'linear',
          dtick: Math.max(1, Math.ceil(maxDay / 20)),
        },
        yaxis: {
          automargin: true,
          gridcolor: '#272c34',
          tickfont: { size: 10 },
          // Порядок: первая работа сверху
          categoryorder: 'array',
          categoryarray: [...sorted].reverse().map(label),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        shapes: connectors as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        annotations: tipAnnotations as any,
        legend: {
          bgcolor: 'rgba(21,24,29,0.85)',
          bordercolor: '#272c34',
          borderwidth: 1,
          font: { size: 10 },
          x: 1,
          xanchor: 'right',
          y: 1,
        },
        margin: { l: 10, r: 20, t: 10, b: 40 },
        height: chartHeight,
      }}
      config={{
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['select2d', 'lasso2d'],
        toImageButtonOptions: { format: 'svg', filename: 'gantt_chart', width: 1400, height: chartHeight },
      }}
      style={{ width: '100%' }}
    />
  );
}
