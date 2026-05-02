import FilterButtonAtom from '@/components/atoms/FilterButtonAtom'

export function FilterTaskMolecule () {
    return (
        <div className='flex gap-4 w-full justify-end px-4'>
            <FilterButtonAtom name="Все"/>
            <FilterButtonAtom name="СРО"/>
            <FilterButtonAtom name="МТР"/>
        </div>
    );
}