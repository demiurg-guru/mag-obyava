import { useEffect, useState } from 'react';
import styles from './CreateAd.module.css';

const categories = ['Транспорт','Послуги','Робота','Нерухомість','Товари інше','Будівництво','Сільгосп','Електроніка','Меблі','Одяг/Взуття'];
const locations = ['Магдалинівка','Спаське','Підгородне','Котовка'];

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

  function handleFile(e) {
    const f = e.target.files?.[0];
    setPhoto(f || null);
  }

  async function refreshContact(telegramUserId) {
    if (!telegramUserId) {
      setContacts('');
      setContactStatus('missing');
      setShareContactSupported(typeof window !== 'undefined' && typeof window.Telegram?.WebApp?.requestContact === 'function');
      return;
    }

    setContactStatus('loading');
    const headers = { 'x-telegram-id': String(telegramUserId) };
    if (initData) headers['X-Telegram-Init-Data'] = initData;
    const shareSupported = typeof window !== 'undefined' && typeof window.Telegram?.WebApp?.requestContact === 'function';
    setShareContactSupported(shareSupported);

    try {
      const res = await fetch('/api/me', { headers });
      const data = await res.json().catch(() => null);
      const user = data?.user;
      const phone = user?.phone || currentUser?.phone || '';
      const username = user?.username || currentUser?.username || '';

      if (phone) {
        setContacts(phone);
        setContactStatus('phone');
        setAskPhone(false);
      } else if (username) {
        setContacts('');
        setContactStatus('username');
        setAskPhone(true);
      } else {
        setContacts('');
        setContactStatus('missing');
        setAskPhone(true);
      }
    } catch (e) {
      setContacts('');
      setContactStatus('missing');
      setShareContactSupported(shareSupported);
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

  function submit(e) {
    e.preventDefault();
    if (!description.trim()) return alert('Введіть опис оголошення');

    const enteredLocation = customLocation.trim();
    const locationValue = location === 'other' ? enteredLocation : (location || enteredLocation);
    if (!locationValue) return alert('Введіть населений пункт');

    const finalContact = manualContact.trim() || contacts;
    if (!finalContact) {
      return alert('Будь ласка, введіть номер телефону для контакту');
    }

    const finalUsername = telegramUser?.username ? telegramUser.username.replace(/^@/, '') : (currentUser?.username ? currentUser.username.replace(/^@/, '') : '');

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

  function handleRequestContact() {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp?.requestContact) {
      return;
    }

    setSharingPhone(true);
    try {
      window.Telegram.WebApp.requestContact((shared) => {
        setSharingPhone(false);
        if (shared?.phone_number) {
          setContacts(shared.phone_number);
          setContactStatus('phone');
          setAskPhone(false);
          setManualContact('');
        } else if (shared) {
          setContacts(shared.phone_number || '');
          setContactStatus(shared.phone_number ? 'phone' : 'missing');
          setAskPhone(!shared.phone_number);
        } else {
          setContactStatus('missing');
          setAskPhone(true);
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

  const contactLabel = contactStatus === 'loading'
    ? 'Завантаження контакту...'
    : ((telegramUser?.username ? `@${telegramUser.username.replace(/^@/, '')}` : (currentUser?.username ? `@${currentUser.username.replace(/^@/, '')}` : ''))
      + ((contactStatus === 'phone' && contacts) ? `${telegramUser?.username || currentUser?.username ? ' · ' : ''}${contacts}` : ''))
      || 'Контакт недоступний';

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
                    : ((telegramUser?.username ? `@${telegramUser.username.replace(/^@/, '')}` : (currentUser?.username ? `@${currentUser.username.replace(/^@/, '')}` : ''))
                      + ((contactStatus === 'phone' && contacts) ? `${telegramUser?.username || currentUser?.username ? ' · ' : ''}${contacts}` : ''))
                      || 'Контакт недоступний'
                  }
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
                  TG: {telegramUser?.username ? telegramUser.username.replace(/^@/, '') : (currentUser?.username ? currentUser.username.replace(/^@/, '') : 'noname')}
                </span>
              </div>
            </div>
          )}

          <label>Додати зображення (необов'язково)</label>
          <input type="file" accept="image/*" onChange={handleFile} />

          <div className={styles.modalActions}>
            <button type="submit" className={styles.primaryButton}>Надіслати</button>
            <button type="button" onClick={onClose}>Скасувати</button>
          </div>
        </form>
      </div>
    </div>
  );
}