import TasksCard from "../atoms/TaskCard";

export function TaskListMolecule () {
    const tasks = [
        {
            taskNumber: 1,
            subsystemName: "",
            taskName: "Календарный график работ",
            taskSubname: "с учётом наличия материалов",
            taskDescription: "CPM/RCPSP — сетевая модель с ресурсными ограничениями. Диаграмма Ганта с критическим путём.",
            taskPath: "work-schedule"
        },
        {
            taskNumber: 2,
            subsystemName: "",
            taskName: "Распределение бригад",
            taskSubname: "оптимизация назначений на участки",
            taskDescription: "LP-модель с весовой целевой функцией F₃ = α₁c₁ + α₂c₂ + α₃c₃.",
            taskPath: "brigade-assignment"
        },
        {
            taskNumber: 3,
            subsystemName: "",
            taskName: "График закупок МТР",
            taskSubname: "под утверждённый календарный график",
            taskDescription: "LP-оптимизация поставок F₁, даты доступности T_доступ(j), выгрузка в 1С.",
            taskPath: "materials-procurement"
        },
        {
            taskNumber: 4,
            subsystemName: "",
            taskName: "Загрузка складов и логистика",
            taskSubname: "объекта строительства",
            taskDescription: "Модель M/M/n: профиль U_t, коэффициент ρ(t), время ожидания W_q(t).",
            taskPath: "warehouse-loading",
        },
        {
            taskNumber: 5,
            subsystemName: "",
            taskName: "Анализ рисков",
            taskSubname: "имитационная оценка сроков",
            taskDescription: "Монте-Карло: S-кривая F_T(t), P(T ≤ T_план), квантили T₀.₅ T₀.₈ T₀.₉, индексы CI_i.",
            taskPath: "risk-analysis",
        },
        {
            taskNumber: 6,
            subsystemName: "",
            taskName: "Оперативный контроль",
            taskSubname: "пересчёт по фактическим данным",
            taskDescription: "Динамическая сетевая модель: ΔT = ΔT_МТР + ΔT_иные, корректирующие сценарии σ*.",
            taskPath: "schedule-deviations",
        },
    ];
    return (
        <div className="grid grid-cols-3 gap-4">
            {tasks.map((item) =>(
                 <TasksCard
                 key={item.taskNumber}
                 taskNumber={item.taskNumber}
                 subsystemName={item.subsystemName}
                 taskName={item.taskName}
                 taskSubname={item.taskSubname}
                 taskDescription={item.taskDescription}
                 taskPath={item.taskPath}
            />
            ))}
        </div>
    )
}
