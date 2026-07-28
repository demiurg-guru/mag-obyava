const { cronIntervalMs } = require('../config');
const { getExpiredAds, deleteAd } = require('./supabase');
const { deleteMessageFromChannel, notifyAdmin } = require('./telegram');
const { deletePhoto } = require('./supabase');

async function removeExpiredAds() {
  try {
    const expiredAds = await getExpiredAds();
    if (!expiredAds.length) {
      return;
    }

    for (const ad of expiredAds) {
      try {
        await deleteMessageFromChannel(ad.telegram_message_id);
        await deletePhoto(ad.img);
        await deleteAd(ad.id);
      } catch (error) {
        console.error('Failed to remove expired ad', ad.id, error.message);
        await notifyAdmin(`Failed to remove expired ad id=${ad.id}: ${error.message}`);
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
