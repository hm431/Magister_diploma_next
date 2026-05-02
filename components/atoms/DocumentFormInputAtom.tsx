interface DocumentFormAtomProps{
    name: string,
    subName: string
}

export default function DocumentFormInputAtom (props: DocumentFormAtomProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500">{props.name}</label>
            <input type="text" id="name" placeholder={props.subName} required
            className="h-9 px-3 bg-slate-900/50 border border-slate-800 rounded text-[13px] text-slate-400 font-mono cursor-not-allowed"/>
        </div>
    );
}