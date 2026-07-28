const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
  console.warn('Warning: .env file not found or could not be read');
}

const dotenv = require('dotenv');

const required = [
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHANNEL_ID',
  'ADMIN_TELEGRAM_ID'
];

required.forEach((key) => {
  if (!process.env[key]) {
    // warn but allow running in anonymous/test mode
    console.warn(`Environment variable ${key} is not set`);
  }
});

module.exports = {
  port: process.env.PORT || 3000,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChannelId: process.env.TELEGRAM_CHANNEL_ID,
  adminTelegramId: process.env.ADMIN_TELEGRAM_ID,
  allowAnonymous: process.env.ALLOW_ANONYMOUS === 'true',
  publicOrigin: process.env.PUBLIC_ORIGIN || '*',
  cronIntervalMs: Number(process.env.CRON_INTERVAL_MS || 24 * 60 * 60 * 1000)
};
