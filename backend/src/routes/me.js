const express = require('express');
const router = express.Router();
const { requireTelegramId } = require('../middleware/auth');
const { getUser } = require('../services/supabase');

router.get('/', requireTelegramId, async (req, res, next) => {
  try {
    const user = await getUser(req.telegramId);
    if (!user) return res.json({ success: true, user: null });
    // return only safe fields
    const safe = {
      telegram_user_id: user.telegram_user_id,
      username: user.username || null,
      phone: user.phone || user.phone_number || null,
      free_ad_used: !!user.free_ad_used
    };
    res.json({ success: true, user: safe });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
