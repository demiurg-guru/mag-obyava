const crypto = require('crypto');
const { validateTelegramId } = require('../utils/validators');
const { allowAnonymous, adminTelegramId, telegramBotToken } = require('../config');

/**
 * Verifies Telegram WebApp initData against the bot token using the
 * algorithm described in https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 * Returns the parsed `user` object on success, or null if missing/invalid/unverifiable.
 */
function verifyInitData(initData) {
  if (!initData || !telegramBotToken) return null;
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;
    params.delete('hash');

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(telegramBotToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash !== hash) return null;

    const userRaw = params.get('user');
    if (!userRaw) return null;
    return JSON.parse(userRaw);
  } catch (error) {
    console.warn('verifyInitData: failed to parse/verify initData:', error.message);
    return null;
  }
}

function requireTelegramId(req, res, next) {
  // Trusted internal-forwarding path (e.g., from n8n): accept username/id when a correct internal API key is present
  const { internalApiKey } = require('../config');
  const providedKey = req.headers['x-internal-api-key'] || null;
  if (internalApiKey && providedKey && providedKey === internalApiKey) {
    // try to read id and username from headers or body (webhook-like Update)
    const id = req.headers['x-telegram-id'] || req.body?.message?.from?.id || req.body?.callback_query?.from?.id || req.body?.chat_id || null;
    const uname = req.headers['x-telegram-username'] || req.body?.message?.from?.username || req.body?.callback_query?.from?.username || req.body?.username || null;
    if (validateTelegramId(id)) {
      req.telegramId = Number(id);
      req.telegramUsername = uname ? String(uname).replace(/^@/, '') : null;
      req.telegramVerified = true; // treat as verified because it comes from a trusted source
      return next();
    }
  }

  // Preferred path: verified Telegram WebApp initData sent via header.
  // Frontend should call: fetch(url, { headers: { 'X-Telegram-Init-Data': tg.initData } })
  const initData = req.headers['x-telegram-init-data'];
  const verifiedUser = verifyInitData(initData);

  if (verifiedUser && validateTelegramId(verifiedUser.id)) {
    req.telegramId = Number(verifiedUser.id);
    req.telegramUsername = verifiedUser.username || verifiedUser.first_name || null;
    req.telegramFirstName = verifiedUser.first_name || null;
    req.telegramVerified = true;
    return next();
  }

  // Legacy fallback (kept for backward compatibility while the frontend is
  // updated to send X-Telegram-Init-Data on every request).
  // NOTE: this path trusts client-supplied data and should be phased out.
  let telegramId = req.body.telegram_id || req.query.telegram_id || req.headers['x-telegram-id'];

  if (!validateTelegramId(telegramId)) {
    if (allowAnonymous && adminTelegramId) {
      console.warn('Allowing anonymous request: assigning adminTelegramId');
      telegramId = adminTelegramId;
    } else {
      return res.status(400).json({ success: false, error: 'Invalid telegram_id' });
    }
  }

  req.telegramId = Number(telegramId);
  req.telegramVerified = false;
  next();
}

module.exports = {
  requireTelegramId,
  verifyInitData
};
