const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { port, publicOrigin, telegramBotToken, telegramChannelId } = require('./config');
const adsRoutes = require('./routes/ads');
const healthRoutes = require('./routes/health');
const meRoutes = require('./routes/me');
const telegramWebhookRoutes = require('./routes/telegramWebhook');
const errorHandler = require('./middleware/errorHandler');
const { startCronjob } = require('./services/cronjob');
const { verifyTelegramChannelAccess } = require('./services/telegram');

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Flexible CORS: allow configured PUBLIC_ORIGIN, and also allow local preview origins (127.0.0.1 with any port)
let corsOptions;
if (!publicOrigin || publicOrigin === '*') {
  corsOptions = { origin: true };
} else {
  const allowed = publicOrigin.split(',').map(s => s.trim()).filter(Boolean);
  corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests like curl
      if (allowed.includes(origin)) return callback(null, true);
      // allow local preview on 127.0.0.1 (any port)
      try {
        const url = new URL(origin);
        if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return callback(null, true);
      } catch (e) {
        // ignore parse errors
      }
      return callback(new Error('Not allowed by CORS'));
    }
  };
}
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

app.use('/api/ads', upload.single('photo'), adsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/me', meRoutes);
app.use('/api/telegram/webhook', telegramWebhookRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Mag Obyava backend listening on port ${port}`);
  if (telegramBotToken && telegramChannelId) {
    console.log('✓ Telegram integration enabled');
    verifyTelegramChannelAccess();
  } else {
    console.warn('⚠ Telegram integration disabled (missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID)');
  }
});

startCronjob();
