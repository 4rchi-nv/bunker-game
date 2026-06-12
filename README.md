# Бункер — онлайн-игра на выживание

Next.js приложение для дискуссионной игры «Бункер» с Firebase realtime.

## Быстрый старт

```bash
npm install
cp .env.example .env.local
# заполните Firebase переменные
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Firebase

1. Создайте проект на [Firebase Console](https://console.firebase.google.com)
2. Включите **Authentication → Anonymous**
3. Создайте **Firestore Database**
4. Скопируйте конфиг веб-приложения в `.env.local`
5. Задеплойте правила: `firebase deploy --only firestore:rules`

## Деплой

**Vercel:** подключите репозиторий, добавьте env variables, deploy.

**Firebase Hosting:** `npm run build && firebase deploy`

## Структура

- `/` — главная
- `/create` — создание комнаты
- `/join` — подключение по коду
- `/room/[code]/host` — панель хоста
- `/room/[code]/player` — экран игрока
- `/rules` — правила
- `/ai-template` — промпт для нейросети
