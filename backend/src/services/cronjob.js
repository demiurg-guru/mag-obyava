const { cronIntervalMs } = require('../config');
const { getExpiredAds, deleteAd, deletePhoto, countUserAds, updateUserAdsCount, resetUserFreeAdFlag } = require('./supabase');
const { deleteMessageFromChannel, notifyAdmin } = require('./telegram');

async function removeExpiredAds() {
  try {
    const expiredAds = await getExpiredAds();
    if (!expiredAds.length) {
      return;
    }

    for (const ad of expiredAds) {
      // Delete telegram message — non-fatal
      try {
        await deleteMessageFromChannel(ad.telegram_message_id);
      } catch (err) {
        const details = err?.response?.data?.description || err?.message || String(err);
        console.warn('deleteMessageFromChannel failed (non-fatal) for ad', ad.id, details);
        await notifyAdmin(`Warning: failed to delete telegram message for ad id=${ad.id}: ${details}`);
      }

      // Delete stored photo — non-fatal
      try {
        await deletePhoto(ad.img);
      } catch (err) {
        const details = err?.response?.data?.message || err?.message || String(err);
        console.warn('deletePhoto failed (non-fatal) for ad', ad.id, details);
        await notifyAdmin(`Warning: failed to delete photo for ad id=${ad.id}: ${details}`);
      }

      // Finally, remove ad record from DB — report if this fails
      try {
        await deleteAd(ad.id);
        
        // Обновляем счетчик объявлений юзера
        const newCount = await countUserAds(ad.telegram_user_id);
        await updateUserAdsCount(ad.telegram_user_id, newCount);
        
        // Если это было БЕСПЛАТНОЕ объявление - сбрасываем флаг
        if (!ad.is_paid) {
          await resetUserFreeAdFlag(ad.telegram_user_id);
          await notifyAdmin(`✅ Юзер ${ad.telegram_user_id} может создавать новое free ad`);
        }
        
        // Успешное удаление репортим админу
        const tariff = ad.is_paid ? 'платне, 21 день' : 'безкоштовне, 5 дней';
        await notifyAdmin(
          `🗑 Оголошення #${ad.id} видалено (просрочено, ${tariff})\n` +
          `Категорія: ${ad.category || '-'}\n` +
          `Локація: ${ad.location || '-'}`
        );
      } catch (err) {
        const details = err?.response?.data?.message || err?.message || String(err);
        console.error('Failed to delete ad record', ad.id, details);
        await notifyAdmin(`Failed to remove expired ad id=${ad.id}: ${details}`);
      }
    }
  } catch (error) {
    console.error('Cronjob failed', error.message);
    await notifyAdmin(`Cronjob failed: ${error.message}`);
  }
}

function startCronjob() {
  console.log(`Starting cronjob, interval=${cronIntervalMs}ms`);
  removeExpiredAds();
  setInterval(removeExpiredAds, cronIntervalMs);
}

module.exports = {
  startCronjob,
  removeExpiredAds
};