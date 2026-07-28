# Mag Obyava Backend

Node.js backend for the Mag Obyava Telegram mini-app.

## Структура

- `src/server.js` — основной сервер
- `src/routes/ads.js` — создание, получение и удаление объявлений
- `src/routes/health.js` — `/api/health`
- `src/services/supabase.js` — работа с Supabase
- `src/services/telegram.js` — отправка сообщений в Telegram
- `src/services/cronjob.js` — автоматическое удаление старых объявлений
- `src/middleware/` — проверка и обработка ошибок
- `src/utils/validators.js` — валидация данных

## Требуемые переменные окружения

```text
SUPABASE_URL=
SUPABASE_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=
ADMIN_TELEGRAM_ID=
PORT=3000
PUBLIC_ORIGIN=
CRON_INTERVAL_MS=86400000
```

## Запуск

```bash
npm install
npm start
```

Для разработки:

```bash
npm install
npm run dev
```
