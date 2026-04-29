import Link from 'next/link';

export function DescriptionTextMolecule() {
  return (
    <div className="flex flex-col gap-5 py-12 w-[40%] max-w-[560px] text-[#e8eaee]">
      <h1 className="m-0 text-[40px] leading-[1.15] font-semibold tracking-tight text-[#e8eaee] max-md:text-[30px]">
        Автоматизация задач комплекса подсистем КИС
      </h1>

      <p className="m-0 text-[15px] leading-relaxed text-[#aab1bd]">
        Аналитический контур для строительной компании водоснабжения. Интеграция
        подсистем СРО и МТР, формирование четырёх типов проектных документов на
        основе единого источника данных.
      </p>

      <div className="flex gap-3 mt-2">
        <Link
          href="/tasks"
          className="inline-flex items-center justify-center h-10 px-5 text-[13px] font-medium no-underline rounded cursor-pointer transition-all duration-[120ms] bg-[#6a93c8] border border-[#6a93c8] text-[#0e1014] hover:bg-[#82a6d4] hover:border-[#82a6d4] focus-visible:outline-2 focus-visible:outline-[#6a93c8] focus-visible:outline-offset-2"
        >
          Задачи
        </Link>
        <Link
          href="/about"
          className="inline-flex items-center justify-center h-10 px-5 text-[13px] font-medium text-[#e8eaee] no-underline rounded cursor-pointer transition-all duration-[120ms] bg-transparent border border-[#272c34] hover:bg-[#1b1f25] hover:border-[#3a414c] focus-visible:outline-2 focus-visible:outline-[#6a93c8] focus-visible:outline-offset-2"
        >
          О дипломе
        </Link>
      </div>

      {/* Карточки-метрики */}
      <div className="mt-4 grid grid-cols-3 gap-px bg-[#272c34] border border-[#272c34] rounded-md overflow-hidden max-md:grid-cols-1">
        <div className="flex flex-col gap-1 p-[18px_20px] bg-[#15181d]">
          <h2 className="m-0 font-mono text-[26px] font-medium leading-none tracking-tighter text-[#6a93c8]">04</h2>
          <p className="m-0 text-[11px] text-[#6b7380] lowercase">задачи</p>
        </div>
        <div className="flex flex-col gap-1 p-[18px_20px] bg-[#15181d]">
          <h2 className="m-0 font-mono text-[26px] font-medium leading-none tracking-tighter text-[#7fb3b0]">02</h2>
          <p className="m-0 text-[11px] text-[#6b7380] lowercase">подсистема</p>
        </div>
        <div className="flex flex-col gap-1 p-[18px_20px] bg-[#15181d]">
          <h2 className="m-0 font-mono text-[26px] font-medium leading-none tracking-tighter text-[#c9a06a]">04</h2>
          <p className="m-0 text-[11px] text-[#6b7380] lowercase">тип документа</p>
        </div>
      </div>
    </div>
  );
}