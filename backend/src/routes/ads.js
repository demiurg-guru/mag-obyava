const express = require('express');
const router = express.Router();
const { requireTelegramId } = require('../middleware/auth');
const { telegramChannelId } = require('../config');
const { validateDescription, validateCategory, validateLocation, validateContact, normalizeContact } = require('../utils/validators');
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

const POST_RATE_LIMIT_WINDOW = 1000 * 60 * 60; // 1 hour
const MAX_POSTS_PER_HOUR = 10;
const MIN_POST_INTERVAL = 30 * 1000; // 30 seconds
const postLimitState = new Map();

function imageTypeFromBuffer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9) {
    return 'jpeg';
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'png';
  }
  if (buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP') {
    return 'webp';
  }
  return null;
}

function decodeBase64Image(base64String) {
  if (typeof base64String !== 'string') return null;
  const cleaned = base64String.replace(/^data:image\/[a-z]+;base64,/, '').trim();
  try {
    return Buffer.from(cleaned, 'base64');
  } catch (error) {
    return null;
  }
}

function assertUploadAllowed(telegramId) {
  const now = Date.now();
  const state = postLimitState.get(telegramId) || { count: 0, windowStart: now, lastPostAt: 0 };
  if (now - state.windowStart > POST_RATE_LIMIT_WINDOW) {
    state.count = 0;
    state.windowStart = now;
  }
  if (state.count >= MAX_POSTS_PER_HOUR) {
    throw { status: 429, message: 'Too many requests. Please wait before posting again.' };
  }
  if (state.lastPostAt && now - state.lastPostAt < MIN_POST_INTERVAL) {
    throw { status: 429, message: 'Please wait before submitting another ad.' };
  }
  state.count += 1;
  state.lastPostAt = now;
  postLimitState.set(telegramId, state);
}

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
    assertUploadAllowed(telegramId);

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

    const normalizedContact = normalizeContact(contacts || '');
    let normalizedUsername = username ? username.replace(/^@/, '') : null;
    if (!normalizedUsername && typeof contacts === 'string' && contacts.trim().startsWith('@')) {
      normalizedUsername = contacts.trim().replace(/^@/, '');
    }
    const normalizedContactOrUsername = normalizeContact(contacts || username || '');
    if (!validateContact(normalizedContactOrUsername)) {
      return res.status(400).json({ success: false, error: 'Invalid contact information' });
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
    console.log('DEBUG /api/ads received file:', !!file, file ? file.originalname : null, 'body keys:', Object.keys(req.body));

    if (file) {
      const detectedType = imageTypeFromBuffer(file.buffer);
      if (!detectedType) {
        return res.status(400).json({ success: false, error: 'Unsupported image format' });
      }
    }

    let imageBuffer = null;
    if (imageData) {
      imageBuffer = decodeBase64Image(imageData);
      if (!imageBuffer) {
        return res.status(400).json({ success: false, error: 'Invalid image data' });
      }
      const detectedType = imageTypeFromBuffer(imageBuffer);
      if (!detectedType) {
        return res.status(400).json({ success: false, error: 'Unsupported image format' });
      }
      if (imageBuffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: 'Image too large' });
      }
    }

    const adPayload = {
      telegram_user_id: telegramId,
      category,
      location,
      description: description.trim(),
      contacts: normalizedContact,
      username: normalizedUsername,
      is_paid: !freeAd,
      created_at: new Date().toISOString()
    };

    const ad = await createAd(adPayload);
    let imageUrl = null;
    let photoFileName = 'photo.jpg';

    if (imageData || file) {
      if (!imageBuffer) {
        imageBuffer = file ? file.buffer : decodeBase64Image(imageData);
      }
      const extension = file ? (file.originalname.split('.').pop() || 'jpg') : 'jpg';
      photoFileName = `photo.${extension}`;
      console.log('DEBUG imageBuffer set', !!imageBuffer, 'photoFileName', photoFileName);
      imageUrl = await uploadPhoto({
        telegramUserId: telegramId,
        adId: ad.id,
        fileName: photoFileName,
        fileBuffer: imageBuffer
      });
      console.log('DEBUG uploaded image URL', imageUrl);
      await updateAdImageUrl(ad.id, imageUrl);
    }

    const adWithImage = { ...ad, img: imageUrl };
    console.log('DEBUG sendAdToChannel called with photoBuffer', !!imageBuffer, 'img', imageUrl);
    const messageId = await sendAdToChannel(adWithImage, imageBuffer, photoFileName);

    await updateAdTelegramMessageId(ad.id, messageId);
    if (freeAd) {
      await updateUserFreeAdUsed(telegramId, true);
    }

    // Public t.me links only work for channels with a public @username.
    // A numeric chat_id (e.g. "-1001234567890") has no public link, so we
    // skip building one rather than returning a broken URL.
    const channelHandle = String(telegramChannelId || '').replace(/^@/, '');
    const telegramLink = /^-?\d+$/.test(channelHandle)
      ? null
      : `https://t.me/${channelHandle}/${messageId}`;
    // fetch final ad record (with img and telegram_message_id) and return it to client
    const finalAd = await getAdById(ad.id);
    res.json({ success: true, ad: finalAd, ad_id: ad.id, telegram_link: telegramLink });
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
