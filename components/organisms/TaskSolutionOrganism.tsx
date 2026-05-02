import TaskFormMolecule from '@/components/molecules/TaskFormMolecule'
import TaskAnalyticsMolecule from '@/components/molecules/TaskAnalyticsMolecule'
import TaskDocumentMolecule from '@/components/molecules/TaskDocumentMolecule'


export default function TaskSolutionOrganism() {
    return (
        <div className="flex flex-row w-full justify-between">
            <TaskFormMolecule />
            <TaskAnalyticsMolecule />
            <TaskDocumentMolecule />
        </div>
    )
}