/**
 * Генератор PDF-отчётов через браузерный window.print().
 * Кириллица отображается корректно — браузер использует системные шрифты.
 * Формат А4, гос-стиль: шапка, таблицы, нижний колонтитул, блок подписей.
 */

export interface ReportTable {
  title: string;
  head: string[];
  rows: (string | number | boolean | null | undefined)[][];
}

export interface ReportOptions {
  docTitle: string;
  taskName: string;
  projectName?: string;
  calcId?: number | string;
  date?: string;
  tables: ReportTable[];
}

const ORG = 'ООО «Тюмень Водоканал»';
const SYSTEM = 'АС управления строительными работами и МТР';

function fmtDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function cellStr(v: string | number | boolean | null | undefined): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'Да' : 'Нет';
  return String(v);
}

function buildTableHtml(table: ReportTable): string {
  const headCells = table.head.map(h => `<th>${h}</th>`).join('');
  const bodyRows = table.rows.map(row => {
    const cells = row.map(v => `<td>${cellStr(v)}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `
    <div class="section">
      <div class="section-title">${table.title}</div>
      <table>
        <thead><tr>${headCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>`;
}

export function generatePdfReport(opts: ReportOptions): void {
  const dateStr = fmtDate(opts.date);
  const tablesHtml = opts.tables.map(buildTableHtml).join('');

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8"/>
  <title>${opts.docTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 10pt;
      color: #000;
      background: #fff;
      padding: 15mm 20mm 20mm 25mm;
    }

    /* ── Шапка ── */
    .header {
      text-align: center;
      margin-bottom: 6mm;
      padding-bottom: 4mm;
      border-bottom: 1.5pt solid #000;
    }
    .header .org { font-size: 11pt; font-weight: bold; }
    .header .system { font-size: 9pt; color: #333; margin-top: 1mm; }
    .header .doc-title {
      font-size: 13pt;
      font-weight: bold;
      margin-top: 4mm;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .header .task-name { font-size: 10pt; margin-top: 2mm; color: #222; }

    /* ── Реквизиты ── */
    .meta {
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      color: #333;
      margin-bottom: 5mm;
      padding-bottom: 3mm;
      border-bottom: 0.5pt solid #999;
    }

    /* ── Секция / таблица ── */
    .section { margin-bottom: 6mm; }
    .section-title {
      font-size: 10pt;
      font-weight: bold;
      margin-bottom: 2mm;
      padding: 1mm 0;
      border-bottom: 0.5pt solid #666;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
    }
    thead tr {
      background: #2c4a7a;
      color: #fff;
    }
    thead th {
      padding: 2mm 2.5mm;
      text-align: center;
      border: 0.5pt solid #1a3056;
      font-weight: bold;
    }
    tbody tr:nth-child(even) { background: #f0f4f9; }
    tbody td {
      padding: 1.5mm 2.5mm;
      border: 0.5pt solid #c0c8d4;
      vertical-align: top;
      word-break: break-word;
    }

    /* ── Подписи ── */
    .signatures {
      margin-top: 10mm;
      padding-top: 5mm;
      border-top: 0.5pt solid #999;
      font-size: 9.5pt;
    }
    .signatures p { margin-bottom: 8mm; }
    .sig-line {
      display: inline-block;
      width: 60mm;
      border-bottom: 0.5pt solid #000;
      margin: 0 3mm;
    }

    /* ── Нижний колонтитул ── */
    @page {
      size: A4 portrait;
      margin: 15mm 20mm 20mm 25mm;
      @bottom-center {
        content: "${ORG}  ·  " counter(page) " / " counter(pages);
        font-size: 8pt;
        color: #666;
      }
    }

    /* Колонтитул через div для браузеров без @page support */
    .footer {
      position: fixed;
      bottom: 8mm;
      left: 25mm;
      right: 20mm;
      text-align: center;
      font-size: 8pt;
      color: #666;
      border-top: 0.5pt solid #ccc;
      padding-top: 2mm;
    }

    @media print {
      body { padding: 0; }
      .footer { display: none; } /* будет работать @page */
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="org">${ORG}</div>
    <div class="system">${SYSTEM}</div>
    <div class="doc-title">${opts.docTitle}</div>
    <div class="task-name">${opts.taskName}</div>
  </div>

  <div class="meta">
    <span>Дата формирования: <b>${dateStr}</b></span>
    <span>${opts.projectName ? 'Объект: ' + opts.projectName + ' · ' : ''}${opts.calcId !== undefined ? 'Расчёт №' + opts.calcId : ''}</span>
  </div>

  ${tablesHtml}

  <div class="signatures">
    <p>Ответственный исполнитель:&nbsp;<span class="sig-line"></span>&nbsp;/&nbsp;<span class="sig-line" style="width:40mm"></span></p>
    <p>Руководитель проекта:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="sig-line"></span>&nbsp;/&nbsp;<span class="sig-line" style="width:40mm"></span></p>
  </div>

  <div class="footer">${ORG} · ${opts.taskName}</div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Разрешите всплывающие окна для этого сайта, чтобы скачать PDF.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
