import { useEffect, useState } from 'react';
import CreateAd from './CreateAd.jsx';


const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const categories = ['Транспорт', 'Послуги', 'Робота', 'Нерухомість', 'Товари інше', 'Будівництво', 'Сільгосп', 'Електроніка', 'Меблі', 'Одяг/Взуття'];
const locations = ['Магдалинівка', 'Спаське', 'Підгороднє', 'Котовка'];

function AdCard({ ad }) {
  return (
    <article className="card">
      <div className="card-meta">
        <span className="tag">#{ad.category.toLowerCase().replace(/\s+/g, '_')}</span>
        <span className="tag">#{ad.location.toLowerCase().replace(/\s+/g, '_')}</span>
      </div>
      {ad.img ? <img className="card-image" src={ad.img} alt="ad" /> : null}
      <p className="card-text">{ad.description}</p>
      <div className="card-footer">
        <span>{ad.contacts || 'Контакт не вказано'}</span>
        <span>{new Date(ad.created_at).toLocaleDateString('uk-UA')}</span>
      </div>
    </article>
  );
}

function App() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (category) query.set('category', category);
        if (location) query.set('location', location);
        const response = await fetch(`${API_BASE}/api/ads?${query.toString()}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Не удалось загрузить объявления');
        setAds(data.ads || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category, location]);

  const [showCreate, setShowCreate] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  async function handleCreateSubmit(formData) {
    setStatusMessage({ type: 'info', text: 'Отправка объявления...' });
    try {
      const fd = new FormData();
      fd.append('telegram_id', formData.telegram_id || '');
      fd.append('username', formData.username || '');
      fd.append('category', formData.category);
      fd.append('location', formData.location);
      fd.append('description', formData.description);
      fd.append('contacts', formData.contacts || '');
      fd.append('is_paid', formData.is_paid ? 'true' : 'false');
      if (formData.photo) fd.append('photo', formData.photo, formData.photo.name);

      const res = await fetch(`${API_BASE}/api/ads`, {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка при отправке');
      setStatusMessage({ type: 'success', text: 'Оголошення опубліковано!' });
      setShowCreate(false);
      // optionally reload list
      const response = await fetch(`${API_BASE}/api/ads`);
      const newData = await response.json();
      setAds(newData.ads || []);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Ошибка' });
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">MAG_OBYAVA</p>
          <h1>Последние объявления</h1>
          <p>Фильтруй и подавай новое объявление прямо из Mini-App.</p>
        </div>
        <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
          <button className="primary-button" onClick={() => setShowCreate(true)}>Подать объявление</button>
        </div>
      </header>

      <section className="filters">
        <div className="chips">
          {categories.slice(0, 6).map((item) => (
            <button
              key={item}
              type="button"
              className={item === category ? 'chip active' : 'chip'}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="chips">
          {locations.map((item) => (
            <button
              key={item}
              type="button"
              className={item === location ? 'chip active' : 'chip'}
              onClick={() => setLocation(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <main className="content">
        {statusMessage ? <p className={`status ${statusMessage.type==='error'?'error':''}`}>{statusMessage.text}</p> : null}
        {loading ? <p className="status">Загрузка...</p> : null}
        {error ? <p className="status error">{error}</p> : null}
        {!loading && !ads.length ? <p className="status">Объявления не найдены.</p> : null}
        <div className="cards">
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      </main>

      {showCreate && (
        <CreateAd onClose={()=>setShowCreate(false)} onSubmit={handleCreateSubmit} />
      )}
    </div>
  );
}

export default App;
