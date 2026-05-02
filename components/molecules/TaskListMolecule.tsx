import TasksCard from "../atoms/TaskCard";

export function TaskListMolecule () {
const tasks = [
        {
            taskNumber: 1,
            subsystemName: "СРО",
            taskName: "Календарный график работ",
            taskSubname: "с учётом наличия материалов",
            taskDescription: "RCPSP — сетевая модель с ресурсными ограничениями",
        },
        {
            taskNumber: 2,
            subsystemName: "МТР",
            taskName: "График закупок МТР",
            taskSubname: "под утверждённый график строительства",
            taskDescription: "Временна́я модель потребности ресурсов + балансовая модель",
        },
        {
            taskNumber: 3,
            subsystemName: "МТР",
            taskName: "Загрузка складов и логистика",
            taskSubname: "объекта строительства",
            taskDescription: "Модель массового обслуживания / потоковая модель",
        },
        {
            taskNumber: 4,
            subsystemName: "СРО",
            taskName: "Отклонение сроков по КС-6",
            taskSubname: "недельно-суточный график",
            taskDescription: "Динамическая сетевая модель с пересчётом критического пути",
        },
        {
            taskNumber: 5,
            subsystemName: "—",
            taskName: "Задача 05",
            taskSubname: "в разработке",
            taskDescription: "Постановка и математическая модель будут определены на следующем этапе",
        },
        {
            taskNumber: 6,
            subsystemName: "—",
            taskName: "Задача 06",
            taskSubname: "в разработке",
            taskDescription: "Постановка и математическая модель будут определены на следующем этапе",
        },
    ];
    return (
        <div className="grid grid-cols-2 gap-4">
            {tasks.map((item) =>(
                 <TasksCard
                 key={item.taskNumber}
                 taskNumber={item.taskNumber}
                 subsystemName={item.subsystemName}
                 taskName={item.taskName}
                 taskSubname={item.taskSubname}
                 taskDescription={item.taskDescription}
            /> 
            ))}
           
            
        </div>
    )
}