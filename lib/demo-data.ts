// Realistic static demo data — Реконструкция водовода Ду500, г. Тюмень, ул. Ленина, 2025

// ─── Works ───────────────────────────────────────────────────────────────────
export const DEMO_WORKS = [
  { id: 1,  name: 'Подготовительные и разбивочные работы',        duration_days: 7,  predecessors: [],         status: 'done' },
  { id: 2,  name: 'Разработка траншеи экскаватором Hitachi ZX250', duration_days: 35, predecessors: [1],        status: 'done' },
  { id: 3,  name: 'Устройство песчаного основания h=100 мм',       duration_days: 14, predecessors: [2],        status: 'done' },
  { id: 4,  name: 'Монтаж трубопровода ПЭ100 RC Ду500 PN10',      duration_days: 56, predecessors: [3],        status: 'active' },
  { id: 5,  name: 'Монтаж фасонных частей и фитингов ПЭ100',      duration_days: 14, predecessors: [3],        status: 'done' },
  { id: 6,  name: 'Устройство смотровых колодцев КЦ1000-1',       duration_days: 28, predecessors: [2],        status: 'active' },
  { id: 7,  name: 'Монтаж запорной арматуры (задвижки Ду500)',     duration_days: 14, predecessors: [4, 5],     status: 'planned' },
  { id: 8,  name: 'Гидравлические испытания (1,5 P_раб)',          duration_days: 10, predecessors: [7],        status: 'planned' },
  { id: 9,  name: 'Дезинфекция и промывка трубопровода',          duration_days: 7,  predecessors: [8],        status: 'planned' },
  { id: 10, name: 'Обратная засыпка и послойное уплотнение',       duration_days: 21, predecessors: [8],        status: 'planned' },
  { id: 11, name: 'Восстановление дорожного покрытия (а/бетон)',   duration_days: 35, predecessors: [10],       status: 'planned' },
  { id: 12, name: 'Монтаж КИПиА и системы телеметрии',            duration_days: 21, predecessors: [6, 7],     status: 'planned' },
  { id: 13, name: 'Комплексные пусконаладочные работы (ПНР)',      duration_days: 21, predecessors: [9, 12],    status: 'planned' },
  { id: 14, name: 'Благоустройство прилегающей территории',        duration_days: 14, predecessors: [11, 13],   status: 'planned' },
  { id: 15, name: 'Сдача объекта заказчику (ГК)',                  duration_days: 5,  predecessors: [14],       status: 'planned' },
];

// ─── CPM Schedule ─────────────────────────────────────────────────────────────
// Critical path: 1→2→3→4→7→8→10→11→14→15 = 211 days
export const DEMO_SCHEDULE = {
  calculation_id: 1,
  version: 1,
  scenario: 'plan',
  t_min: 211,
  calculation_date: '2025-01-15T08:00:00',
  items: [
    { work_id: 1,  es: 0,   ef: 7,   ls: 0,   lf: 7,   tf: 0,  is_critical: true  },
    { work_id: 2,  es: 7,   ef: 42,  ls: 7,   lf: 42,  tf: 0,  is_critical: true  },
    { work_id: 3,  es: 42,  ef: 56,  ls: 42,  lf: 56,  tf: 0,  is_critical: true  },
    { work_id: 4,  es: 56,  ef: 112, ls: 56,  lf: 112, tf: 0,  is_critical: true  },
    { work_id: 5,  es: 56,  ef: 70,  ls: 98,  lf: 112, tf: 42, is_critical: false },
    { work_id: 6,  es: 42,  ef: 70,  ls: 122, lf: 150, tf: 80, is_critical: false },
    { work_id: 7,  es: 112, ef: 126, ls: 112, lf: 126, tf: 0,  is_critical: true  },
    { work_id: 8,  es: 126, ef: 136, ls: 126, lf: 136, tf: 0,  is_critical: true  },
    { work_id: 9,  es: 136, ef: 143, ls: 164, lf: 171, tf: 28, is_critical: false },
    { work_id: 10, es: 136, ef: 157, ls: 136, lf: 157, tf: 0,  is_critical: true  },
    { work_id: 11, es: 157, ef: 192, ls: 157, lf: 192, tf: 0,  is_critical: true  },
    { work_id: 12, es: 126, ef: 147, ls: 150, lf: 171, tf: 24, is_critical: false },
    { work_id: 13, es: 147, ef: 168, ls: 171, lf: 192, tf: 24, is_critical: false },
    { work_id: 14, es: 192, ef: 206, ls: 192, lf: 206, tf: 0,  is_critical: true  },
    { work_id: 15, es: 206, ef: 211, ls: 206, lf: 211, tf: 0,  is_critical: true  },
  ],
};

// ─── Brigade Assignment ───────────────────────────────────────────────────────
export const DEMO_BRIGADE_RESULT = {
  calculation_id: 1,
  objective_value: 595200.0,
  assignments: [
    { assignment_id: 1, brigade_id: 1, site_id: 1, period_start: '2025-01-08', period_end: '2025-03-14', assignment_cost: 124500.00 },
    { assignment_id: 2, brigade_id: 2, site_id: 2, period_start: '2025-02-26', period_end: '2025-05-12', assignment_cost: 135200.00 },
    { assignment_id: 3, brigade_id: 3, site_id: 3, period_start: '2025-02-01', period_end: '2025-04-30', assignment_cost:  89700.00 },
    { assignment_id: 4, brigade_id: 4, site_id: 4, period_start: '2025-03-17', period_end: '2025-06-28', assignment_cost: 245800.00 },
  ],
  provision_rates: [
    { site_id: 1, m_s: 0.87 },
    { site_id: 2, m_s: 0.94 },
    { site_id: 3, m_s: 0.78 },
    { site_id: 4, m_s: 0.96 },
  ],
};

// ─── Supply Plan (Materials Procurement) ─────────────────────────────────────
// Material 1 — труба ПЭ100 RC Ду500 PN10 (секции по 12 м)
// Material 2 — задвижка клиновая Ду500 PN16
// Material 3 — колодец смотровый КЦ1000-1
const PIPE_WEEKS = [
  ['2025-02-26', 12], ['2025-03-05', 14], ['2025-03-12', 13],
  ['2025-03-19', 15], ['2025-03-26', 14], ['2025-04-02', 13],
  ['2025-04-09', 12], ['2025-04-16',  7],
] as [string, number][];

const VALVE_DATES = [
  ['2025-04-23', 2], ['2025-04-26', 2], ['2025-04-30', 1],
] as [string, number][];

const MANHOLE_DATES = [
  ['2025-02-12', 3], ['2025-02-19', 4], ['2025-02-26', 4],
  ['2025-03-05', 3], ['2025-03-12', 2],
] as [string, number][];

export const DEMO_SUPPLY_RESULT = {
  project_id: 1,
  calculation_id: 1,
  total_cost: 17465000.0,
  solver_status: 'Optimal',
  demand: [
    ...PIPE_WEEKS.map(([d, q]) => ({ material_id: 1, demand_date: d, quantity: q })),
    ...VALVE_DATES.map(([d, q]) => ({ material_id: 2, demand_date: d, quantity: q })),
    ...MANHOLE_DATES.map(([d, q]) => ({ material_id: 3, demand_date: d, quantity: q })),
  ],
  deliveries: [
    { material_id: 1, warehouse_id: 1, supplier_id: 1, planned_date: '2025-02-19', planned_volume: 30, unit_cost: 145200 },
    { material_id: 1, warehouse_id: 1, supplier_id: 1, planned_date: '2025-03-12', planned_volume: 35, unit_cost: 145200 },
    { material_id: 1, warehouse_id: 1, supplier_id: 1, planned_date: '2025-04-09', planned_volume: 35, unit_cost: 145200 },
    { material_id: 2, warehouse_id: 1, supplier_id: 2, planned_date: '2025-04-15', planned_volume:  5, unit_cost: 285000 },
    { material_id: 3, warehouse_id: 1, supplier_id: 3, planned_date: '2025-02-08', planned_volume:  8, unit_cost:  95000 },
    { material_id: 3, warehouse_id: 1, supplier_id: 3, planned_date: '2025-02-22', planned_volume:  8, unit_cost:  95000 },
  ],
  availability: [
    { material_id: 1, availability_date: '2025-02-19' },
    { material_id: 2, availability_date: '2025-04-15' },
    { material_id: 3, availability_date: '2025-02-08' },
  ],
};

// ─── Warehouse Load Profile (90 days) ────────────────────────────────────────
function genWarehouseProfile() {
  const CAP = 155;
  const DELIVERIES: Record<number, number> = { 7: 31.5, 19: 88, 28: 78, 48: 88, 56: 24.5, 63: 74, 78: 45 };
  const VIOL_THRESH = CAP * 0.90;

  // Deterministic pseudo-random (seeded by day index)
  const rng = (i: number) => {
    const x = Math.sin(i * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };

  let stock = 42;
  const rows = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date('2025-02-01');
    d.setDate(d.getDate() + i);
    const date = d.toISOString().split('T')[0];

    if (DELIVERIES[i] !== undefined) stock += DELIVERIES[i];

    const basecons = i < 7 ? 3.5 : i < 19 ? 3.8 : i < 63 ? 7.2 : i < 78 ? 5.5 : 4.5;
    stock = Math.max(14, stock - basecons * (0.82 + rng(i) * 0.38));

    const noise = (rng(i + 200) - 0.5) * 7;
    const load = Math.min(CAP * 1.10, Math.max(12, stock + noise));
    const util = load / CAP;
    const isPeak = load > VIOL_THRESH;

    const isDelivDay = DELIVERIES[i] !== undefined;
    const rhoBase = isDelivDay ? 0.78 + rng(i + 50) * 0.42 : 0.32 + rng(i + 300) * 0.48;
    const rho = Math.min(1.32, Math.max(0.11, rhoBase));

    const safeRho = Math.min(rho, 0.992);
    const wq = rho > 0.90 ? Math.round((safeRho * safeRho / (1 - safeRho) * 0.09) * 100) / 100 : null;
    const lq = rho > 0.90 ? Math.round((safeRho * safeRho / (1 - safeRho)) * 100) / 100 : null;

    rows.push({
      profile_date: date,
      total_load: Math.round(load * 10) / 10,
      utilization_ratio: Math.round(util * 1000) / 1000,
      peak_indicator: isPeak,
      rho: Math.round(rho * 10000) / 10000,
      wait_time: wq,
      queue_length: lq,
    });
  }
  return rows;
}

export const DEMO_WAREHOUSE_RESULT = {
  project_id: 1,
  calculation_id: 1,
  warehouse_id: 1,
  feasible: false,
  load_profile: genWarehouseProfile(),
  violations: [
    {
      profile_date: '2025-02-28',
      violation_type: 'overload',
      description: 'Загрузка склада 161.4 м² превысила предельную ёмкость (139.5 м²): одновременное поступление труб ПЭ100 и колодцев КЦ1000',
    },
    {
      profile_date: '2025-03-01',
      violation_type: 'wait_time',
      description: 'Время ожидания разгрузки автотранспорта 4.2 ч при нормативе 2 ч (ρ = 1.18)',
    },
  ],
  scenarios: [
    {
      scenario_type: 'delay',
      description: 'Перенос 2-й поставки труб ПЭ100 на 3 рабочих дня: разгрузка склада перед поступлением партии',
      delta_t: 0.0214,
      delta_c: 12500.0,
      delta_r: 0.0180,
      j_score: 0.0421,
      is_optimal: true,
    },
    {
      scenario_type: 'expand',
      description: 'Аренда временной площадки 80 м² рядом со складом на период пиковых поставок',
      delta_t: 0.0,
      delta_c: 38000.0,
      delta_r: 0.0,
      j_score: 0.0684,
      is_optimal: false,
    },
    {
      scenario_type: 'accelerate',
      description: 'Ускоренный монтаж (сверхурочные работы бригады А) для снижения остатка перед поставкой',
      delta_t: 0.0143,
      delta_c: 21500.0,
      delta_r: 0.0420,
      j_score: 0.0577,
      is_optimal: false,
    },
  ],
  adjusted_deliveries: null,
};

// ─── Supplier Discipline ──────────────────────────────────────────────────────
export const DEMO_DISCIPLINE = {
  horizon_days: 365,
  unreliable_count: 2,
  rows: [
    { supplier_id: 1, material_id: 1, p_jk: 0.104, d_jk: 3.2,  sample_size: 48, is_unreliable: false },
    { supplier_id: 2, material_id: 2, p_jk: 0.083, d_jk: 5.7,  sample_size: 24, is_unreliable: false },
    { supplier_id: 3, material_id: 3, p_jk: 0.319, d_jk: 12.8, sample_size: 36, is_unreliable: true  },
    { supplier_id: 4, material_id: 4, p_jk: 0.176, d_jk: 4.3,  sample_size: 72, is_unreliable: false },
    { supplier_id: 5, material_id: 5, p_jk: 0.092, d_jk: 2.9,  sample_size: 18, is_unreliable: false },
    { supplier_id: 1, material_id: 4, p_jk: 0.375, d_jk: 18.2, sample_size: 12, is_unreliable: true  },
    { supplier_id: 2, material_id: 5, p_jk: 0.217, d_jk: 7.4,  sample_size:  9, is_unreliable: false },
    { supplier_id: 6, material_id: 1, p_jk: 0.051, d_jk: 1.8,  sample_size:  6, is_unreliable: false },
  ],
};

// ─── Work Risk ────────────────────────────────────────────────────────────────
export const DEMO_WORK_RISK = {
  calculation_id: 1,
  risky_count: 3,
  rows: [
    { work_id: 1,  tf: 0,  d_max: 0.0,  criticality_index: 0.0000, is_risky: false },
    { work_id: 2,  tf: 0,  d_max: 0.0,  criticality_index: 0.0000, is_risky: false },
    { work_id: 3,  tf: 0,  d_max: 4.3,  criticality_index: 9.9999, is_risky: true  },
    { work_id: 4,  tf: 0,  d_max: 3.2,  criticality_index: 9.9999, is_risky: true  },
    { work_id: 5,  tf: 42, d_max: 2.9,  criticality_index: 0.0690, is_risky: false },
    { work_id: 6,  tf: 80, d_max: 12.8, criticality_index: 0.1600, is_risky: false },
    { work_id: 7,  tf: 0,  d_max: 5.7,  criticality_index: 9.9999, is_risky: true  },
    { work_id: 8,  tf: 0,  d_max: 0.0,  criticality_index: 0.0000, is_risky: false },
    { work_id: 9,  tf: 28, d_max: 0.0,  criticality_index: 0.0000, is_risky: false },
    { work_id: 10, tf: 0,  d_max: 0.0,  criticality_index: 0.0000, is_risky: false },
    { work_id: 11, tf: 0,  d_max: 0.0,  criticality_index: 0.0000, is_risky: false },
    { work_id: 12, tf: 24, d_max: 5.7,  criticality_index: 0.2375, is_risky: false },
    { work_id: 13, tf: 24, d_max: 0.0,  criticality_index: 0.0000, is_risky: false },
    { work_id: 14, tf: 0,  d_max: 0.0,  criticality_index: 0.0000, is_risky: false },
    { work_id: 15, tf: 0,  d_max: 0.0,  criticality_index: 0.0000, is_risky: false },
  ],
};

// ─── Schedule Deviations / Recalculation ─────────────────────────────────────
// Control date: day 100 of project (2025-04-11); pipe installation behind schedule
export const DEMO_RECALC_RESULT = {
  project_id: 1,
  calculation_id: 1,
  t_plan: 211,
  t_actual: 225.0,
  delta_t: 14.0,
  deviations: [
    { work_id: 1,  plan_percent: 100.0, fact_percent: 100.0, delta_percent:   0.0, chi_mtr: false, category: 'other' },
    { work_id: 2,  plan_percent: 100.0, fact_percent: 100.0, delta_percent:   0.0, chi_mtr: false, category: 'other' },
    { work_id: 3,  plan_percent: 100.0, fact_percent:  95.0, delta_percent:  -5.0, chi_mtr: false, category: 'weather' },
    { work_id: 4,  plan_percent:  78.6, fact_percent:  61.0, delta_percent: -17.6, chi_mtr: true,  category: 'MTR' },
    { work_id: 5,  plan_percent: 100.0, fact_percent:  79.0, delta_percent: -21.0, chi_mtr: true,  category: 'MTR' },
    { work_id: 6,  plan_percent: 100.0, fact_percent:  57.0, delta_percent: -43.0, chi_mtr: true,  category: 'MTR' },
    { work_id: 7,  plan_percent:   0.0, fact_percent:   0.0, delta_percent:   0.0, chi_mtr: false, category: 'other' },
    { work_id: 8,  plan_percent:   0.0, fact_percent:   0.0, delta_percent:   0.0, chi_mtr: false, category: 'other' },
    { work_id: 9,  plan_percent:   0.0, fact_percent:   0.0, delta_percent:   0.0, chi_mtr: false, category: 'other' },
    { work_id: 10, plan_percent:   0.0, fact_percent:   0.0, delta_percent:   0.0, chi_mtr: false, category: 'other' },
    { work_id: 11, plan_percent:   0.0, fact_percent:   0.0, delta_percent:   0.0, chi_mtr: false, category: 'other' },
    { work_id: 12, plan_percent:   0.0, fact_percent:   0.0, delta_percent:   0.0, chi_mtr: false, category: 'other' },
    { work_id: 13, plan_percent:   0.0, fact_percent:   0.0, delta_percent:   0.0, chi_mtr: false, category: 'other' },
    { work_id: 14, plan_percent:   0.0, fact_percent:   0.0, delta_percent:   0.0, chi_mtr: false, category: 'other' },
    { work_id: 15, plan_percent:   0.0, fact_percent:   0.0, delta_percent:   0.0, chi_mtr: false, category: 'other' },
  ],
  schedule: DEMO_SCHEDULE.items.map(i => ({ ...i })),
  scenarios: [
    { scenario_type: 'sigma1', delta_t: -7.0, delta_c: 0.2034, delta_r: -0.0500, j_score: 0.3021, is_optimal: true  },
    { scenario_type: 'sigma2', delta_t: -4.5, delta_c: 0.0757, delta_r:  0.1200, j_score: 0.3847, is_optimal: false },
    { scenario_type: 'sigma3', delta_t: -9.0, delta_c: 0.1428, delta_r:  0.0900, j_score: 0.4162, is_optimal: false },
  ],
};
