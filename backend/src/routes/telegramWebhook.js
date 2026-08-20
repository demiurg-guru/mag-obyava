const express = require('express');
const router = express.Router();
const { upsertUser } = require('../services/supabase');

// Telegram sends updates here (register with setWebhook — see README).
// Handles the 'contact' message type, produced by tg.requestContact() on the
// frontend: the phone number arrives as a normal message to the bot, not via
// the Mini App JS API, so it has to be captured server-side like this.
router.post('/', async (req, res) => {
  try {
    const update = req.body || {};
    const msg = update.message;

    if (msg && msg.contact && msg.from) {
      const telegramId = Number(msg.from.id);
      const contactUserId = msg.contact.user_id ? Number(msg.contact.user_id) : null;
      let phone = String(msg.contact.phone_number || '').trim();
      if (phone && !phone.startsWith('+')) {
        phone = '+' + phone;
      }

      // Accept if contactUserId matches telegramId OR if contactUserId is absent
      if (!contactUserId || contactUserId === telegramId) {
        if (telegramId && phone) {
          await upsertUser(telegramId, {
            phone,
            username: msg.from.username || null
          });
        }
      }
    }

    // Telegram requires a fast 200 response regardless of what we did with it.
    res.sendStatus(200);
  } catch (error) {
    console.error('telegramWebhook error:', error.message);
    res.sendStatus(200); // still ack — Telegram retries aggressively on non-200
  }
});

module.exports = router;
