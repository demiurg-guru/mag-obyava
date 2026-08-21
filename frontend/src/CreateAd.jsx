import { useEffect, useState } from 'react';
import styles from './CreateAd.module.css';

const categories = ['Транспорт','Послуги','Робота','Нерухомість','Товари інше','Будівництво','Сільгосп','Електроніка','Меблі','Одяг/Взуття'];
// const locations = ['Магдалинівка','Спаське','Підгородне','Котовка'];
const locations = ['Магдалинівка', 'Приорільське', 'Олександрівка', 'Бузівка', 'Великокозирщина', 'Веселе', 'Веселий Гай', 'Виноградівка', 'Вишневе', 'Водяне', 'Гавришівка', 'Грабки', 'Гупалівка', 'Деконка', 'Дмухайлівка', 'Дубравка', 'Дудківка', 'Євдокиївка', 'Жданівка', 'Заплавка', 'Запоріжжя', 'Зоряне', 'Іванівка', 'Йосипівка', 'Казначеївка', 'Калинівка', 'Кільчень', 'Колпаківка', 'Котовка', 'Крамарка', 'Краснопілля', 'Кременівка', 'Личкове', 'Малоандріївка', "Мар'ївка", 'Минівка', 'Мусієнкове', 'Нововасилівка', 'Новоіванівка', 'Новопетрівка', 'Новоспаське', 'Оленівка', 'Очеретувате', 'Першотравенка', 'Поливанівка', 'Почино-Софіївка', 'Приют', 'Січкарівка', 'Степанівка', 'Тарасівка', 'Тарасо-Шевченківка', 'Топчине', 'Трудолюбівка', 'Чернеччина', 'Шевське', 'Шевченківка'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function parseTelegramInitDataUser(initData) {
  if (!initData || typeof initData !== 'string') return null;
  try {
    const params = new URLSearchParams(initData);
    const rawUser = params.get('user');
    if (!rawUser) return null;
    const parsed = JSON.parse(rawUser);
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
}

export default function CreateAd({ onClose, onSubmit, currentUser, telegramUser, initData }) {
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contacts, setContacts] = useState('');
  const [photo, setPhoto] = useState(null);
  const [contactStatus, setContactStatus] = useState('loading');
  const [manualContact, setManualContact] = useState('');
  const [askPhone, setAskPhone] = useState(false);
  const [shareContactSupported, setShareContactSupported] = useState(false);
  const [sharingPhone, setSharingPhone] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoStatus, setPhotoStatus] = useState('');

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) {
      setPhoto(null);
      setPhotoError('');
      setPhotoStatus('');
      return;
    }

    if (f.size > MAX_IMAGE_SIZE) {
      setPhoto(null);
      setPhotoError('Файл занадто великий. Максимальний розмір — 5 МБ.');
      setPhotoStatus('');
      e.target.value = '';
      return;
    }

    const sizeMb = (f.size / (1024 * 1024)).toFixed(2);
    setPhoto(f);
    setPhotoError('');
    setPhotoStatus(`Фото готове: ${sizeMb} МБ`);
  }
async function refreshContact(telegramUserId, options = {}) {
  const effectiveId = telegramUserId || parseTelegramInitDataUser(initData)?.id;
  if (!effectiveId) {
    setContacts('');
    setContactStatus('missing');
    setAskPhone(true);
    setShareContactSupported(typeof window !== 'undefined' && typeof window.Telegram?.WebApp?.requestContact === 'function');
    return null;
  }
  
  setContactStatus('loading');
  const headers = { 'x-telegram-id': String(effectiveId) };
  if (initData) headers['X-Telegram-Init-Data'] = initData;
  
  const shareSupported = typeof window !== 'undefined' && typeof window.Telegram?.WebApp?.requestContact === 'function';
  setShareContactSupported(shareSupported);
  
  try {
    const res = await fetch(`${API_BASE}/api/me`, { headers });
    const data = await res.json().catch(() => null);
    const user = data?.user;
    const phone = user?.phone || currentUser?.phone || '';
    const username = user?.username || currentUser?.username || '';
    
    if (phone) {
      const cleanDigits = phone.replace(/\D/g, '').slice(0, 15);
      setContacts(phone);
      setManualContact(cleanDigits || phone);
      setContactStatus('phone');
      setAskPhone(false);
      return phone;
    } else if (username && !options.expectingPhone) {
      setContacts('');
      setContactStatus('username');
      setAskPhone(true);
      return null;
    } else {
      if (!options.expectingPhone) {
        setContacts('');
        setContactStatus('missing');
        setAskPhone(true);
      }
      return null;
    }
  } catch (e) {
    if (!options.expectingPhone) {
      setContacts('');
      setContactStatus('missing');
      setAskPhone(true);
    }
    setShareContactSupported(shareSupported);
    return null;
  }
}

function handleRequestContact() {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.requestContact) {
    return;
  }

  const effectiveId = currentUser?.telegram_user_id || parseTelegramInitDataUser(initData)?.id;

  setSharingPhone(true);
  try {
    window.Telegram.WebApp.requestContact(async (shared) => {
      if (!shared) {
        setSharingPhone(false);
        setContactStatus('missing');
        setAskPhone(true);
        return;
      }

      setContactStatus('loading');
      let fetchedPhone = null;
      const maxAttempts = 20; // 20 attempts * 500ms = 10 seconds total

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 500));
        }
        
        fetchedPhone = await refreshContact(effectiveId, { expectingPhone: true });
        
        if (fetchedPhone) {
          break;
        }
      }

      setSharingPhone(false);
      
      if (!fetchedPhone) {
        setAskPhone(true);
        setContactStatus('missing');
      }
    });
  } catch (error) {
    setSharingPhone(false);
    setContactStatus('missing');
    setAskPhone(true);
    console.error('requestContact failed', error);
    alert('Не вдалося запросити номер. Спробуйте ще раз.');
  }
}

  async function loadContact() {
    if (!currentUser?.telegram_user_id) {
      setContacts('');
      setContactStatus('missing');
      setShareContactSupported(typeof window !== 'undefined' && typeof window.Telegram?.WebApp?.requestContact === 'function');
      return;
    }

    setContactStatus('loading');
    await refreshContact(currentUser.telegram_user_id);
  }

  useEffect(() => {
    let cancelled = false;

    async function initContact() {
      if (!currentUser?.telegram_user_id) {
        if (!cancelled) {
          setContacts('');
          setContactStatus('missing');
          setShareContactSupported(typeof window !== 'undefined' && typeof window.Telegram?.WebApp?.requestContact === 'function');
        }
        return;
      }

      if (!cancelled) {
        setContactStatus('loading');
      }

      await refreshContact(currentUser.telegram_user_id);
    }

    initContact();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.telegram_user_id]);

  function getDisplayName() {
    // Priority: currentUser -> telegramUser -> initData -> first_name fallback
    const direct = currentUser?.username || telegramUser?.username || currentUser?.first_name || telegramUser?.first_name;
    if (direct) return String(direct).replace(/^@/, '');
    
    // Last resort: try to extract from initData directly
    const initDataUser = parseTelegramInitDataUser(initData);
    if (initDataUser?.username) return String(initDataUser.username).replace(/^@/, '');
    if (initDataUser?.first_name) return String(initDataUser.first_name).replace(/^@/, '');
    
    return '';
  }

  function getDisplayTag() {
    const name = getDisplayName();
    return name ? `@${name}` : '';
  }

  function getSafeDisplayLabel() {
    const name = getDisplayName();
    if (name) return `@${name}`;
    // Fallback: never show literal 'noname' or 'user', try to get first_name
    const firstName = currentUser?.first_name || telegramUser?.first_name;
    if (firstName) return `@${String(firstName).replace(/^@/, '')}`;
    // Last resort: extract from initData
    const initDataUser = parseTelegramInitDataUser(initData);
    if (initDataUser?.first_name) return `@${String(initDataUser.first_name).replace(/^@/, '')}`;
    if (initDataUser?.username) return `@${String(initDataUser.username).replace(/^@/, '')}`;
    return 'noname';
  }

  function submit(e) {
    e.preventDefault();
    if (photo && photo.size > MAX_IMAGE_SIZE) {
      setPhotoError('Файл занадто великий. Максимальний розмір — 5 МБ.');
      return;
    }
    if (!description.trim()) return alert('Введіть опис оголошення');

    const enteredLocation = customLocation.trim();
    const locationValue = location === 'other' ? enteredLocation : (location || enteredLocation);
    if (!locationValue) return alert('Введіть населений пункт');

    const finalContact = manualContact.trim() || contacts;
    const finalUsername = getDisplayName();

    if (!finalContact) {
      return alert('Будь ласка, введіть номер телефону для контакту');
    }

    onSubmit({
      category,
      location: locationValue,
      description,
      contacts: finalContact,
      username: finalUsername,
      photo,
      is_paid: false
    });
  }

  const resolvedDisplayName = getDisplayName();
  const resolvedDisplayTag = getDisplayTag();
  const safeDisplayLabel = getSafeDisplayLabel();
  
  // If form has no username at all, fetch it from API on mount
  const [serverUsernameLoaded, setServerUsernameLoaded] = useState(false);
  useEffect(() => {
    if (serverUsernameLoaded || resolvedDisplayName) return;
    
    // Only fetch if we have a telegram ID but no username yet
    const initDataUser = parseTelegramInitDataUser(initData);
    if (!initDataUser?.id) return;
    
    const headers = { 'x-telegram-id': String(initDataUser.id) };
    if (initData) headers['X-Telegram-Init-Data'] = initData;
    
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/me`, { headers });
        const data = await res.json().catch(() => null);
        if (data?.user?.username) {
          // Username will be picked up by getDisplayName on next render
        }
      } catch (e) {
        console.warn('Failed to preload username:', e);
      } finally {
        setServerUsernameLoaded(true);
      }
    })();
  }, [initData, serverUsernameLoaded, resolvedDisplayName]);

  const contactLabel = contactStatus === 'loading'
    ? 'Завантаження контакту...'
    : (resolvedDisplayTag
      ? `${resolvedDisplayTag}${(contactStatus === 'phone' && contacts) ? ` · ${contacts}` : ''}`
      : (contactStatus === 'phone' && contacts ? contacts : safeDisplayLabel));

  return (
    <div className={styles.modal}>
      <div className={styles.modalCard}>
        <header className={styles.modalHeader}>
          <h3>Створити оголошення</h3>
          <button onClick={onClose}>✕</button>
        </header>
        <form onSubmit={submit} className={styles.modalBody}>
          <label>Заповніть всi обов`язковi поля</label>
          <select value={category} onChange={(e)=>setCategory(e.target.value)} required>
            <option value="" disabled>Оберіть категорію</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* <label>Оберіть локацію</label> */}
          <select value={location} onChange={(e)=>setLocation(e.target.value)} required>
            <option value="" disabled>Оберіть населенний пункт</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
            <option value="other">Інше (ввести вручну)</option>
          </select>
          {location === 'other' && (
            <input
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Введіть свій населений пункт"
              required
            />
          )}

          <label>Опис оголошення</label>
          <div style={{ position: 'relative' }}>
            <textarea value={description} onChange={(e)=>setDescription(e.target.value)} maxLength={666} required />
            {description.length > 0 && (
              <div className={styles.charCounter}>Залишилось {666 - (description.length || 0)} символів.</div>
            )}
          </div>

          {currentUser ? (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 500,  }}>User name:</span>
                <span>
                  {contactStatus === 'loading'
                    ? 'Завантаження контакту...'
                    : (resolvedDisplayTag
                      ? `${resolvedDisplayTag}${(contactStatus === 'phone' && contacts) ? ` · ${contacts}` : ''}`
                      : (contactStatus === 'phone' && contacts ? contacts : 'Контакт недоступний'))}
                </span>
              </div>
              {shareContactSupported && contactStatus !== 'phone' && (
                <button
                  type="button"
                  onClick={handleRequestContact}
                  style={{ marginTop: 8, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  Поделиться контактом
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 500, fontSize:14 }}>Контакт:</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={15}
                  className={styles.manualContactInput}
                  value={manualContact}
                  onChange={(e) => {
                    const digitOnly = e.target.value.replace(/\D/g, '').slice(0, 15);
                    setManualContact(digitOnly);
                  }}
                  placeholder="введи номер телефону"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '10px 14px',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff'
                  }}
                />
              </div>
            </div>
          ) : (
            <div>
              <label style={{ marginBottom: 6, display: 'block' }}>Контакт для зв'язку</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={15}
                  value={manualContact}
                  onChange={(e) => {
                    const digitOnly = e.target.value.replace(/\D/g, '').slice(0, 15);
                    setManualContact(digitOnly);
                  }}
                  placeholder="Введіть номер телефону"
                  required
                  style={{
                    width: '200px',
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgb(18 18 18 / 24%)',
                    color: '#e6f7fb',
                    fontSize: 13
                  }}
                />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
                  TG: {resolvedDisplayTag || safeDisplayLabel}
                </span>
              </div>
            </div>
          )}

          <label>Додати зображення (необов'язково)</label>
          <div className={styles.fileUploadWrap}>
            <input type="file" accept="image/*" onChange={handleFile} />
            {photoError && <div className={styles.fileError}>{photoError}</div>}
            {!photoError && photoStatus && <div className={styles.fileSuccess}>{photoStatus}</div>}
          </div>

          <div className={styles.modalActions}>
            <button type="submit" className={styles.primaryButton}>Надіслати</button>
            <button type="button" onClick={onClose}>Скасувати</button>
          </div>
        </form>
      </div>
    </div>
  );
}