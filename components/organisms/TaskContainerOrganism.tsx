import { FilterTaskMolecule } from "@/components/molecules/FilterTaskMolecule";
import { TaskListMolecule } from "@/components/molecules/TaskListMolecule";

export function TaskContainerOrganism() {
    return (
        <div className="">
            <h2>Задачи комплекса подсистем</h2>
            <p>Шесть аналитических задач. Каждая формирует результирующий документ.</p>
            <FilterTaskMolecule />
            <TaskListMolecule />
        </div>
    );
}