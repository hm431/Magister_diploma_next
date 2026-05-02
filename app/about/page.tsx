// TODO возможно стоит раскидать оп атомароному дизайну но потом. Не критичная страница 
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "О программе — КИС Водоканал",
    description:
        "Дипломный проект: автоматизация задач комплекса подсистем КИС для строительной компании водоснабжения.",
};

const tasks = [
    { n: "01", sys: "СРО", name: "Календарный график работ", model: "RCPSP — сетевая модель с ресурсными ограничениями" },
    { n: "02", sys: "МТР", name: "График закупок МТР",        model: "Временна́я модель потребности + балансовая" },
    { n: "03", sys: "МТР", name: "Загрузка складов и логистика", model: "Модель массового обслуживания / потоковая" },
    { n: "04", sys: "СРО", name: "Отклонение сроков по КС-6", model: "Динамическая сетевая модель с пересчётом критич. пути" },
    { n: "05", sys: "—",   name: "Задача 05",                  model: "Постановка определяется на следующем этапе" },
    { n: "06", sys: "—",   name: "Задача 06",                  model: "Постановка определяется на следующем этапе" },
] as const;

const stack = [
    { group: "Frontend",   items: ["Next.js 14 (App Router)", "TypeScript", "Tailwind CSS", "Recharts"] },
    { group: "State / API",items: ["TanStack Query", "Zod", "REST"] },
    { group: "Алгоритмы",  items: ["RCPSP-решатель", "Сетевые модели", "Балансовые расчёты"] },
    { group: "Документы",  items: ["docx", "xlsx", "pdf-lib"] },
];

const sysColor = (sys: string) =>
    sys === "СРО" ? "text-teal-300 border-teal-300/40"
  : sys === "МТР" ? "text-amber-300 border-amber-300/40"
  :                 "text-slate-500 border-slate-700";

export default function AboutPage() {
    return (
        <main className="mx-auto w-full max-w-5xl px-6 py-16 text-slate-200 font-sans">
            {/* Хлебные крошки */}
            <nav aria-label="Хлебные крошки" className="mb-10">
                <ol className="flex flex-wrap items-center gap-2 m-0 p-0 list-none font-mono text-[11px] tracking-wide">
                    <li>
                        <Link href="/" className="text-slate-500 hover:text-slate-100 transition-colors no-underline">
                            Главная
                        </Link>
                    </li>
                    <li className="text-slate-700 select-none" aria-hidden="true">/</li>
                    <li className="text-slate-400" aria-current="page">О программе</li>
                </ol>
            </nav>

            {/* Hero */}
            <header className="flex flex-col gap-5 pb-12 border-b border-slate-800">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500">
                    Дипломный проект · 2026
                </span>
                <h1 className="m-0 text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight text-slate-100 text-balance">
                    Автоматизация задач<br className="hidden md:block" />
                    комплекса подсистем КИС
                </h1>
                <p className="m-0 max-w-[68ch] text-base md:text-lg leading-relaxed text-slate-400 text-pretty">
                    Аналитический контур для строительной компании водоснабжения.
                    Объединяет данные подсистем СРО и МТР и автоматически формирует шесть типов
                    проектных документов на основе единого источника данных.
                </p>
            </header>

            {/* Метрики */}
            <section className="grid grid-cols-3 mt-12 border border-slate-800 rounded-md overflow-hidden">
                {[
                    { n: "06", l: "задач",         color: "text-sky-400" },
                    { n: "02", l: "подсистемы",    color: "text-teal-300" },
                    { n: "04", l: "тип документа", color: "text-amber-300" },
                ].map((m, i) => (
                    <div
                        key={m.l}
                        className={`bg-slate-900/60 px-6 py-5 ${i < 2 ? "border-r border-slate-800" : ""}`}
                    >
                        <div className={`font-mono text-3xl font-medium leading-none tracking-tight ${m.color}`}>
                            {m.n}
                        </div>
                        <div className="mt-2 text-xs text-slate-500">{m.l}</div>
                    </div>
                ))}
            </section>

            {/* Проблема / решение */}
            <section className="mt-20 grid gap-8 md:grid-cols-2">
                <article className="flex flex-col gap-3 p-6 bg-slate-900/40 border border-slate-800 rounded-md">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">было</span>
                    <h2 className="m-0 text-lg font-semibold text-slate-100">Ручной расчёт в Excel</h2>
                    <p className="m-0 text-sm leading-relaxed text-slate-400 text-pretty">
                        Графики и заявки ведутся вручную, данные СРО и МТР живут в разных файлах.
                        Рассинхронизация приводит к простоям бригад и дефицитам материалов на стройке.
                    </p>
                </article>
                <article className="flex flex-col gap-3 p-6 bg-slate-900/40 border border-slate-800 rounded-md">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-sky-400">стало</span>
                    <h2 className="m-0 text-lg font-semibold text-slate-100">Единый аналитический контур</h2>
                    <p className="m-0 text-sm leading-relaxed text-slate-400 text-pretty">
                        Аналитик вводит исходные данные в форму, получает рассчитанные графики
                        и выгружает готовый документ в нужном формате. Один источник правды для обеих подсистем.
                    </p>
                </article>
            </section>

            {/* Задачи */}
            <section className="mt-20">
                <div className="flex items-baseline justify-between mb-6">
                    <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-100">Задачи и документы</h2>
                    <span className="font-mono text-[11px] text-slate-500">{tasks.length} / 6</span>
                </div>

                <ol className="m-0 p-0 list-none flex flex-col">
                    {tasks.map((t, i) => (
                        <li
                            key={t.n}
                            className={`grid grid-cols-[auto_auto_1fr] md:grid-cols-[auto_auto_1fr_2fr] items-baseline gap-x-6 gap-y-1 py-5 ${
                                i > 0 ? "border-t border-slate-800" : ""
                            } ${t.sys === "—" ? "opacity-55" : ""}`}
                        >
                            <span className="font-mono text-xs text-slate-500 tabular-nums">{t.n}</span>
                            <span
                                className={`font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 border rounded-full ${sysColor(t.sys)}`}
                            >
                                {t.sys}
                            </span>
                            <h3 className="m-0 text-base font-medium leading-snug text-slate-100 text-balance">
                                {t.name}
                            </h3>
                            <p className="m-0 col-span-3 md:col-span-1 font-mono text-xs leading-relaxed text-slate-500 text-pretty">
                                {t.model}
                            </p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* Стек */}
            <section className="mt-20">
                <h2 className="m-0 mb-6 text-2xl font-semibold tracking-tight text-slate-100">Технологический стек</h2>
                <dl className="grid gap-6 md:grid-cols-2">
                    {stack.map((s) => (
                        <div key={s.group} className="flex flex-col gap-2 p-5 bg-slate-900/40 border border-slate-800 rounded-md">
                            <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{s.group}</dt>
                            <dd className="m-0 flex flex-wrap gap-1.5">
                                {s.items.map((it) => (
                                    <span
                                        key={it}
                                        className="font-mono text-[11px] px-2 py-1 text-slate-300 bg-slate-800/60 border border-slate-800 rounded"
                                    >
                                        {it}
                                    </span>
                                ))}
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* Метаданные ВКР */}
            <section className="mt-20 pb-8">
                <h2 className="m-0 mb-6 text-2xl font-semibold tracking-tight text-slate-100">О дипломной работе</h2>
                <dl className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-x-8 gap-y-0 border-t border-slate-800">
                    {[
                        ["Тема ВКР",            "Разработка проектного решения по автоматизации задач комплекса подсистем КИС"],
                        ["Объект автоматизации","Строительная компания водоснабжения"],
                        ["Год защиты",          "2026"],
                        ["Студент",             "—"],
                        ["Научный руководитель","—"],
                        ["Кафедра",             "—"],
                    ].map(([k, v]) => (
                        <div key={k} className="contents">
                            <dt className="py-4 font-mono text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
                                {k}
                            </dt>
                            <dd className="m-0 py-4 text-sm text-slate-200 border-b border-slate-800 text-pretty">
                                {v}
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* CTA */}
            <section className="mt-12 flex flex-wrap items-center gap-3">
                <Link
                    href="/tasks"
                    className="inline-flex items-center gap-2 h-10 px-5 bg-sky-400 hover:bg-sky-300 text-slate-950 text-sm font-medium rounded transition-colors no-underline"
                >
                    Перейти к задачам <span aria-hidden="true">→</span>
                </Link>
                <Link
                    href="/"
                    className="inline-flex items-center h-10 px-5 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-medium rounded transition-colors no-underline"
                >
                    На главную
                </Link>
            </section>
        </main>
    );
}