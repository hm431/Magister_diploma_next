import Link from "next/link";

interface TaskCardProps {
    taskNumber: number;
    subsystemName: string;
    taskName: string;
    taskSubname: string;
    taskDescription: string;
}

export default function TasksCard(props: TaskCardProps) {
    return (
        <div className="bg-[#16181D] rounded-md border-t-5 border-indigo-900">
            <div className="w-full flex flex-row mb-5">
                <h3 className="basis-1/2 font-mono text-xs leading-none tracking-wide text-slate-500 tabular-nums">0{props.taskNumber}</h3>
                <div className="basis-1/2 font-mono text-[10px] uppercase leading-none tracking-[0.06em]">{props.subsystemName}</div>
            </div>
                <h3 className="font-sans text-base font-semibold leading-snug tracking-tight text-slate-100 text-balance">{props.taskName}</h3>
                <p className="mb-15 font-sans text-xs font-normal leading-relaxed text-slate-400 text-pretty">{props.taskSubname}</p>
            <div className="flex w-full font-mono text-[10px] font-normal leading-snug tracking-normal text-slate-500 text-pretty">
                <p>{props.taskDescription}</p>
            </div>
            <div className="flex w-full justify-end">
                {/* TODO Возможно стоит указывать имена задачи в URL */}
                <Link className="font-sans text-xs font-medium leading-none tracking-tight text-sky-400" href={`/tasks/${props.taskNumber}`}>Открыть →</Link> 
            </div>
        </div>
    )
}