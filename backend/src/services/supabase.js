const { supabaseUrl, supabaseKey } = require('../config');
const fs = require('fs');
const path = require('path');
let usingMock = false;
let supabase;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not provided — using file-backed mock storage for testing');
  usingMock = true;

  const storageDir = path.join(__dirname, '..', '..', 'tmp');
  const storageFile = path.join(storageDir, 'mock-storage.json');
  try { fs.mkdirSync(storageDir, { recursive: true }); } catch (e) {}

  let persistedState = { users: [], ads: [] };
  try {
    if (fs.existsSync(storageFile)) {
      const raw = fs.readFileSync(storageFile, 'utf8');
      if (raw) persistedState = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load mock storage from disk:', e.message);
  }

  const users = new Map((persistedState.users || []).map((u) => [u.telegram_user_id, u]));
  const ads = new Map((persistedState.ads || []).map((a) => [a.id, a]));
  let adIdCounter = 1 + (persistedState.ads || []).reduce((max, ad) => Math.max(max, Number(ad.id) || 0), 0);

  function persistState() {
    try {
      fs.writeFileSync(storageFile, JSON.stringify({ users: Array.from(users.values()), ads: Array.from(ads.values()) }, null, 2));
    } catch (e) {
      console.warn('Failed to persist mock storage to disk:', e.message);
    }
  }

  supabase = {
    async getUserRaw(telegram_user_id) {
      for (const u of users.values()) {
        if (u.telegram_user_id === telegram_user_id) return { data: u };
      }
      return { data: null };
    }
  };

  async function getUser(telegramUserId) {
    for (const u of users.values()) {
      if (u.telegram_user_id === telegramUserId) return u;
    }
    return null;
  }

  async function upsertUser(telegramUserId, payload = {}) {
    let user = await getUser(telegramUserId);
    if (!user) {
      user = { telegram_user_id: telegramUserId, created_at: new Date().toISOString(), free_ad_used: !!payload.free_ad_used, resume_url: payload.resume_url || null, last_action_at: payload.last_action_at || null };
      users.set(telegramUserId, user);
    } else {
      Object.assign(user, payload);
      users.set(telegramUserId, user);
    }
    persistState();
    return user;
  }

  // Attempt to set free_ad_used atomically in the mock: if it's already true, return null
  async function trySetUserFreeAdUsed(telegramUserId, freeAdUsed = true) {
    let user = await getUser(telegramUserId);
    if (!user) {
      user = await upsertUser(telegramUserId, { free_ad_used: false });
    }
    if (user.free_ad_used) {
      return null; // already used
    }
    user.free_ad_used = freeAdUsed;
    user.last_action_at = new Date().toISOString();
    users.set(telegramUserId, user);
    persistState();
    return user;
  }

  async function updateUserFreeAdUsed(telegramUserId, freeAdUsed = true) {
    const user = await upsertUser(telegramUserId, {});
    user.free_ad_used = freeAdUsed;
    user.last_action_at = new Date().toISOString();
    users.set(telegramUserId, user);
    persistState();
    return user;
  }

  async function updateUserLastActionAt(telegramUserId) {
    const user = await upsertUser(telegramUserId, {});
    user.last_action_at = new Date().toISOString();
    users.set(telegramUserId, user);
    persistState();
    return user;
  }

  async function createAd(payload) {
    const id = adIdCounter++;
    const now = new Date().toISOString();
    const record = { id, ...payload, created_at: payload.created_at || now, telegram_message_id: null, img: payload.img || null };
    ads.set(id, record);
    persistState();
    return record;
  }

  async function getAdsByUser(telegramUserId) {
    const out = [];
    for (const a of Array.from(ads.values()).sort((x,y)=> new Date(y.created_at)-new Date(x.created_at))) {
      if (a.telegram_user_id === telegramUserId) out.push(a);
    }
    return out;
  }

  async function getAds({ limit = 20, category, location, withPhoto }) {
    let list = Array.from(ads.values()).sort((a,b)=> new Date(b.created_at)-new Date(a.created_at));
    if (category) list = list.filter(a=>a.category===category);
    if (location) list = list.filter(a=>a.location===location);
    if (withPhoto) list = list.filter(a=>!!a.img);
    return list.slice(0, limit);
  }

  async function getAdById(adId) {
    return ads.get(adId) || null;
  }

  async function updateAdTelegramMessageId(adId, telegramMessageId) {
    const ad = ads.get(adId);
    if (!ad) throw new Error('Ad not found');
    ad.telegram_message_id = telegramMessageId;
    ads.set(adId, ad);
    persistState();
    return ad;
  }

  async function updateAdImageUrl(adId, imageUrl) {
    const ad = ads.get(adId);
    if (!ad) throw new Error('Ad not found');
    ad.img = imageUrl;
    ads.set(adId, ad);
    persistState();
    return ad;
  }

  async function deleteAd(adId) {
    const ad = ads.get(adId);
    ads.delete(adId);
    persistState();
    return ad ? [ad] : [];
  }

  async function getExpiredAds() {
    const expired = [];
    const now = Date.now();
    for (const a of ads.values()) {
      const created = new Date(a.created_at).getTime();
      const ageDays = (now - created) / (1000*60*60*24);
      if ((!a.is_paid && ageDays >= 5) || (a.is_paid && ageDays >= 21)) expired.push(a);
    }
    return expired;
  }

  async function uploadPhoto({ telegramUserId, adId, fileName, fileBuffer }) {
    const dir = path.join(storageDir, `user-${telegramUserId}`);
    try { fs.mkdirSync(dir, { recursive: true }); } catch(e){}
    const filePath = path.join(dir, `${adId}-${fileName}`);
    fs.writeFileSync(filePath, fileBuffer);
    return `file://${filePath}`;
  }

  async function deletePhoto(photoPath) {
    if (!photoPath) return;
    if (!photoPath.startsWith('file://')) return;
    const p = photoPath.replace('file://','');
    try { fs.unlinkSync(p); } catch(e){}
  }

  module.exports = {
    getUser,
    upsertUser,
    trySetUserFreeAdUsed,
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

} else {
  const { createClient } = require('@supabase/supabase-js');
  const supabaseClient = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  async function getUser(telegramUserId) {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('telegram_user_id', telegramUserId)
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  async function upsertUser(telegramUserId, payload = {}) {
    const { data, error } = await supabaseClient
      .from('users')
      .upsert({ telegram_user_id: telegramUserId, ...payload }, { onConflict: 'telegram_user_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Attempt to set free_ad_used = true only if it was false. Returns the updated user or null if the flag was already true.
  async function trySetUserFreeAdUsed(telegramUserId, freeAdUsed = true) {
    // conditional update: only update rows where free_ad_used is false
    const { data, error } = await supabaseClient
      .from('users')
      .update({ free_ad_used: freeAdUsed, last_action_at: new Date().toISOString() })
      .eq('telegram_user_id', telegramUserId)
      .eq('free_ad_used', false)
      .select()
      .single();
    if (error && error.code !== 'PGRST116') throw error; // ignore no rows matched as error
    return data || null;
  }

  async function updateUserFreeAdUsed(telegramUserId, freeAdUsed = true) {
    const { data, error } = await supabaseClient
      .from('users')
      .update({ free_ad_used: freeAdUsed, last_action_at: new Date().toISOString() })
      .eq('telegram_user_id', telegramUserId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateUserLastActionAt(telegramUserId) {
    const { data, error } = await supabaseClient
      .from('users')
      .update({ last_action_at: new Date().toISOString() })
      .eq('telegram_user_id', telegramUserId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function createAd(payload) {
    const { data, error } = await supabaseClient
      .from('ads')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function getAdsByUser(telegramUserId) {
    const { data, error } = await supabaseClient
      .from('ads')
      .select('*')
      .eq('telegram_user_id', telegramUserId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function getAds({ limit = 20, category, location, withPhoto }) {
    let query = supabaseClient.from('ads').select('*').order('created_at', { ascending: false }).limit(limit);
    if (category) query = query.eq('category', category);
    if (location) query = query.eq('location', location);
    if (withPhoto) query = query.not('img', 'is', null);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async function getAdById(adId) {
    const { data, error } = await supabaseClient.from('ads').select('*').eq('id', adId).single();
    if (error) throw error;
    return data;
  }

  async function updateAdTelegramMessageId(adId, telegramMessageId) {
    const { data, error } = await supabaseClient
      .from('ads')
      .update({ telegram_message_id: telegramMessageId })
      .eq('id', adId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateAdImageUrl(adId, imageUrl) {
    const { data, error } = await supabaseClient
      .from('ads')
      .update({ img: imageUrl })
      .eq('id', adId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function deleteAd(adId) {
    const { data, error } = await supabaseClient.from('ads').delete().eq('id', adId).select();
    if (error) throw error;
    return data;
  }

  async function getExpiredAds() {
    const now = new Date().toISOString();
    const { data, error } = await supabaseClient
      .from('ads')
      .select('*')
      .or(
        `and(is_paid.eq.false,created_at.lt.${new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()}),and(is_paid.eq.true,created_at.lt.${new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()})`
      );
    if (error) throw error;
    return data || [];
  }

  async function ensureBucketExists(bucket) {
    const { data: bucketData, error: bucketError } = await supabaseClient.storage.getBucket(bucket);
    if (bucketError) {
      // Supabase storage returns a 404 when a bucket does not exist.
      if (bucketError.status === 404 || String(bucketError.message).includes('Bucket not found')) {
        const { error: createError } = await supabaseClient.storage.createBucket(bucket, { public: true });
        if (createError) throw createError;
        return;
      }
      throw bucketError;
    }
    return bucketData;
  }

  async function uploadPhoto({ telegramUserId, adId, fileName, fileBuffer }) {
    const bucket = 'ads-photos';
    await ensureBucketExists(bucket);

    const path = `user-${telegramUserId}/ad-${adId}/${fileName}`;
    const ext = fileName.split('.').pop().toLowerCase();
    const contentType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
    const { error: uploadError } = await supabaseClient.storage.from(bucket).upload(path, fileBuffer, {
      contentType,
      upsert: true
    });
    if (uploadError) throw uploadError;
    const { data: urlData, error: urlError } = await supabaseClient.storage
      .from(bucket)
      .getPublicUrl(path);
    if (urlError) throw urlError;
    return urlData.publicUrl;
  }

  async function deletePhoto(photoPath) {
    if (!photoPath) return;
    const bucket = 'ads-photos';
    let objPath = photoPath;

    if (photoPath.startsWith('http')) {
      const normalized = photoPath.replace(/^https?:\/\//, '');
      objPath = normalized.split(`/${bucket}/`)[1];
      if (!objPath) {
        console.warn('deletePhoto: unsupported photoPath format', photoPath);
        return;
      }
    }

    const { error } = await supabaseClient.storage.from(bucket).remove([objPath]);
    if (error && error.status !== 404) {
      throw error;
    }
  }

  module.exports = {
    getUser,
    upsertUser,
    trySetUserFreeAdUsed,
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
}
