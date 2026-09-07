import styles from "./BottomNavigation.module.css";

const navigationItems = [
  { label: "Заглушка", icon: "?" },
  { label: "Поиск", icon: "⌕" },
  { label: "Топ", icon: "🏆" },
  { label: "Добавить", icon: "+" },
  { label: "Вы", icon: "●" },
];

export function BottomNavigation() {
  return (
    <nav className={styles.navigation} aria-label="Основная навигация">
      {navigationItems.map((item, index) => (
        <button
          key={item.label}
          type="button"
          className={`${styles.item} ${index === 2 ? styles.featured : ""}`}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
