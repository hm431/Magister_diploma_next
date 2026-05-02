import DocumentFormInputAtom from '@/components/atoms/DocumentFormInputAtom'

export default function TaskFormMolecule() {
    return (
        <div className='w-100 border-1  border-t-0 border-slate-800 border-solid p-3 bg-[#16181D]'>
            <div className='flex gap-1 justify-between pb-3 border-b border-slate-800'>
                <h3 className='m-0 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300'>
                    ВХОДНЫЕ ДАННЫЕ
                </h3>
                <samp className='font-mono text-[10px] tracking-wide text-slate-500 tabular-nums'>
                    8 полей {/* TODO: Поля точно переделаем */}
                </samp> 
            </div>
            <div className='items-center gap-3 pt-2'>
                <div className='font-mono text-[10px] uppercase tracking-[0.1em] text-slate-300 py-2'>
                    Объект
                </div>
                <form className='flex flex-col gap-3'>
                    <DocumentFormInputAtom name="Шифр объекта" subName="ВК-2025-014" />
                    <DocumentFormInputAtom name="Наименование" subName="Водозабор №3" />
                    <div className='flex justify-between'>
                        {/* TODO  Добавить атомы для форм даты и форм документов*/}
                        <DocumentFormInputAtom name="Начало" subName="01.03.2025" />
                        <DocumentFormInputAtom name="Окончание" subName="30.09.2025" />
                    </div>
                    <div className='font-mono text-[10px] uppercase tracking-[0.1em] text-slate-300 py-2'>
                        ПАРАМЕТРЫ РАСЧЁТА
                    </div>
                    <DocumentFormInputAtom name="Метод выравнивания" subName="Минимизация срока" />
                    <DocumentFormInputAtom name="Допуск дефицита, %" subName="5" />
                    <DocumentFormInputAtom name="Тех" subName="ВК-2025-014" />

                </form>
            </div>
        </div>
    )
}