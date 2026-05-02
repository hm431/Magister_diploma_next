import './globals.css';
import { Header } from '@/components/organisms/HeaderOrganism';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-[#0e1014] m-0 max-w-[1280px] mx-auto px-4 ">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}