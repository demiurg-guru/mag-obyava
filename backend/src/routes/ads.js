const express = require('express');
const router = express.Router();
const { requireTelegramId } = require('../middleware/auth');
const { validateDescription, validateCategory, validateLocation, normalizeContact } = require('../utils/validators');
const {
  getUser,
  upsertUser,
  updateUserFreeAdUsed,
  updateUserLastActionAt,
  createAd,
  getAdsByUser,
  getAds,
  getAdById,
  updateAdTelegramMessageId,
  updateAdImageUrl,
  deleteAd,
  uploadPhoto,
  deletePhoto
} = require('../services/supabase');
const { sendAdToChannel, deleteMessageFromChannel, notifyAdmin } = require('../services/telegram');

router.get('/', async (req, res, next) => {
  try {
    const { user_id, category, location, with_photo } = req.query;
    if (user_id) {
      const ads = await getAdsByUser(Number(user_id));
      return res.json({ success: true, ads });
    }
    const ads = await getAds({
      limit: 20,
      category: category || undefined,
      location: location || undefined,
      withPhoto: with_photo === 'true'
    });
    res.json({ success: true, ads });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const ad = await getAdById(Number(req.params.id));
    if (!ad) {
      return res.status(404).json({ success: false, error: 'Ad not found' });
    }
    res.json({ success: true, ad });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireTelegramId, async (req, res, next) => {
  try {
    const telegramId = req.telegramId;
    const {
      username,
      category,
      location,
      description,
      contacts,
      is_paid = false
    } = req.body;

    if (!validateCategory(category)) {
      return res.status(400).json({ success: false, error: 'Invalid category' });
    }
    if (!validateLocation(location)) {
      return res.status(400).json({ success: false, error: 'Invalid location' });
    }
    if (!validateDescription(description)) {
      return res.status(400).json({ success: false, error: 'Description must be 1-666 characters' });
    }

    let user = await getUser(telegramId);
    if (!user) {
      user = await upsertUser(telegramId, { free_ad_used: false });
    }

    const freeAd = !JSON.parse(String(is_paid).toLowerCase());
    if (freeAd && user.free_ad_used) {
      return res.status(403).json({ success: false, error: 'Free ad already used' });
    }

    await updateUserLastActionAt(telegramId);

    const imageData = req.body.photo_base64 || null;
    const file = req.file;

    const adPayload = {
      telegram_user_id: telegramId,
      category,
      location,
      description: description.trim(),
      contacts: normalizeContact(contacts || username || ''),
      is_paid: !freeAd,
      created_at: new Date().toISOString()
    };

    const ad = await createAd(adPayload);
    let imageUrl = null;

    if (imageData || file) {
      const buffer = file ? file.buffer : Buffer.from(imageData, 'base64');
      const extension = file ? (file.originalname.split('.').pop() || 'jpg') : 'jpg';
      const photoFileName = `photo.${extension}`;
      imageUrl = await uploadPhoto({
        telegramUserId: telegramId,
        adId: ad.id,
        fileName: photoFileName,
        fileBuffer: buffer
      });
      await updateAdImageUrl(ad.id, imageUrl);
    }

    const adWithImage = { ...ad, img: imageUrl };
    const messageId = await sendAdToChannel(adWithImage);

    await updateAdTelegramMessageId(ad.id, messageId);
    if (freeAd) {
      await updateUserFreeAdUsed(telegramId, true);
    }

    const telegramLink = `https://t.me/${String(process.env.TELEGRAM_CHANNEL_ID).replace(/^@/, '')}/${messageId}`;
    res.json({ success: true, ad_id: ad.id, telegram_link: telegramLink });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireTelegramId, async (req, res, next) => {
  try {
    const telegramId = req.telegramId;
    const adId = Number(req.params.id);
    const ad = await getAdById(adId);
    if (!ad) {
      return res.status(404).json({ success: false, error: 'Ad not found' });
    }
    if (ad.telegram_user_id !== telegramId) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this ad' });
    }

    await deleteMessageFromChannel(ad.telegram_message_id);
    await deletePhoto(ad.img);
    await deleteAd(adId);

    res.json({ success: true, message: 'Ad deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
