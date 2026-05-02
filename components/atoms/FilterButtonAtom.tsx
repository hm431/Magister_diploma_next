interface FilterButtonAtomProps{
    name: string
}

export default function FilterButtonAtom (props: FilterButtonAtomProps) {
    return (
        <button className="border-1 py-2 px-3 border-gray-400 rounded-xl hover:bg-gray-500">
            {props.name}
        </button>
    );
}