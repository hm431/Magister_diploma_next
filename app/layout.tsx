import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { Header } from '@/components/organisms/HeaderOrganism';

export const metadata: Metadata = {
  title: 'КИС — Водоканал',
  description: 'Автоматизация задач комплекса подсистем КИС',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-[#0e1014] m-0 max-w-[1280px] mx-auto px-4">
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
