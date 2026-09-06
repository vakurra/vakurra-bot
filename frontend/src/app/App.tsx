import { useEffect, useState } from "react";

import { SplashScreen } from "./SplashScreen";
import { api } from "../shared/api/client";

const MINIMUM_SPLASH_TIME = 1000;

export function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [status, setStatus] = useState("Проверяем API…");

  useEffect(() => {
    let cancelled = false;

    async function initializeApp() {
      const minimumSplashTime = new Promise<void>((resolve) => {
        setTimeout(resolve, MINIMUM_SPLASH_TIME);
      });

      try {
        await Promise.all([
          api.health(),
          minimumSplashTime,
        ]);

        if (!cancelled) {
          setStatus("API доступен. Каталог готов к развитию.");
        }
      } catch {
        if (!cancelled) {
          setStatus("API пока недоступен.");
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    }

    initializeApp();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isInitializing) {
    return <SplashScreen />;
  }

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
