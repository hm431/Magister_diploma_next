export function DescriptionSchemaMolecule() {
  return (
    <div className="relative flex flex-col gap-5 p-6 w-[60%] bg-[#15181d] border border-[#272c34] rounded-lg text-[#e8eaee] max-md:w-full">
      {/* @keyframes для анимации пунктира в SVG */}
      <style>{`@keyframes flow-dash { to { stroke-dashoffset: -160; } }`}</style>

      {/* Шапка */}
      <div className="flex justify-between items-baseline font-mono text-[11px] text-[#6b7380] uppercase tracking-[0.08em]">
        <span className="text-[#aab1bd]">Схема интеграции</span>
        <span className="lowercase tracking-normal">обмен данными</span>
      </div>

      {/* Карточки подсистем */}
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        {/* СРО */}
        <article className="flex overflow-hidden bg-[#1b1f25] border border-[#272c34] rounded-md">
          <div className="w-[3px] shrink-0 bg-[#7fb3b0]" />
          <div className="p-4">
            <span className="block font-mono text-[11px] text-[#6b7380]">подсистема</span>
            <h3 className="mt-1 mb-0 text-xl font-semibold tracking-tight text-[#7fb3b0]">СРО</h3>
            <p className="mt-2 mb-0 text-xs leading-[1.5] text-[#aab1bd]">
              Сметно-расчётный отдел.<br />Графики работ, КС-6.
            </p>
          </div>
        </article>

        {/* МТР */}
        <article className="flex overflow-hidden bg-[#1b1f25] border border-[#272c34] rounded-md">
          <div className="w-[3px] shrink-0 bg-[#c9a06a]" />
          <div className="p-4">
            <span className="block font-mono text-[11px] text-[#6b7380]">подсистема</span>
            <h3 className="mt-1 mb-0 text-xl font-semibold tracking-tight text-[#c9a06a]">МТР</h3>
            <p className="mt-2 mb-0 text-xs leading-[1.5] text-[#aab1bd]">
              Материально-технические<br />ресурсы. Закупки, склад.
            </p>
          </div>
        </article>
      </div>

      {/* Диаграмма потоков */}
      <div className="relative h-[140px] bg-[#0e1014] border border-[#272c34] rounded-md overflow-hidden max-md:h-[110px]">
        <svg
          className="w-full h-full block"
          viewBox="0 0 320 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="none"
            stroke="#7fb3b0"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="4 4"
            opacity="0.85"
            style={{ animation: "flow-dash 6s linear infinite" }}
            d="M 40 36 C 120 36, 200 36, 280 36"
          />
          <path
            fill="none"
            stroke="#c9a06a"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="4 4"
            opacity="0.85"
            style={{ animation: "flow-dash 6s linear infinite reverse" }}
            d="M 280 84 C 200 84, 120 84, 40 84"
          />
          <circle cx="40"  cy="60" r="6" strokeWidth="2" stroke="#7fb3b0" fill="#15181d" />
          <circle cx="280" cy="60" r="6" strokeWidth="2" stroke="#c9a06a" fill="#15181d" />
          <text fontFamily="'JetBrains Mono', ui-monospace, monospace" fontSize="9" fill="#6b7380" letterSpacing="0.04em" x="160" y="28"  textAnchor="middle">объёмы работ →</text>
          <text fontFamily="'JetBrains Mono', ui-monospace, monospace" fontSize="9" fill="#6b7380" letterSpacing="0.04em" x="160" y="104" textAnchor="middle">← остатки, сроки поставки</text>
        </svg>

        {/* Центральный хаб */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-[#15181d] border border-[#6a93c8] rounded-full shadow-[0_0_0_4px_rgba(106,147,200,0.08)]">
          <span className="font-mono text-[13px] font-medium text-[#6a93c8] tracking-[0.04em]">КИС</span>
        </div>
      </div>

      {/* Легенда */}
      <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
        <li className="flex items-center gap-2.5 font-mono text-[11px] text-[#aab1bd]">
          <span className="w-2 h-2 rounded-full shrink-0 bg-[#7fb3b0]" />
          СРО → МТР: график работ, потребности
        </li>
        <li className="flex items-center gap-2.5 font-mono text-[11px] text-[#aab1bd]">
          <span className="w-2 h-2 rounded-full shrink-0 bg-[#c9a06a]" />
          МТР → СРО: остатки, сроки поставок
        </li>
      </ul>
    </div>
  );
}