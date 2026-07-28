const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseKey } = require('../config');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function getUser(telegramUserId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

async function upsertUser(telegramUserId, payload = {}) {
  const { data, error } = await supabase
    .from('users')
    .upsert({ telegram_user_id: telegramUserId, ...payload }, { onConflict: 'telegram_user_id' })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

async function updateUserFreeAdUsed(telegramUserId, freeAdUsed = true) {
  const { data, error } = await supabase
    .from('users')
    .update({ free_ad_used: freeAdUsed, last_action_at: new Date().toISOString() })
    .eq('telegram_user_id', telegramUserId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateUserLastActionAt(telegramUserId) {
  const { data, error } = await supabase
    .from('users')
    .update({ last_action_at: new Date().toISOString() })
    .eq('telegram_user_id', telegramUserId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function createAd(payload) {
  const { data, error } = await supabase
    .from('ads')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getAdsByUser(telegramUserId) {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function getAds({ limit = 20, category, location, withPhoto }) {
  let query = supabase.from('ads').select('*').order('created_at', { ascending: false }).limit(limit);

  if (category) query = query.eq('category', category);
  if (location) query = query.eq('location', location);
  if (withPhoto) query = query.not('img', 'is', null);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getAdById(adId) {
  const { data, error } = await supabase.from('ads').select('*').eq('id', adId).single();
  if (error) throw error;
  return data;
}

async function updateAdTelegramMessageId(adId, telegramMessageId) {
  const { data, error } = await supabase
    .from('ads')
    .update({ telegram_message_id: telegramMessageId })
    .eq('id', adId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateAdImageUrl(adId, imageUrl) {
  const { data, error } = await supabase
    .from('ads')
    .update({ img: imageUrl })
    .eq('id', adId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteAd(adId) {
  const { data, error } = await supabase.from('ads').delete().eq('id', adId).select();
  if (error) throw error;
  return data;
}

async function getExpiredAds() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .or(
      `and(is_paid.eq.false,created_at.lt.${new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()}),and(is_paid.eq.true,created_at.lt.${new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()})`
    );

  if (error) throw error;
  return data || [];
}

async function uploadPhoto({ telegramUserId, adId, fileName, fileBuffer }) {
  const bucket = 'ads-photos';
  const path = `user-${telegramUserId}/ad-${adId}/${fileName}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, fileBuffer, {
    contentType: 'image/jpeg',
    upsert: true
  });

  if (uploadError) throw uploadError;

  const { data: urlData, error: urlError } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  if (urlError) throw urlError;
  return urlData.publicUrl;
}

async function deletePhoto(photoPath) {
  if (!photoPath) return;
  const bucket = 'ads-photos';
  const normalized = photoPath.replace(/^https?:\/\//, '');
  const objPath = normalized.split(`/${bucket}/`)[1] || photoPath;
  await supabase.storage.from(bucket).remove([objPath]);
}

module.exports = {
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
  getExpiredAds,
  uploadPhoto,
  deletePhoto
};
