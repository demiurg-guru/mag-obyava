import styles from './PaymentPage.module.css';

const paymentMethods = [
  { id: 'google-pay', icon: 'G', title: 'Google Pay', description: 'Швидка оплата через Google Pay' },
  { id: 'telegram-wallet', icon: 'W', title: 'Telegram Wallet', description: 'Оплата криптогаманцем у Telegram' },
  { id: 'card', icon: '▣', title: 'Банківська картка', description: 'Visa, Mastercard та інші картки' },
  { id: 'monobank', icon: 'М', title: 'monobank', description: 'Підтвердження в застосунку monobank' },
  { id: 'apple-pay', icon: '', title: 'Apple Pay', description: 'Швидка оплата через Apple Pay' }
];

export default function PaymentPage({ amount = 29, onBack, onSelect }) {
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="payment-title">
        <button className={styles.backButton} type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> Назад
        </button>

        <div className={styles.heading}>
          <span className={styles.eyebrow}>Публікація оголошення</span>
          <h1 id="payment-title">Оберіть спосіб оплати</h1>
          <p>Оголошення буде активним протягом 14 днів.</p>
        </div>

        <div className={styles.amount}>
          <span>До сплати</span>
          <strong>{amount} грн</strong>
        </div>

        <div className={styles.methods}>
          {paymentMethods.map((method) => (
            <button
              className={styles.method}
              key={method.id}
              type="button"
              onClick={() => onSelect(method)}
            >
              <span className={`${styles.methodIcon} ${styles[`icon-${method.id}`]}`} aria-hidden="true">
                {method.icon}
              </span>
              <span className={styles.methodText}>
                <strong>{method.title}</strong>
                <small>{method.description}</small>
              </span>
              <span className={styles.arrow} aria-hidden="true">›</span>
            </button>
          ))}
        </div>

        <p className={styles.note}>Платіж захищено. Після вибору ви перейдете до безпечної оплати.</p>
      </section>
    </main>
  );
}
