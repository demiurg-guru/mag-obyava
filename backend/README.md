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

## Telegram initData и номер телефона

Фронтенд (Mini App) должен на каждый запрос к `/api/ads` и `/api/me` слать заголовок:

```
X-Telegram-Init-Data: <window.Telegram.WebApp.initData>
```

Бэкенд проверяет подпись этого initData и берёт из него `telegram_id` и `username` —
так username подтягивается в БД автоматически и без доверия к клиенту.
Пока фронт не обновлён, старый способ (`telegram_id` в теле/query) продолжает работать
как запасной вариант.

Номер телефона Telegram не передаёт через Mini App API — его нужно запросить
через `tg.requestContact()` на фронте. Номер придёт боту отдельным сообщением
(тип `contact`), которое обрабатывает `POST /api/telegram/webhook`. Чтобы Telegram
слал туда апдейты, один раз зарегистрируй webhook (публичный HTTPS-адрес сервиса,
например Render URL):

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://mag-obyava.onrender.com/api/telegram/webhook"
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
