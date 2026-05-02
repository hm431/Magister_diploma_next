import { FilterTaskMolecule } from "@/components/molecules/FilterTaskMolecule";
import { TaskListMolecule } from "@/components/molecules/TaskListMolecule";

export function TaskContainerOrganism() {
    return (
        <div className="">
            <div className="flex justify-between items-start py-5">
                <div >

                    <nav aria-label="Хлебные крошки">
                        <ol className="flex flex-wrap items-center gap-2 m-0 p-0 list-none font-mono text-[11px] tracking-wide">
                            <li>
                                <a href="/" className="text-slate-500 hover:text-slate-100 transition-colors no-underline">Главная</a>
                            </li>
                            <li className="text-slate-700 select-none" aria-hidden="true">/</li>
                            <li className="text-slate-400" aria-current="page">Задачи</li>
                        </ol>
                    </nav>

                    <h1 className="m-0 text-3xl font-semibold leading-tight tracking-tight text-slate-100 text-balance">
                        Задачи комплекса подсистем
                    </h1>

                    <p className="m-0 max-w-[60ch] text-sm leading-relaxed text-slate-400 text-pretty">
                        Шесть аналитических задач. Каждая формирует результирующий документ.
                    </p>
                </div>
                <div className="self-end">
                    <FilterTaskMolecule  />
                </div>
            </div>
            <TaskListMolecule />
        </div>
    );
}