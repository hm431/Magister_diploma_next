import Link from 'next/link';
import { NavButton } from '@/components/atoms/NavButton';

export function NavigationMolecule() {
  return (
    <div className="flex flex-row items-center gap-5 bg-black px-5 py-5">
      <div className="flex items-center gap-2.5">
        <img src="/favicon.ico" alt="logo" width={24} height={24} />
        <h1 className="text-sm text-white m-0 font-normal">Кис · Водоканал</h1>
      </div>

      <NavButton title="Главная" path="/" />
      <NavButton title="Список Задач" path="/tasks" />
      <NavButton title="О программе" path="/about" />

      {/* Логин — ml-auto прижимает вправо, убираем border-b и добавляем фон */}
      <Link
        href="/login"
        className="ml-auto rounded px-2.5 py-1 text-sm text-white no-underline bg-[#6A93C8] hover:bg-[#82a6d4] transition-colors"
      >
        Логин
      </Link>
    </div>
  );
}