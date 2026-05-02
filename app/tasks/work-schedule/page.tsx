// Календарный график работ
import TaskHeaderOrganism from '@/components/organisms/TaskHeaderOrganism'
import TaskSolutionOrganism from '@/components/organisms/TaskSolutionOrganism'

export default function WorkSchedulePage(){
    return (
        <div>
            <TaskHeaderOrganism 
            path='Календарный график работ'
            subSistem='СРО'
            taskName='Календарный график работ'
            // TODO Возможно изминение описания
            taskDescription='Сетевая модель с ресурсными ограничениями. На вход — список работ, длительности и потребности в материалах; на выход — оптимизированный календарный график и документ «Календарный график производства работ».' />
            <TaskSolutionOrganism/> 
        </div>
    )
}