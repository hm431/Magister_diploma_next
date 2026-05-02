interface TaskHeaderProps{
    path: string;
    subSistem: string;
    taskName: string;
    taskDescription: string;

}

export default function TaskHeaderOrganism(props: TaskHeaderProps) {
    return (
        <header className="flex flex-col gap-4 pb-8 border-b border-slate-800">
            <nav aria-label="Хлебные крошки"> 
                {/* TODO  перенести хлебные крошки в отдельный компонент */}
                <ol className="flex flex-wrap items-center gap-2 m-0 p-0 list-none font-mono text-[11px] tracking-wide">
                    <li>
                        <a href="/" className="text-slate-500 hover:text-slate-100 transition-colors no-underline">Главная</a>
                    </li>
                    <li className="text-slate-700 select-none" aria-hidden="true">/</li>
                    <li>
                        <a href="/tasks" className="text-slate-500 hover:text-slate-100 transition-colors no-underline">Задачи</a>
                    </li>
                    <li className="text-slate-700 select-none" aria-hidden="true">/</li>
                    <li className="text-slate-400" aria-current="page">{props.path}</li>
                </ol>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 border border-teal-300/40 text-teal-300 rounded-full">
                    {props.subSistem}
                </span>
            </div>

            <div className="flex flex-col gap-2">
                <h1 className="m-0 text-3xl md:text-4xl font-semibold leading-[1.1] tracking-tight text-slate-100 text-balance">
                    {props.taskName}
                </h1>
            </div>

            <p className="m-0 max-w-[68ch] text-sm leading-relaxed text-slate-400 text-pretty">
                {props.taskDescription}
            </p>
            {/* TODO  Пока закоменчен возмодно при создании общего пула и понимания задачи переделаю на необходимое*/}
            {/* <dl className="flex flex-wrap gap-x-10 gap-y-3 mt-2 m-0">
                <div className="flex flex-col gap-1">
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Подсистема</dt>
                    <dd className="m-0 text-sm text-slate-200">СРО · сметно-расчётный отдел</dd> 
                </div>
                <div className="flex flex-col gap-1">
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Модель</dt>
                    <dd className="m-0 text-sm text-slate-200">RCPSP — Resource-Constrained Project Scheduling</dd>
                </div>
                <div className="flex flex-col gap-1">
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Документ</dt>
                    <dd className="m-0 text-sm text-slate-200">Календарный график производства работ</dd>
                </div>
                <div className="flex flex-col gap-1">
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Формат</dt>
                    <dd className="m-0 text-sm text-slate-200 font-mono">.xlsx · .pdf · .docx</dd>
                </div>
            </dl> */}
        </header>
    )
}