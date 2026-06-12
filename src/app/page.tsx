import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <PageShell>
      <div className="flex flex-col items-center gap-8 py-8 text-center">
        <div className="space-y-4">
          <div className="text-6xl">☢️</div>
          <h1 className="text-4xl font-bold tracking-tight text-amber-400 sm:text-5xl">
            Бункер
          </h1>
          <p className="mx-auto max-w-md text-lg text-stone-400">
            Катастрофа на пороге. Мест в бункере меньше, чем желающих выжить.
            Раскрывайте карты, спорьте, голосуйте — кто останется за стальной
            дверью?
          </p>
        </div>

        <div className="grid w-full max-w-sm gap-3">
          <Link href="/create" className="w-full">
            <Button size="lg" className="w-full">
              Создать игру
            </Button>
          </Link>
          <Link href="/join" className="w-full">
            <Button size="lg" variant="secondary" className="w-full">
              Подключиться
            </Button>
          </Link>
          <Link href="/rules" className="w-full">
            <Button size="lg" variant="outline" className="w-full">
              Правила
            </Button>
          </Link>
          <Link href="/ai-template" className="w-full">
            <Button size="lg" variant="ghost" className="w-full">
              Шаблон для нейронки
            </Button>
          </Link>
        </div>

        <Card className="w-full max-w-md border-stone-700/50">
          <CardContent className="py-4 text-sm text-stone-500">
            Соберите друзей, импортируйте сценарий от ИИ или используйте
            демо-данные. Хост ведёт раунды, игроки видят только свои секретные
            карты.
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
