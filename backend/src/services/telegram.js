const axios = require('axios');
const { telegramBotToken, telegramChannelId, adminTelegramId } = require('../config');

const apiBase = `https://api.telegram.org/bot${telegramBotToken}`;

function buildText(ad) {
  const tags = [ad.category, ad.location]
    .filter(Boolean)
    .map((value) => `#${String(value).toLowerCase().replace(/\s+/g, '_')}`)
    .join(' ');

  const lines = [tags, ad.description.trim()];
  lines.push(`Місто: ${ad.location}`);
  if (ad.contacts) {
    lines.push(`Контакт: ${ad.contacts}`);
  }

  return lines.join('\n');
}

async function sendAdToChannel(ad) {
  if (ad.img) {
    const response = await axios.post(`${apiBase}/sendPhoto`, {
      chat_id: telegramChannelId,
      photo: ad.img,
      caption: buildText(ad),
      parse_mode: 'HTML'
    });
    return response.data.result.message_id;
  }

  const response = await axios.post(`${apiBase}/sendMessage`, {
    chat_id: telegramChannelId,
    text: buildText(ad),
    parse_mode: 'HTML'
  });
  return response.data.result.message_id;
}

async function deleteMessageFromChannel(messageId) {
  if (!messageId) return;
  await axios.post(`${apiBase}/deleteMessage`, {
    chat_id: telegramChannelId,
    message_id: messageId
  });
}

async function notifyAdmin(text) {
  if (!adminTelegramId) return;
  try {
    await axios.post(`${apiBase}/sendMessage`, {
      chat_id: adminTelegramId,
      text,
      parse_mode: 'HTML'
    });
  } catch (error) {
    console.error('Failed to notify admin:', error?.response?.data || error.message);
  }
}

module.exports = {
  sendAdToChannel,
  deleteMessageFromChannel,
  notifyAdmin
};
