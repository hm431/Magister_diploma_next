import Link from "next/link";

interface NavButtonProps {
  title: string;
  path: string;
  className?: string;
}

export function NavButton({ title, path, className = "" }: NavButtonProps) {
  return (
    <Link
      href={path}
      className={`pb-[3px] border-b-[5px] border-[#6A93C8] text-white no-underline hover:bg-white/10 ${className}`}
    >
      {title}
    </Link>
  );
}
