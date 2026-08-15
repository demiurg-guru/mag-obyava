const CATEGORIES = [
  'Транспорт',
  'Послуги',
  'Робота',
  'Нерухомість',
  'Товари інше',
  'Будівництво',
  'Сільгосп',
  'Електроніка',
  'Меблі',
  'Одяг/Взуття'
];

const LOCATIONS = [
  'Магдалинівка',
  'Спаське',
  'Підгороднє',
  'Котовка'
];

function validateTelegramId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0;
}

function validateDescription(text) {
  return typeof text === 'string' && text.trim().length > 0 && text.trim().length <= 666;
}

function validateCategory(category) {
  return typeof category === 'string' && CATEGORIES.includes(category);
}

function validateLocation(location) {
  return typeof location === 'string' && LOCATIONS.includes(location.trim());
}

function validateContact(contact) {
  if (typeof contact !== 'string' || !contact.trim()) return false;
  const trimmed = contact.trim();
  if (trimmed.length > 64) return false;
  const phone = trimmed.replace(/[^+\d]/g, '');
  const isPhone = /^\+?\d{7,15}$/.test(phone);
  const isUsername = /^@?[A-Za-z0-9_]{3,32}$/.test(trimmed);
  return isPhone || isUsername;
}

function normalizeContact(contact) {
  if (!contact) {
    return null;
  }
  return String(contact).trim();
}

module.exports = {
  CATEGORIES,
  LOCATIONS,
  validateTelegramId,
  validateDescription,
  validateCategory,
  validateLocation,
  validateContact,
  normalizeContact
};
