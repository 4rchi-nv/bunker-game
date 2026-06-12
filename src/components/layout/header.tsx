import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">☢️</span>
          <span className="text-lg font-bold tracking-wide text-amber-400">
            Бункер
          </span>
        </Link>
        <nav className="flex gap-3 text-sm">
          <Link
            href="/rules"
            className="text-stone-400 transition hover:text-amber-400"
          >
            Правила
          </Link>
          <Link
            href="/ai-template"
            className="text-stone-400 transition hover:text-amber-400"
          >
            Шаблон ИИ
          </Link>
        </nav>
      </div>
    </header>
  );
}
