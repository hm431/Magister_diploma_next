import Link from "next/link";

interface TaskCardProps {
    taskNumber: number;
    subsystemName: string;
    taskName: string;
    taskSubname: string;
    taskDescription: string;
}
// Карточка описания и открытия задачи
export default function TasksCard(props: TaskCardProps) {

    return (
        <div className="bg-[#16181D] hover:bg-[#1F232B] rounded-md border-t-5 border-indigo-900 max-w-150 p-5">
            <div className="w-full flex flex-row mb-5 justify-between">
                <h3 className="basis-1/2 font-mono text-xs leading-none tracking-wide text-slate-500 tabular-nums">0{props.taskNumber}</h3>
                <div className="basis-1/2  p-1 font-mono text-[10px] uppercase leading-none tracking-[0.06em] rounded-xl border-2 border-[#7DB0AD] text-center text-[#7DB0AD] max-w-10">{props.subsystemName}</div>
            </div>
                <h3 className="font-sans text-base font-semibold leading-snug tracking-tight text-slate-100 text-balance">{props.taskName}</h3>
                <p className="mb-15 font-sans text-xs font-normal leading-relaxed text-slate-400 text-pretty">{props.taskSubname}</p>
            <div className="flex w-full font-mono text-[10px] font-normal leading-snug tracking-normal text-slate-500 text-pretty border-t-1">
                <p>{props.taskDescription}</p>
            </div>
            <div className="flex w-full justify-end">
                <Link className="font-sans text-xs font-medium leading-none tracking-tight text-sky-400" href={`/tasks/${props.taskNumber}`}>Открыть →</Link> 
            </div>
        </div>
    )
}