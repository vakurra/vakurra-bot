import { useEffect, useState } from "react";

import { api } from "../shared/api/client";

export function App() {
  const [status, setStatus] = useState("Проверяем API…");

  useEffect(() => {
    api.health()
      .then(() => setStatus("API доступен. Каталог готов к развитию."))
      .catch(() => setStatus("API пока недоступен."));
  }, []);

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Telegram Mini App</p>
        <h1>Vakurra</h1>
        <p className="subtitle">Каталог полезных Telegram-ботов</p>
      </section>
      <section className="status-card">
        <strong>Приложение подключено</strong>
        <p>{status}</p>
      </section>
    </main>
  );
}
