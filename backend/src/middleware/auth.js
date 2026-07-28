const { validateTelegramId } = require('../utils/validators');
const { allowAnonymous, adminTelegramId } = require('../config');

function requireTelegramId(req, res, next) {
  let telegramId = req.body.telegram_id || req.query.telegram_id || req.headers['x-telegram-id'];

  if (!validateTelegramId(telegramId)) {
    if (allowAnonymous && adminTelegramId) {
      // allow anonymous requests in test mode: use admin id as owner
      console.warn('Allowing anonymous request: assigning adminTelegramId');
      telegramId = adminTelegramId;
    } else {
      return res.status(400).json({ success: false, error: 'Invalid telegram_id' });
    }
  }

  req.telegramId = Number(telegramId);
  next();
}

module.exports = {
  requireTelegramId
};
