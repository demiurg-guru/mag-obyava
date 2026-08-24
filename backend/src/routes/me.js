const express = require('express');
const router = express.Router();
const { requireTelegramId } = require('../middleware/auth');
const { getUser, upsertUser } = require('../services/supabase');

router.get('/', requireTelegramId, async (req, res, next) => {
  try {
    let user = await getUser(req.telegramId);

    // If this request came through verified Telegram initData, keep the
    // stored username in sync automatically (this is what makes the
    // username "just show up" in the DB without a separate manual step).
    if (req.telegramVerified && req.telegramUsername) {
      if (!user || user.username !== req.telegramUsername) {
        user = await upsertUser(req.telegramId, { username: req.telegramUsername });
      }
    }

    if (!user) return res.json({ success: true, user: null });

    // return only safe fields
    const safe = {
      telegram_user_id: user.telegram_user_id,
      username: user.username || null,
      phone: user.phone || user.phone_number || null,
      free_ad_used: !!user.free_ad_used
    };
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, user: safe });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
