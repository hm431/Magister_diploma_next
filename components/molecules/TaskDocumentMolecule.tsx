import DocumentPreviewAtom from '@/components/atoms/DocumentPreviewAtom'
import FromatExportButton from '@/components/atoms/FromatExportButton'
import DowloadButtonAtom from '@/components/atoms/DowloadButtonAtom'

export default function TaskDocumentMolecule() {
    return (
        <aside className="flex flex-col gap-3 p-5 bg-[#15181d] border-l border-[#272c34] overflow-hidden">

            <header className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6b7380]">
                    Документ
                </span>
                <span className="font-mono text-[10px] text-[#6b7380]">
                    стр. 1 / 4
                </span>
            </header>

            <DocumentPreviewAtom/>
            

            <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] text-[#6b7380]">формат выгрузки</span>
                <div className="flex gap-1.5">
                    <FromatExportButton format="PDF" active={true} />
                    <FromatExportButton format="XLSX"  active={false}/>
                    <FromatExportButton format="MPP"  active={false}/>
                </div>
            </div>

            <div className="flex gap-2">
                <DowloadButtonAtom />
               
            </div>
        </aside>
    )
}