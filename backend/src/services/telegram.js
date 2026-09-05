const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { telegramBotToken, telegramChannelId, adminTelegramId } = require('../config');

const hasTelegram = !!telegramBotToken;
const apiBase = telegramBotToken ? `https://api.telegram.org/bot${telegramBotToken}` : null;

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildText(ad) {
  const tags = [ad.category, ad.location]
    .filter(Boolean)
    .map((value) => `#${String(value).toLowerCase().replace(/\s+/g, '_')}`)
    .join(' ');

  const lines = [escapeHtml(tags), escapeHtml(ad.description ? ad.description.trim() : '')];
  lines.push(`Місто: ${escapeHtml(ad.location || '')}`);
  if (ad.contacts) {
    lines.push(`Контакт: ${escapeHtml(ad.contacts)}`);
  }

  return lines.join('\n');
}

async function sendAdToChannel(ad, photoBuffer = null, photoFileName = 'photo.jpg') {
  if (!hasTelegram) {
    console.warn('TELEGRAM_BOT_TOKEN not configured — skipping real send. Returning fake message id.');
    return Date.now();
  }

  if (photoBuffer) {
    const form = new FormData();
    form.append('chat_id', telegramChannelId);
    form.append('caption', buildText(ad));
    form.append('parse_mode', 'HTML');
    form.append('photo', photoBuffer, {
      filename: photoFileName,
      contentType: photoFileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
    });

    const response = await axios.post(`${apiBase}/sendPhoto`, form, {
      headers: form.getHeaders()
    });
    return response.data.result.message_id;
  }

  if (ad.img && ad.img.startsWith('file://')) {
    const filePath = ad.img.replace('file://', '');
    const stream = fs.createReadStream(filePath);
    const form = new FormData();
    form.append('chat_id', telegramChannelId);
    form.append('caption', buildText(ad));
    form.append('parse_mode', 'HTML');
    form.append('photo', stream);

    const response = await axios.post(`${apiBase}/sendPhoto`, form, {
      headers: form.getHeaders()
    });
    return response.data.result.message_id;
  }

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
  if (!hasTelegram) {
    console.warn('TELEGRAM_BOT_TOKEN not configured — skipping deleteMessage');
    return;
  }

  try {
    await axios.post(`${apiBase}/deleteMessage`, {
      chat_id: telegramChannelId,
      message_id: messageId
    });
  } catch (error) {
    const description = error?.response?.data?.description || error?.message || '';
    const isIgnored = error?.response?.status === 400 && /message.*(not found|can'?t be deleted|identifier is not specified|chat not found|was deleted)/i.test(description);
    if (isIgnored) {
      console.warn(
        `deleteMessageFromChannel: Telegram rejected deletion (chat_id=${telegramChannelId}, message_id=${messageId}):`,
        description
      );
      return;
    }
    throw error;
  }
}

async function verifyTelegramChannelAccess() {
  if (!hasTelegram || !telegramChannelId) return;

  try {
    const meResponse = await axios.get(`${apiBase}/getMe`);
    const botId = meResponse.data.result.id;
    const memberResponse = await axios.get(`${apiBase}/getChatMember`, {
      params: { chat_id: telegramChannelId, user_id: botId }
    });
    const member = memberResponse.data.result;

    if (member.status !== 'administrator' || member.can_delete_messages !== true) {
      console.warn(
        'Telegram bot does not have permission to delete channel messages. ' +
        `status=${member.status}, can_delete_messages=${member.can_delete_messages === true}`
      );
      return false;
    }

    console.log('✓ Telegram bot can delete channel messages');
    return true;
  } catch (error) {
    const description = error?.response?.data?.description || error?.message || String(error);
    console.warn('Could not verify Telegram channel permissions:', description);
    return false;
  }
}

async function notifyAdmin(text) {
  if (!adminTelegramId) return;
  if (!hasTelegram) {
    console.warn('notifyAdmin: telegram not configured —', text);
    return;
  }
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
  verifyTelegramChannelAccess,
  notifyAdmin
};