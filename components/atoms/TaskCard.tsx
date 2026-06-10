import Link from "next/link";

interface TaskCardProps {
    taskNumber: number;
    subsystemName: string;
    taskName: string;
    taskSubname: string;
    taskDescription: string;
    taskPath: string;
}

const SUBSYSTEM_COLORS: Record<string, { border: string; badge: string }> = {
    СРО:  { border: "border-t-[#7fb3b0]", badge: "border-[#7fb3b0] text-[#7fb3b0]" },
    МТО:  { border: "border-t-[#c9a06a]", badge: "border-[#c9a06a] text-[#c9a06a]" },
    РИСК: { border: "border-t-[#6a93c8]", badge: "border-[#6a93c8] text-[#6a93c8]" },
    ОПС:  { border: "border-t-[#a78bfa]", badge: "border-[#a78bfa] text-[#a78bfa]" },
};

export default function TasksCard(props: TaskCardProps) {
    const colors = SUBSYSTEM_COLORS[props.subsystemName] ?? {
        border: "border-t-slate-700",
        badge:  "border-slate-600 text-slate-500",
    };

    return (
        <div className={`flex flex-col bg-[#16181D] hover:bg-[#1F232B] transition-colors rounded-md border-t-4 ${colors.border} p-5 gap-4`}>

            {/* Шапка: номер + бейдж подсистемы */}
            <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-widest text-slate-600 tabular-nums">
                    0{props.taskNumber}
                </span>
                <span className={`font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded border ${colors.badge}`}>
                    {props.subsystemName}
                </span>
            </div>

            {/* Название + подзаголовок */}
            <div className="flex flex-col gap-1">
                <h3 className="font-sans text-base font-semibold leading-snug tracking-tight text-slate-100">
                    {props.taskName}
                </h3>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                    {props.taskSubname}
                </p>
            </div>

            {/* Описание модели — растягивается чтобы ссылка всегда внизу */}
            <p className="flex-1 font-mono text-[11px] leading-relaxed text-slate-500 border-t border-slate-800 pt-3">
                {props.taskDescription}
            </p>

            {/* Ссылка */}
            <div className="flex justify-end">
                <Link
                    className="font-mono text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors no-underline"
                    href={`/tasks/${props.taskPath}`}
                >
                    Открыть →
                </Link>
            </div>
        </div>
    );
}
