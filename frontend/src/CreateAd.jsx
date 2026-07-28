import { useState } from 'react';

const categories = ['Транспорт','Послуги','Робота','Нерухомість','Товари інше','Будівництво','Сільгосп','Електроніка','Меблі','Одяг/Взуття'];
const locations = ['Магдалинівка','Спаське','Підгороднє','Котовка'];

export default function CreateAd({ onClose, onSubmit }) {
  const [category, setCategory] = useState(categories[0]);
  const [location, setLocation] = useState(locations[0]);
  const [description, setDescription] = useState('');
  const [contacts, setContacts] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  function handleFile(e) {
    const f = e.target.files?.[0];
    setPhoto(f || null);
  }

  function submit(e) {
    e.preventDefault();
    if (!description.trim()) return alert('Введите описание');
    onSubmit({ category, location, description, contacts, photo, is_paid: isPaid });
  }

  return (
    <div className="modal">
      <div className="modal-card">
        <header className="modal-header">
          <h3>Создать объявление</h3>
          <button onClick={onClose}>✕</button>
        </header>
        <form onSubmit={submit} className="modal-body">
          <label>Категория</label>
          <select value={category} onChange={(e)=>setCategory(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label>Город</label>
          <select value={location} onChange={(e)=>setLocation(e.target.value)}>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
            <option value="other">Другое (ввести вручную)</option>
          </select>

          <label>Описание (макс 666)</label>
          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} maxLength={666} />

          <label>Контакт (username или телефон)</label>
          <input value={contacts} onChange={(e)=>setContacts(e.target.value)} />

          <label>Фото (опционально)</label>
          <input type="file" accept="image/*" onChange={handleFile} />

          <label>
            <input type="checkbox" checked={isPaid} onChange={(e)=>setIsPaid(e.target.checked)} /> Платное размещение
          </label>

          <div className="modal-actions">
            <button type="submit" className="primary-button">Отправить</button>
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}
