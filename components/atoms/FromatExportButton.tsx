interface FromatExportButtonProps {
    format: string
    active: boolean
}

export default function FromatExportButton(props: FromatExportButtonProps) {
    return (
        <button
            type="button"
            aria-pressed={props.active}
            className={`flex-1 h-[30px] flex items-center justify-center font-mono text-[11px] font-semibold border-[1.5px] rounded 
                ${props.active
                    ? "text-[#6a93c8] bg-[#2a3a52] border-[1.5px] border-[#6a93c8]"
                    : "text-gray-400 bg-transparent border-gray-600"
                }`}
        >
            {props.format}
        </button>
    )
}