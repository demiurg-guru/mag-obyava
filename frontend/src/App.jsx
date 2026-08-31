import { useEffect, useRef, useState } from 'react';
import CreateAd from './CreateAd.jsx';
import styles from './App.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const DEFAULT_CARD_IMAGE = `${import.meta.env.BASE_URL}assets/mag-obyava-banner.jpg`;

const defaultAds = [
  {
    id: "1",
    category: "Послуги",
    location: "Магдалинівка",
    title: "Англiйська мова",
    description: "Англiйська мова",
    contacts: "0972755230",
    // img: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80"
    img: "/mag-obyava/assets/service-5.jpg"
  },
  {
    id: "2",
    category: "Послуги",
    location: "Кам'янське",
    title: "Отримай професiю",
    description: "Отримай професiю",
    contacts: "0675909029",
    // img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
    img: "/mag-obyava/assets/rabota-3.jpg"
  },
  {
    id: "3",
    category: "Послуги",
    location: "Магдалинівка",
    title: "Фiтнес-iнструктор",
    description: "Фiтнес-iнструктор",
    contacts: "0668332277",
    // img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
    img: "/mag-obyava/assets/rabota.jpg"
  },
  {
    id: "4",
    category: "Робота",
    location: "Днiпро",
    title: "Робота на заводi",
    description: "Робота на заводi",
    contacts: "0977214095",
    img: "/mag-obyava/assets/rabota-4.jpg"
  },
  {
    id: "5",
    category: "Транспорт",
    location: "Магдалинівка",
    title: "Автострахуваня",
    description: "Автострахування",
    contacts: "0989163323",
    img: "/mag-obyava/assets/service.jpg"
  },
  {
    id: "6",
    category: "Робота",
    location: "Царичанка",
    title: "Автоэлектрик",
    description: "Автоэлектрик",
    contacts: "0660333775",
    img: "/mag-obyava/assets/service-2.jpg"
  },
  {
    id: "7",
    category: "Транспорт",
    location: "Підгороднє",
    title: "Автовикуп",
    description: "Автовикуп",
    contacts: "0500528056",
    img: "/mag-obyava/assets/service-3.jpg"
  },
  {
    id: "8",
    category: "Послуги",
    location: "Магдалинівка",
    title: "Таксi",
    description: "Таксi.",
    contacts: "0966748475",
    img: "/mag-obyava/assets/service-4.jpg"
  },
  {
    id: "9",
    category: "Сільгосп",
    location: "Магдалинівка",
    title: "Кавуни",
    description: "Кавуни. Замовляйте.",
    contacts: "0966329117",
    img: "/mag-obyava/assets/silgosp-2.jpg"
  },
  {
    id: "10",
    category: "Товари інше",
    location: "Спаське",
    title: "Вугiлля ДГ 30-100",
    description: "Вугiлля ДГ 30-100",
    contacts: "0682630584",
    img: "/mag-obyava/assets/tovary-inshe.jpg"
  },
  {
    id: "11",
    category: "Товари інше",
    location: "Підгороднє",
    title: "Матраци на замовлення",
    description: "Матраци на замовлення",
    contacts: "0666069609",
    img: "/mag-obyava/assets/tovary-inshe-1.jpg"
  },
  {
    id: "12",
    category: "Послуги",
    location: "Магдалинівка",
    title: "мототранспорт",
    description: "Ремонт мотоинструмента та мототранспорту",
    contacts: "380687805357",
    img: "/mag-obyava/assets/trasport-service.jpg"
  
  },
  {
    id: "13",
    category: "Послуги",
    location: "Днiпро",
    title: "Ремонт радіаторів",
    description: "Ремонт радіаторів",
    contacts: "380671974288",
    img: "/mag-obyava/assets/remont-radiatorov.jpg"
  },
  {
    id: "14",
    category: "Сільгосп",
    location: "Самар",
    title: "Доставка мiнеральних добрив",
    description: "Доставка мiнеральних добрив",
    contacts: "380677254090",
    img: "/mag-obyava/assets/dobryva.jpg"
  },
  {
    id: "15",
    category: "Послуги",
    location: "Магдалинівка",
    title: "Барбершоп",
    description: "Барбершоп",
    contacts: "380",
    img: "/mag-obyava/assets/service-7.jpg"
  },
    {
    id: "16",
    category: "Сільгосп",
    location: "Самар",
    title: "Доставка мiнеральних добрив",
    description: "Доставка мiнеральних добрив",
    contacts: "380677254090",
    img: "/mag-obyava/assets/dobryva.jpg"
  },
  {
    id: "17",
    category: "Послуги",
    location: "Днiпро",
    title: "Автоматизацiя рутинних процесiв",
    description: "Автоматизацiя рутинних процесiв",
    contacts: "380",
    img: "/mag-obyava/assets/ai.jpg"
  },
  {
    id: "18",
    category: "Послуги",
    location: "Днiпро",
    title: "Перетяжка карт у термовiнiл",
    description: "Перетяжка карт у термовiнiл",
    contacts: "380634472799",
    img: "/mag-obyava/assets/carty.jpg"
  },
  {
    id: "19",
    category: "Послуги",
    location: "Царичанка",
    title: "Швидке обстеження",
    description: "Швидке обстеження",
    contacts: "380681962346",
    img: "/mag-obyava/assets/obstegenya.jpg"
  },
  {
    id: "20",
    category: "Послуги",
    location: "Царичанка",
    title: "Купую металобрухт",
    description: "Купую металобрухт",
    contacts: "380958759991",
    img: "/mag-obyava/assets/metalolom.jpg"
  },
  {
    id: "21",
    category: "Робота",
    location: "Магдалинівка",
    title: "Потрiбен працiвник",
    description: "Потрiбен працiвник",
    contacts: "380509419248",
    img: "/mag-obyava/assets/robota-yuliya.jpg"
  },
  {
    id: "22",
    category: "Послуги",
    location: "Украина",
    title: "Пансiонат",
    description: "Пансiонат",
    contacts: "380971183997",
    img: "/mag-obyava/assets/pancionat.jpg"
  },
  {
    id: "23",
    category: "Послуги",
    location: "Царичанка",
    title: "Кадастровий номер для вашої земельної дiлянки",
    description: "Кадастровий номер для вашої земельної дiлянки",
    contacts: "380676220993",
    img: "/mag-obyava/assets/poslugy-kadastr.jpg"
  },
  {
    id: "24",
    category: "Робота",
    location: "Царичанка",
    title: "Потрiбнi робiтники на фабрику",
    description: "Потрiбнi робiтники на фабрику",
    contacts: "380994116051",
    img: "/mag-obyava/assets/rabota-fabryk.jpg"
  }
];

function getWordSnippet(text, wordLimit = 10) {
  if (typeof text !== 'string') return '';
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, wordLimit).join(' ');
}

function getContactLink(contact) {
  if (!contact || typeof contact !== 'string') return null;
  const trimmed = contact.trim();
  if (trimmed.startsWith('@')) {
    const username = trimmed.slice(1);
    return `https://t.me/${username}`;
  }
  if (/^\+?\d[\d\s()-]{4,}$/.test(trimmed)) {
    return `tel:${trimmed.replace(/[^+\d]/g, '').replace(/^\+/, '')}`;
  }
  try {
    const url = new URL(trimmed);
    return url.href;
  } catch {
    return `https://${trimmed}`;
  }
}

function parseContactInfo(contact) {
  const result = { telegram: null, phone: null };
  if (!contact || typeof contact !== 'string') return result;

  const trimmed = contact.trim();
  const lower = trimmed.toLowerCase();

  // Telegram link from explicit @username or t.me/... URL
  const telegramUrlMatch = trimmed.match(/(?:https?:\/\/)?(?:t\.me|telegram\.me)\/(?<name>[a-zA-Z0-9_]{5,32})/i);
  if (telegramUrlMatch?.groups?.name) {
    result.telegram = `https://t.me/${telegramUrlMatch.groups.name}`;
  } else {
    const atMatch = trimmed.match(/@([a-zA-Z0-9_]{5,32})/);
    if (atMatch?.[1]) {
      result.telegram = `https://t.me/${atMatch[1]}`;
    } else if (/^[a-zA-Z0-9_]{5,32}$/.test(trimmed) && !/^\+?\d[\d\s()\-]{4,}$/.test(trimmed)) {
      result.telegram = `https://t.me/${trimmed}`;
    }
  }

  const phoneMatch = trimmed.match(/(\+?\d[\d\s()\-]{4,}\d)/);
  if (phoneMatch?.[1]) {
    const cleaned = phoneMatch[1].replace(/[^+\d]/g, '');
    if (/^\+?\d{7,15}$/.test(cleaned)) {
      result.phone = `tel:${cleaned.replace(/^\+/, '')}`;
    }
  }

  // If phone not found and contact is all digits with optional punctuation
  if (!result.phone) {
    const onlyDigits = trimmed.replace(/[^+\d]/g, '');
    if (/^\+?\d{7,15}$/.test(onlyDigits)) {
      result.phone = `tel:${onlyDigits.replace(/^\+/, '')}`;
    }
  }

  return result;
}

function getTelegramInitData() {
  // Raw signed string Telegram provides — this is what the backend verifies.
  // (initDataUnsafe is the parsed-but-unverified version, used elsewhere for display only.)
  return typeof window !== 'undefined' ? (window.Telegram?.WebApp?.initData || null) : null;
}

function parseTelegramInitDataUser(initData) {
  if (!initData || typeof initData !== 'string') return null;

  try {
    const params = new URLSearchParams(initData);
    const rawUser = params.get('user');
    if (!rawUser) return null;
    const parsed = JSON.parse(rawUser);
    if (!parsed || !parsed.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function normalizeAd(ad) {
  if (!ad || typeof ad !== 'object') return null;
  const rawImg = ad.img || ad.photo_url || null;
  const hasValidImg = rawImg && rawImg !== 'null' && rawImg !== 'undefined' && String(rawImg).trim() !== '';
  return {
    ...ad,
    id: String(ad.id ?? Date.now()),
    title: ad.title || ad.description || '',
    description: ad.description || ad.title || '',
    contacts: ad.contacts || ad.contact || '',
    username: ad.username || null,
    category: ad.category || 'Інше',
    location: ad.location || 'Невідомо',
    img: hasValidImg ? rawImg : DEFAULT_CARD_IMAGE
  };
}

function AdCard({ ad, index, onClick }) {
  const categoryTag = `#${((ad.category || '').split(' ')[0] || '').toLowerCase()}`;
  const locationTag = '#' + (((ad.location || 'місто').split(' ')[0]) || 'місто').toLowerCase();
  const cardStyle = {
    '--border-delay': `${index * -2.2}s`,
    animationDelay: `${index * -2.2}s`
  };
  const cardText = getWordSnippet(ad.description || ad.title || '', 10) || 'Немає опису оголошення';
  const imgUrl = ad.img && ad.img !== 'null' && ad.img !== 'undefined' && String(ad.img).trim() !== '' 
    ? ad.img 
    : DEFAULT_CARD_IMAGE;

  return (
    <article className={styles.card} style={{ ...cardStyle, cursor: 'pointer' }} onClick={onClick}>
      <div className={styles.cardImage} style={{ '--card-image': `url(${imgUrl})` }}>
        <div className={styles.cardTags}>
          <span className={`${styles.cardTag} ${styles.purple}`}>{categoryTag}</span>
          <span className={`${styles.cardTag} ${styles.blue}`}>{locationTag}</span>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitle}>{cardText}</div>
        <div className={styles.cardInfo}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {ad.location}
          <br />
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span className={styles.cardContact}>{ad.contacts}</span>
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const categories = ['Транспорт','Послуги','Робота','Нерухомість','Товари інше','Будівництво','Сільгосп','Електроніка','Меблі','Одяг/Взуття', 'Тварини'];
  // const locations = ['Магдалинівка','Спаське','Підгороднє','Котовка'];  
  const locations = ['Магдалинівка', 'Приорільське', 'Олександрівка', 'Бузівка', 'Великокозирщина', 'Веселе', 'Веселий Гай', 'Виноградівка', 'Вишневе', 'Водяне', 'Гавришівка', 'Грабки', 'Гупалівка', 'Деконка', 'Дмухайлівка', 'Дубравка', 'Дудківка', 'Євдокиївка', 'Жданівка', 'Заплавка', 'Запоріжжя', 'Зоряне', 'Іванівка', 'Йосипівка', 'Казначеївка', 'Калинівка', 'Кільчень', 'Колпаківка', 'Котовка', 'Крамарка', 'Краснопілля', 'Кременівка', 'Личкове', 'Малоандріївка', "Мар'ївка", 'Минівка', 'Мусієнкове', 'Нововасилівка', 'Новоіванівка', 'Новопетрівка', 'Новоспаське', 'Оленівка', 'Очеретувате', 'Першотравенка', 'Поливанівка', 'Почино-Софіївка', 'Приют', 'Січкарівка', 'Степанівка', 'Тарасівка', 'Тарасо-Шевченківка', 'Топчине', 'Трудолюбівка', 'Чернеччина', 'Шевське', 'Шевченківка'];


  function getBrowserFallbackUser() {
    if (typeof window === 'undefined') return null;

    try {
      const saved = window.localStorage.getItem('mag-obyava-browser-user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) return parsed;
      }
    } catch {}

    const fallbackId = Number(String(Date.now()).slice(-9));
    const fallbackUser = { id: fallbackId, username: `browser${fallbackId}` };

    try {
      window.localStorage.setItem('mag-obyava-browser-user', JSON.stringify(fallbackUser));
    } catch {}

    return fallbackUser;
  }

  function getEffectiveTelegramUser() {
    const url = new URL(window.location.href);
    const mockTg = url.searchParams.get('mock_tg') === '1';
    const mockUsername = url.searchParams.get('mock_tg_username') || null;
    const mockUserId = url.searchParams.get('mock_tg_user_id') || null;

    if (mockTg) {
      return { id: mockUserId || '123456', username: mockUsername || 'mockuser' };
    }

    const initDataUser = parseTelegramInitDataUser(getTelegramInitData());
    if (initDataUser) return initDataUser;
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
      return window.Telegram.WebApp.initDataUnsafe.user;
    }
    return getBrowserFallbackUser();
  }

  async function loadCurrentUserInfo(tgUser) {
    const initData = getTelegramInitData();
    const initDataUser = parseTelegramInitDataUser(initData);
    const resolvedUser = tgUser || initDataUser || null;
    
    if (!resolvedUser?.id) {
      setUserLoaded(true);
      return;
    }
    
    const headers = { 'x-telegram-id': String(resolvedUser.id) };
    if (initData) headers['X-Telegram-Init-Data'] = initData;

    try {
      // const res = await fetch(`${API_BASE}/api/me`, { headers });
      const res = await fetch(`${API_BASE}/api/me`, { headers, cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Не вдалося перевірити користувача: HTTP ${res.status}`);
      }
      const data = await res.json().catch(() => null);
      const serverUser = data?.user || null;
      // Priority: initData username > server username > first_name
      const safeUsername = resolvedUser.username || serverUser?.username || resolvedUser.first_name || null;
      const updatedUser = {
        telegram_user_id: resolvedUser.id,
        username: safeUsername,
        first_name: resolvedUser.first_name || serverUser?.first_name || null,
        phone: serverUser?.phone || null,
        free_ad_used: !!serverUser?.free_ad_used
      };
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('loadCurrentUserInfo failed:', error);
      return null;
    } finally {
      setUserLoaded(true);
    }
  }

  const [ads, setAds] = useState(defaultAds);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [tgStatus, setTgStatus] = useState({ available: false, user: null });
  const [loading, setLoading] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const categoryStripRef = useRef(null);
  const categoryThumbRef = useRef(null);
  const locationStripRef = useRef(null);
  const locationThumbRef = useRef(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const closeTimeoutRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [postedAdLink, setPostedAdLink] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const screenRef = useRef(null);
  const [showPromo, setShowPromo] = useState(false);
  const [promoUser, setPromoUser] = useState(null);
  const [imgOrientation, setImgOrientation] = useState('landscape');

  useEffect(() => {
    window.Telegram?.WebApp?.ready();
    window.Telegram?.WebApp?.expand();
  }, []);

  function resetSearch() {
    setSearchText('');
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
    setShowSearchPanel(false);
    setShowCategoryPicker(false);
    setShowLocationPicker(false);
  }

  function getUserIdentity() {
    if (!currentUser) return 'клієнт';
    if (currentUser.username) return `@${currentUser.username.replace(/^@/, '')}`;
    if (currentUser.phone) return currentUser.phone;
    return currentUser.telegram_user_id ? String(currentUser.telegram_user_id) : 'клієнт';
  }

  function getPromoTitle() {
    const userForPromo = promoUser || currentUser;
    const identity = userForPromo?.username
      ? `@${userForPromo.username.replace(/^@/, '')}`
      : userForPromo?.phone || userForPromo?.telegram_user_id || 'клієнт';
    if (userForPromo?.free_ad_used) {
      return (
        <div className={styles['promo-message']}>
          <p className={styles['promo-message-txt']}>
            Шановний, {identity}, на жаль, ліміт безкоштовних оголошень вичерпано. 
            Ви можете на 14 днів розмістити платне оголошення вартістю 29 грн.
          </p>
          <img src="/mag-obyava/assets/pet-fond.jpg" alt="Платне оголошення" className={styles['promo-message-image']} />
          <p className={styles['promo-message-motivation']}>
            Ваша оплата підтримує фонд допомоги тваринам, які потребують турботи
          </p>
        </div>
      );
    }
    // return `Шановний, ${identity}, ви можете розмістити одне безкоштовне оголошення на 5 днів.`;
    return (
      <div className={styles['promo-message']}>
        {/* <img src="/assets/app-bg.jpg" alt="Безкоштовне оголошення" className="promo-message-image" /> */}
        <p className={styles['promo-message-txt']}>
          Шановний, {identity}.
        </p>
         <p className={styles['promo-message-txt']}>
          Ви можете розмістити одне безкоштовне оголошення на 5 днів.
        </p>
      </div>
    );
  }

  async function handleAddClick() {
    if (!userLoaded) {
      setStatusMessage({ type: 'info', text: 'Зачекайте, іде перевірка користувача...' });
      return;
    }
    setPromoUser(null);
    const checkedUser = await loadCurrentUserInfo(getEffectiveTelegramUser());
    if (!checkedUser) {
      setStatusMessage({ type: 'error', text: 'Не вдалося перевірити ліміт оголошень. Спробуйте ще раз.' });
      return;
    }
    setPromoUser(checkedUser);
    setStatusMessage(null);
    setShowPromo(true);
  }

  function handleClosePromo() {
    setShowPromo(false);
    setShowCreate(false);
  }

  function handleProceedCreate() {
    setShowPromo(false);
    setShowCreate(true);
  }

  useEffect(() => {
    const strips = [
      { strip: categoryStripRef.current, thumb: categoryThumbRef.current },
      { strip: locationStripRef.current, thumb: locationThumbRef.current }
    ].filter(({ strip, thumb }) => strip && thumb);

    if (!strips.length) return;

    let dragging = false;
    let activeStrip = null;
    let activeThumb = null;
    let thumbStartX = 0;
    let thumbStartLeft = 0;

    const updateThumb = (strip, thumb) => {
      const { scrollWidth, clientWidth, scrollLeft } = strip;
      const ratio = clientWidth / scrollWidth;
      const thumbWidth = Math.max(ratio * clientWidth, 40);
      const maxLeft = clientWidth - thumbWidth;
      const left = (scrollLeft / (scrollWidth - clientWidth)) * maxLeft || 0;
      thumb.style.width = thumbWidth + 'px';
      thumb.style.transform = `translateX(${left}px)`;
    };

    const onWindowResize = () => strips.forEach(({ strip, thumb }) => updateThumb(strip, thumb));

    const onDocumentPointerMove = (e) => {
      if (!dragging || !activeStrip || !activeThumb) return;
      const dx = e.clientX - thumbStartX;
      const { clientWidth, scrollWidth } = activeStrip;
      const thumbWidth = Math.max((clientWidth / scrollWidth) * clientWidth, 40);
      const maxLeft = clientWidth - thumbWidth;
      const newLeft = Math.min(Math.max(thumbStartLeft + dx, 0), maxLeft);
      activeStrip.scrollLeft = maxLeft > 0 ? (newLeft / maxLeft) * (scrollWidth - clientWidth) : 0;
      updateThumb(activeStrip, activeThumb);
    };

    const onDocumentPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      if (activeThumb) activeThumb.style.transition = '';
      document.body.style.userSelect = '';
      activeStrip = null;
      activeThumb = null;
    };

    const listeners = [];
    strips.forEach(({ strip, thumb }) => {
      const onStripScroll = () => updateThumb(strip, thumb);
      const onThumbPointerDown = (e) => {
        e.stopPropagation();
        dragging = true;
        activeStrip = strip;
        activeThumb = thumb;
        thumbStartX = e.clientX;
        const m = (thumb.style.transform || '').match(/translateX\(([-0-9.]+)px\)/);
        thumbStartLeft = m ? parseFloat(m[1]) : 0;
        thumb.style.transition = 'none';
        document.body.style.userSelect = 'none';
        thumb.setPointerCapture?.(e.pointerId);
      };

      strip.addEventListener('scroll', onStripScroll, { passive: true });
      thumb.addEventListener('pointerdown', onThumbPointerDown);
      listeners.push({ strip, onStripScroll, thumb, onThumbPointerDown });
      updateThumb(strip, thumb);
    });

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('pointermove', onDocumentPointerMove);
    window.addEventListener('pointerup', onDocumentPointerUp);

    return () => {
      listeners.forEach(({ strip, onStripScroll, thumb, onThumbPointerDown }) => {
        strip.removeEventListener('scroll', onStripScroll);
        thumb.removeEventListener('pointerdown', onThumbPointerDown);
      });
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('pointermove', onDocumentPointerMove);
      window.removeEventListener('pointerup', onDocumentPointerUp);
    };
  }, [showCategoryPicker, showLocationPicker]);

  useEffect(() => {
    const screenEl = screenRef.current;
    if (!screenEl) return;
    const onScroll = () => setIsScrolled(screenEl.scrollTop > 16);
    screenEl.addEventListener('scroll', onScroll, { passive: true });
    return () => screenEl.removeEventListener('scroll', onScroll);
  }, []);

  const apiAds = (Array.isArray(ads) ? ads : []).filter((a) => String(a.id || '').startsWith('api-'));
  const demoAds = defaultAds.map(normalizeAd).filter(Boolean);
  const visibleAds = [...apiAds, ...demoAds].filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || [a.title, a.description, a.category, a.location].some((f) => (f || '').toLowerCase().includes(q));
  }).slice(0, 100);

  const hasActiveSearch = Boolean(searchQuery.trim()) || Boolean(selectedCategory) || Boolean(selectedLocation);
  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
  const headerInfoText = hasActiveSearch
    ? `Знайдено: ${visibleAds.length}${visibleAds.length < ads.length ? ' на сьогоднi з ' + ads.length : ''}`
    : `ТОП-${ads.length}`;
  const headerInfoRightText = `Оголошення ${formattedDate}`;

  async function loadAds({ showSpinner = false } = {}) {
    if (showSpinner) setLoading(true);
    const tgUser = getEffectiveTelegramUser();
    const hasTelegramUser = typeof window !== 'undefined' && Boolean(getEffectiveTelegramUser()?.id);

    if (hasTelegramUser) {
      setTgStatus({ available: true, user: tgUser });
      await loadCurrentUserInfo(tgUser);
    } else {
      setCurrentUser(null);
      setTgStatus({ available: false, user: null });
      setUserLoaded(true);
    }

    const headers = {};
    const effectiveUser = getEffectiveTelegramUser();
    if (effectiveUser?.id) headers['x-telegram-id'] = String(effectiveUser.id);
    const initData = getTelegramInitData();
    if (initData) headers['X-Telegram-Init-Data'] = initData;

    try {
      const res = await fetch(`${API_BASE}/api/ads`, { headers });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        const serverAds = Array.isArray(data?.ads) ? data.ads : [];
        const serverAdsNormalized = serverAds.map((ad) => ({ ...normalizeAd(ad), id: `api-${ad.id}` })).filter(Boolean);
        setAds(serverAdsNormalized.length ? serverAdsNormalized : defaultAds);
      } else {
        setAds(defaultAds);
      }
    } catch (e) {
      setAds(defaultAds);
    } finally {
      if (showSpinner) setLoading(false);
      setUserLoaded(true);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!mounted) return;
      await loadAds({ showSpinner: false });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && !loading) {
        loadAds({ showSpinner: false });
      }
    }

    init();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  async function handleCreateSubmit(formData) {
    setStatusMessage({ type: 'info', text: 'Відправка оголошення...' });
    setPostedAdLink(null);
    setShowCreate(false);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach((k) => {
        const value = formData[k];
        if (value !== null && value !== undefined) fd.append(k, value);
      });

      // CRITICAL: Always use fresh user data from initData, not stale state
      const initData = getTelegramInitData();
      const initDataUser = parseTelegramInitDataUser(initData);
      const effectiveUser = initDataUser || getEffectiveTelegramUser();
      
      if (!effectiveUser?.id) {
        throw new Error('Не вдалось визначити користувача. Спробуйте переоткрити додаток.');
      }

      if (effectiveUser?.id) {
        setCurrentUser({
          username: effectiveUser.username || effectiveUser.first_name || null,
          first_name: effectiveUser.first_name || null,
          telegram_user_id: effectiveUser.id,
          phone: null,
          free_ad_used: !!currentUser?.free_ad_used
        });
      }

      const headers = {};
      if (effectiveUser?.id) headers['x-telegram-id'] = String(effectiveUser.id);
      // CRITICAL: Always send initData so backend can verify the user
      if (initData) {
        headers['X-Telegram-Init-Data'] = initData;
      } else {
        console.warn('WARNING: initData is missing, backend cannot verify Telegram user');
      }
      
      const res = await fetch(`${API_BASE}/api/ads`, { method: 'POST', headers, body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Помилка публікації');
      
      const created = data?.ad;
      const adId = created?.id || data?.ad_id;
      const telegramLink = data?.telegram_link || null;

      if (created) {
        const newAd = {
          id: `api-${created.id}`,
          category: created.category || formData.category,
          location: created.location || formData.location,
          title: created.title || formData.description || '',
          description: created.description || formData.description || '',
          contacts: created.contacts || formData.contacts || '',
          username: created.username || formData.username || null,
          img: created.img || (formData.photo ? URL.createObjectURL(formData.photo) : null)
        };
        setAds((prevAds) => [newAd, ...prevAds]);
      }
      
      // Only reload user info to get updated free_ad_used flag, don't reload all ads
      if (currentUser?.telegram_user_id) {
        await loadCurrentUserInfo(effectiveUser);
      }

      setStatusMessage({
        type: 'success',
        text: 'Ваше оголошення опубліковано.'
      });
      setPostedAdLink(telegramLink || (adId ? `${window.location.origin}/?ad=${adId}` : null));
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Оголошення не опубліковано: ' + (err.message || 'Помилка') });
    }
  }

  function closeModal() {
    if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    setIsModalClosing(true);
    closeTimeoutRef.current = window.setTimeout(() => {
      setSelectedAd(null);
      setIsModalClosing(false);
      setImgOrientation('landscape');
      closeTimeoutRef.current = null;
    }, 220);
  }

  return (
    <div className={styles.page}>
      <div className={styles.device}>
        <div className={styles.screen} ref={screenRef}>
          <div className={`${styles.header}${isScrolled ? ' ' + styles.headerShrink : ''}`}>
            <div className={styles.title} onClick={resetSearch} role="button" tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                resetSearch();
              }
            }}>MAG_OBYAVA</div>
            <div className={styles.subtitle}>Дошка оголошень смт Магдалинівка</div>
            <div className={styles.topRow}>
              <div className={styles.search}>
                <button className={styles.searchButton} onClick={() => setShowSearchPanel((v) => !v)}>Пошук</button>
              </div>
              <button className={styles.btnAdd} onClick={handleAddClick}>Подати оголошення</button>
            </div>
            {showSearchPanel && (
              <div className={styles.searchPanel}>
                <div className={styles.searchRow} onClick={() => { setShowCategoryPicker((v) => !v); setShowLocationPicker(false); }}>
                  {selectedCategory ? `Вибрана категория: ${selectedCategory}` : 'Шукати за категоріями'}
                </div>
                {showCategoryPicker && (
                  <div className={styles.categoriesWrap}>
                    <div className={styles.categoriesStrip} ref={categoryStripRef}>
                      {categories.map((c) => (
                        <button key={c} className={`${styles.categoryItem} ${selectedCategory === c ? styles.active : ''}`} onClick={() => { setSelectedCategory(c); setSearchQuery(c); setSelectedLocation(''); }}>
                          {c}
                        </button>
                      ))}
                    </div>
                    <div className={styles.customScrollbar} aria-hidden>
                      <div className={styles.customScrollbarThumb} ref={categoryThumbRef}></div>
                    </div>
                  </div>
                )}

                <div className={styles.searchRow} onClick={() => { setShowLocationPicker((v) => !v); setShowCategoryPicker(false); }}>
                  {selectedLocation ? `Вибрана локація: ${selectedLocation}` : 'Шукати за локацією'}
                </div>
                {showLocationPicker && (
                  <div className={styles.categoriesWrap}>
                    <div className={styles.categoriesStrip} ref={locationStripRef}>
                      {locations.map((l) => (
                        <button key={l} className={`${styles.categoryItem} ${selectedLocation === l ? styles.active : ''}`} onClick={() => { setSelectedLocation(l); setSearchQuery(l); setSelectedCategory(''); }}>
                          {l}
                        </button>
                      ))}
                    </div>
                    <div className={styles.customScrollbar} aria-hidden>
                      <div className={styles.customScrollbarThumb} ref={locationThumbRef}></div>
                    </div>
                  </div>
                )}

                <div className={styles.searchRow}>
                  <input className={styles.searchInputInline} placeholder="Введіть текст для пошуку" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                  <button className={styles.categoryItem} onClick={() => { setSearchQuery(searchText); setShowSearchPanel(false); }}>Пошук</button>
                </div>
                <div className={styles.searchActions}>
                  <button className={styles.resetButtonSecondary} onClick={resetSearch}>Скинути пошук</button>
                </div>
              </div>
            )}
            <div className={styles.headerInfo}>
              <span>{headerInfoText}</span>
              <span>{headerInfoRightText}</span>
            </div>
          </div>

          {statusMessage && !showPromo && (
            <div className={`${styles.status} ${styles[statusMessage.type]}`}>
              <div>{statusMessage.text}</div>
              {postedAdLink && (
                <div style={{ marginTop: 4 }}>
                  <a href={postedAdLink} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                    Перейти до оголошення
                  </a>
                </div>
              )}
            </div>
          )}
          {loading && !showPromo && <div className={styles.status}>Завантаження...</div>}

          <div className={styles.grid}>
            {visibleAds.map((ad, index) => (
              <AdCard key={ad.id} ad={ad} index={index} onClick={() => setSelectedAd(ad)} />
            ))}
          </div>

          <footer className={styles.footer}>
            <div className={styles.footerContent}>
              <div className={styles.footerSection}>
                <h3 className={styles.footerTitle}>MAG_OBYAVA</h3>
                <p className={styles.footerText}>Дошка оголошень смт Магдалинівка</p>
              </div>
              <div className={styles.footerSection}>
                <p className={styles.footerText}>© {new Date().getFullYear()} Усі права захищені</p>
              </div>
            </div>
          </footer>

          {showPromo && (
            <div className={styles.promoModalOverlay}>
              <div className={styles.promoCard}>
                <div className={styles.promoText}>{getPromoTitle()}</div>
                <div className={styles.promoActions}>
                  {(promoUser || currentUser)?.free_ad_used ? (
                    <button className={styles.primaryButton} onClick={() => setStatusMessage({ type: 'info', text: 'Оплата наразі не налаштована.' })}>
                      Оплатити
                    </button>
                  ) : (
                    <button className={styles.primaryButton} onClick={handleProceedCreate}>
                      Створити оголошення
                    </button>
                  )}
                  <button className={styles.resetButtonSecondary} onClick={handleClosePromo}>
                    Повернутись
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateAd
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateSubmit}
          currentUser={currentUser}
          telegramUser={tgStatus.user}
          initData={getTelegramInitData()}
          mode={currentUser?.free_ad_used ? 'paid' : 'free'}
          onPay={() => setStatusMessage({ type: 'info', text: 'Оплата наразі не налаштована.' })}
        />
      )}
      {selectedAd && (() => {
        const contactInfo = parseContactInfo(selectedAd.contacts);
        const telegramLink = contactInfo.telegram || (selectedAd.username ? `https://t.me/${String(selectedAd.username).replace(/^@/, '')}` : null);
        
        const handleImageLoad = (e) => {
          const img = e.target;
          const orientation = img.naturalHeight > img.naturalWidth ? 'portrait' : 'landscape';
          setImgOrientation(orientation);
        };

        return (
          <div
            className={`${styles.previewModal}${isModalClosing ? ' ' + styles.previewModalClosing : ''}`}
            onClick={closeModal}
          >
            <div className={styles.previewModalFrame} onClick={(e) => e.stopPropagation()}>
              <button className={styles.previewModalClose} onClick={closeModal} aria-label="Закрити">✕</button>

              <article className={`${styles.card} ${styles.previewCard}`}>
                <div className={`${styles.cardImage} ${styles.previewModalImage} ${styles[`previewModalImage_${imgOrientation}`]}`}>
                  <img 
                    src={selectedAd.img || DEFAULT_CARD_IMAGE} 
                    alt={selectedAd.title}
                    className={styles.previewImg}
                    onLoad={handleImageLoad}
                  />
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.previewDescription}>{selectedAd.description}</div>
                  <div className={styles.cardInfo}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {selectedAd.location}
                    <br />
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    {selectedAd.contacts}
                  </div>

                  <div className={styles.contactRow}>
                    {/* <span className={styles.contactLabel}>Зв'язатись:</span> */}
                    <div className={styles.contactActions}>
                      {telegramLink && (
                        <a
                          className={`${styles.contactActionButton} ${styles.writeButton}`}
                          href={telegramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Написати
                        </a>
                      )}
                      {contactInfo.phone && (
                        <a
                          className={`${styles.contactActionButton} ${styles.callButton}`}
                          href={contactInfo.phone}
                        >
                          Подзвонити
                        </a>
                      )}
                      {!telegramLink && !contactInfo.phone && (
                        <span className={styles.contactValue}>не вказано</span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
